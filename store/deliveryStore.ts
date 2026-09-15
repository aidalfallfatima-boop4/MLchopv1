import { createStore } from "./createStore";
import {
  getOrders,
  updateOrderStatus,
  useOrderStore,
} from "./orderStore";
import { MissionPhase, Order } from "../types";
import { AVAILABLE_DELIVERY_STATUSES } from "../utils/orderLabels";
import {
  LocationSubscription,
  PositionUpdate,
  watchPosition,
} from "../services/location";
import { pushNotification } from "./notificationStore";

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

export const useDriverPosition = driverPosition.useStore;
export const getDriverPosition = driverPosition.getState;

let activeSubscription: LocationSubscription | null = null;

export async function startDriverTracking(): Promise<DriverGeoStatus> {
  if (driverPosition.getState().status === "tracking") {
    return "tracking";
  }

  driverPosition.setState((current) => ({ ...current, status: "requesting" }));

  const subscription = await watchPosition((position) => {
    driverPosition.setState({
      status: "tracking",
      position,
      updatedAt: Date.now(),
    });
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
  missionId.setState(null);
  missionPhase.setState("assigned");
  stopDriverTracking();
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
