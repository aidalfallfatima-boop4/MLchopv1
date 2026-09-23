import { useEffect } from "react";

import { createStore } from "./createStore";
import {
  assignDelivery,
  getOrders,
  updateOrderStatus,
  useOrderStore,
} from "./orderStore";
import { getCurrentAccount, useCurrentAccount } from "./authStore";
import { MissionPhase, Order } from "../types";
import { AVAILABLE_DELIVERY_STATUSES } from "../utils/orderLabels";
import {
  LocationSubscription,
  PositionUpdate,
  watchPosition,
} from "../services/location";
import { pushNotification } from "./notificationStore";
import { deleteDoc, docRef, setDoc, subscribeDoc } from "../services/firebase/firestore";

const DELIVERY_TRACKING_COLLECTION = "deliveryTracking";

const missionId = createStore<string | null>(null);

export const useMissionId = missionId.useStore;

/**
 * Position GPS réelle du livreur (device du rôle "Livreur"), partagée via ce
 * store en mémoire : dès que le rôle bascule sur "Client" dans la même
 * session, l'écran de suivi de commande lit directement cette valeur.
 */
export type DriverGeoStatus = "idle" | "requesting" | "tracking" | "denied";

export type DriverPositionState = {
  status: DriverGeoStatus;
  position: PositionUpdate | null;
  updatedAt: number | null;
};

const driverPosition = createStore<DriverPositionState>({
  status: "idle",
  position: null,
  updatedAt: null,
});

export const getDriverPosition = driverPosition.getState;

let activeSubscription: LocationSubscription | null = null;

export async function startDriverTracking(): Promise<DriverGeoStatus> {
  if (driverPosition.getState().status === "tracking") {
    return "tracking";
  }

  driverPosition.setState((current) => ({ ...current, status: "requesting" }));

  const subscription = await watchPosition((position) => {
    const updatedAt = Date.now();
    driverPosition.setState({ status: "tracking", position, updatedAt });

    // Publie la position pour que le CLIENT (autre appareil) puisse suivre la
    // livraison en direct — voir useDriverPosition() plus bas.
    const orderId = missionId.getState();
    if (orderId) {
      setDoc(docRef(DELIVERY_TRACKING_COLLECTION, orderId), { position, updatedAt }).catch(
        (error) => {
          if (__DEV__) console.warn("[deliveryStore] tracking publish failed:", error);
        }
      );
    }
  });

  if (!subscription) {
    driverPosition.setState((current) => ({ ...current, status: "denied" }));
    return "denied";
  }

  activeSubscription = subscription;
  return "tracking";
}

export function stopDriverTracking() {
  activeSubscription?.remove();
  activeSubscription = null;
  driverPosition.setState({ status: "idle", position: null, updatedAt: null });
}

export function clearMission() {
  const orderId = missionId.getState();
  if (orderId) {
    deleteDoc(docRef(DELIVERY_TRACKING_COLLECTION, orderId)).catch(() => {});
  }
  missionId.setState(null);
  missionPhase.setState("assigned");
  stopDriverTracking();
}

// ---------------------------------------------------------------------------
// Lecture de la position par un appareil qui n'est PAS le livreur (client,
// vendeur, admin) : écoute Firestore plutôt que le GPS local de l'appareil.
// ---------------------------------------------------------------------------

const remoteDriverPosition = createStore<DriverPositionState>({
  status: "idle",
  position: null,
  updatedAt: null,
});

let unsubscribeRemoteTracking: (() => void) | null = null;
let trackedOrderId: string | null = null;

function setTrackedOrder(orderId: string | null) {
  if (orderId === trackedOrderId) return;
  trackedOrderId = orderId;

  unsubscribeRemoteTracking?.();
  unsubscribeRemoteTracking = null;
  remoteDriverPosition.setState({ status: "idle", position: null, updatedAt: null });

  if (!orderId) return;

  remoteDriverPosition.setState((current) => ({ ...current, status: "requesting" }));
  unsubscribeRemoteTracking = subscribeDoc<{ position: PositionUpdate; updatedAt: number }>(
    DELIVERY_TRACKING_COLLECTION,
    orderId,
    (doc) => {
      remoteDriverPosition.setState(
        doc
          ? { status: "tracking", position: doc.position, updatedAt: doc.updatedAt }
          : { status: "idle", position: null, updatedAt: null }
      );
    },
    () => remoteDriverPosition.setState({ status: "denied", position: null, updatedAt: null })
  );
}

/**
 * Position à afficher pour une commande donnée : le GPS local si je suis le
 * livreur en mission sur CETTE commande (comportement historique inchangé),
 * sinon la position que ce livreur publie dans Firestore — vrai suivi
 * multi-appareils (client sur son téléphone, livreur sur le sien).
 */
export function useDriverPosition(orderId?: string | null): DriverPositionState {
  const account = useCurrentAccount();
  const isMyOwnMission = account?.role === "delivery" && (!orderId || orderId === missionId.getState());

  const local = driverPosition.useStore();
  const remote = remoteDriverPosition.useStore();

  useEffect(() => {
    if (!isMyOwnMission) {
      setTrackedOrder(orderId ?? null);
    }
  }, [isMyOwnMission, orderId]);

  return isMyOwnMission ? local : remote;
}

/**
 * Sous-étapes affichées côté client une fois la commande "en livraison"
 * (order.status === "shipping") : affecté → récupère → en route → arrive.
 */
const missionPhase = createStore<MissionPhase>("assigned");

export const useMissionPhase = missionPhase.useStore;
export const getMissionPhase = missionPhase.getState;

export function startPickup() {
  missionPhase.setState("pickup");
}

export function confirmPickedUp() {
  missionPhase.setState("enroute");
  pushNotification({
    title: "📦 Commande récupérée",
    message: "Le livreur a récupéré votre commande et se met en route.",
    type: "info",
  });
}

export function markArrivingSoon() {
  missionPhase.setState("arrived");
  pushNotification({
    title: "🛵 Livreur proche",
    message: "Votre livreur arrive bientôt, tenez votre code de livraison prêt.",
    type: "info",
  });
}

export function getAvailableOrder(): Order | undefined {
  const orders = getOrders();
  return orders.find((order) =>
    (AVAILABLE_DELIVERY_STATUSES as readonly string[]).includes(order.status)
  );
}

/** Toutes les missions pas encore prises en charge par un livreur (onglet "Disponibles"). */
export function useAvailableOrders(): Order[] {
  const orders = useOrderStore();
  return orders.filter((order) =>
    (["pending", "confirmed", "preparing"] as const).includes(
      order.status as "pending" | "confirmed" | "preparing"
    )
  );
}

/** Accepte une mission précise (choisie dans la liste "Disponibles"). */
export function acceptOrder(orderId: string): Order | undefined {
  const order = getOrders().find((item) => item.id === orderId);
  if (!order) return undefined;

  updateOrderStatus(orderId, "shipping");
  const deliveryId = getCurrentAccount()?.id;
  if (deliveryId) assignDelivery(orderId, deliveryId);
  missionId.setState(orderId);
  missionPhase.setState("assigned");
  void startDriverTracking();
  return { ...order, status: "shipping" };
}

export function acceptAvailableOrder(): Order | undefined {
  const orders = getOrders();
  const already = orders.find((order) => order.status === "shipping");

  if (already) {
    missionId.setState(already.id);
    missionPhase.setState("assigned");
    void startDriverTracking();
    return already;
  }

  const next = orders.find(
    (order) =>
      order.status === "pending" ||
      order.status === "confirmed" ||
      order.status === "preparing"
  );

  if (!next) {
    return undefined;
  }

  updateOrderStatus(next.id, "shipping");
  const deliveryId = getCurrentAccount()?.id;
  if (deliveryId) assignDelivery(next.id, deliveryId);
  missionId.setState(next.id);
  missionPhase.setState("assigned");
  void startDriverTracking();
  return { ...next, status: "shipping" };
}

export function completeActiveDelivery() {
  const id = missionId.getState();
  if (id) {
    updateOrderStatus(id, "delivered");
  }
  missionPhase.setState("assigned");
  stopDriverTracking();
}

/** Mission strictement liée au missionId courant (pas de repli automatique) — utilisée par l'onglet "En cours". */
export function useMissionOrder(): Order | null {
  const id = useMissionId();
  const orders = useOrderStore();
  return id ? orders.find((order) => order.id === id) ?? null : null;
}

export function useActiveOrder(): Order | null {
  const id = missionId.useStore();
  const orders = useOrderStore();

  if (id) {
    return orders.find((order) => order.id === id) ?? null;
  }

  return (
    orders.find((order) =>
      (AVAILABLE_DELIVERY_STATUSES as readonly string[]).includes(order.status)
    ) ?? null
  );
}

export function useDeliveryOffer(): Order | null {
  const id = missionId.useStore();
  const orders = useOrderStore();
  const current = id
    ? orders.find((order) => order.id === id)
    : undefined;

  if (
    current &&
    current.status !== "delivered" &&
    current.status !== "cancelled"
  ) {
    return current;
  }

  return (
    orders.find((order) =>
      (AVAILABLE_DELIVERY_STATUSES as readonly string[]).includes(order.status)
    ) ?? null
  );
}
