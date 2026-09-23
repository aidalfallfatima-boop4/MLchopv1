import { CartItem, Order, OrderStatus, PaymentStatus } from "../types";
import { createStore } from "./createStore";
import { DEMO_DELIVERY_CODE } from "../constants/config";
import { pushNotification } from "./notificationStore";
import { STATUS_META } from "../constants/theme";
import { getCurrentAccount, subscribeCurrentAccount } from "./authStore";
import {
  arrayUnion,
  col,
  docRef,
  query,
  setDoc,
  subscribeCollection,
  updateDoc,
  where,
} from "../services/firebase/firestore";
import { reportSubscriptionError, reportWriteError } from "../services/firebase/writeError";

const ORDERS_COLLECTION = "orders";

const seed: Order[] = [
  {
    id: "ML1025",
    items: [
      {
        id: 1,
        name: "Riz local 25 kg",
        price: 18500,
        category: "Alimentation",
        emoji: "🍚",
        quantity: 1,
      },
    ],
    total: 18500,
    status: "pending",
    customerName: "Mamadou Traoré",
    customerPhone: "+223 76 11 22 33",
    deliveryAddress: "ACI 2000, Bamako",
    paymentMethod: "cash",
    createdAt: new Date().toISOString(),
    deliveryCode: DEMO_DELIVERY_CODE,
    deliveryFee: 2500,
  },
  {
    id: "ML1024",
    items: [
      {
        id: 2,
        name: "Huile alimentaire",
        price: 7500,
        category: "Alimentation",
        emoji: "🫗",
        quantity: 1,
      },
    ],
    total: 7500,
    status: "preparing",
    customerName: "Aminata Coulibaly",
    customerPhone: "+223 65 44 55 66",
    deliveryAddress: "Hamdallaye ACI",
    paymentMethod: "orange_money",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    deliveryCode: DEMO_DELIVERY_CODE,
    deliveryFee: 2500,
  },
];

const store = createStore<Order[]>(seed);

export const useOrderStore = store.useStore;
export const getOrders = store.getState;

function sortByCreatedAtDesc(items: Order[]): Order[] {
  return [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

let hydrated = false;
let unsubscribeQuery: (() => void) | null = null;
let scopeKey: string | null = null;

/**
 * Portée des commandes visibles, alignée sur les Security Rules :
 * - client  → uniquement ses propres commandes (customerId == moi)
 * - vendeur → commandes contenant au moins un de ses produits (sellerIds contient moi)
 * - livreur / admin → toute la collection (rôle métier "voit tout", cadré côté rules)
 */
function resubscribe() {
  const account = getCurrentAccount();
  const key = account ? `${account.role}:${account.id}` : null;
  if (key === scopeKey) return;
  scopeKey = key;

  unsubscribeQuery?.();
  unsubscribeQuery = null;

  if (!account) {
    store.setState([]);
    return;
  }

  const target =
    account.role === "client"
      ? query(col(ORDERS_COLLECTION), where("customerId", "==", account.id))
      : account.role === "seller"
        ? query(col(ORDERS_COLLECTION), where("sellerIds", "array-contains", account.id))
        : col(ORDERS_COLLECTION);

  unsubscribeQuery = subscribeCollection<Order>(
    target,
    (items) => store.setState(sortByCreatedAtDesc(items)),
    // Erreur d'écoute : on garde les dernières commandes connues (jamais "aucune commande").
    (error) => reportSubscriptionError("orderStore", error)
  );
}

/** Remplace UNE commande dans le store (utilisé pour les rollbacks ciblés, sans
 * écraser les autres commandes arrivées entre-temps par snapshot). */
function replaceOrder(orderId: string, replacement: Order | undefined) {
  store.setState((orders) => {
    if (!replacement) return orders.filter((order) => order.id !== orderId);
    return orders.some((order) => order.id === orderId)
      ? orders.map((order) => (order.id === orderId ? replacement : order))
      : sortByCreatedAtDesc([replacement, ...orders]);
  });
}

function findOrder(orderId: string): Order | undefined {
  return store.getState().find((order) => order.id === orderId);
}

function patchOrder(orderId: string, patch: Partial<Order>): Order | undefined {
  const previous = findOrder(orderId);
  if (previous) replaceOrder(orderId, { ...previous, ...patch });
  return previous;
}

/** À appeler une fois au démarrage : écoute les commandes Firestore en temps réel. */
export async function hydrateOrderStore() {
  if (hydrated) return;
  hydrated = true;
  resubscribe();
  subscribeCurrentAccount(resubscribe);
}

/**
 * Crée la commande AVANT toute tentative de paiement : le paiement (mock ou
 * futur vrai) est ensuite toujours rattaché à un vrai id de commande via
 * `attachPayment`, jamais à un identifiant provisoire type "pending-order".
 * Insertion optimiste, puis attente de l'écriture Firestore : en cas de refus,
 * la commande locale est retirée et l'erreur est propagée à l'appelant.
 */
export async function createOrder(input: {
  items: CartItem[];
  total: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethod: Order["paymentMethod"];
  deliveryFee: number;
}): Promise<Order> {
  const account = getCurrentAccount();
  const now = new Date().toISOString();
  const sellerIds = Array.from(
    new Set(input.items.map((item) => item.sellerId).filter((id): id is string => Boolean(id)))
  );

  const order: Order = {
    id: `ML${Date.now().toString().slice(-6)}`,
    items: input.items,
    total: input.total,
    status: "pending",
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    deliveryAddress: input.deliveryAddress,
    paymentMethod: input.paymentMethod,
    paymentStatus: "pending",
    createdAt: now,
    deliveryCode: DEMO_DELIVERY_CODE,
    deliveryFee: input.deliveryFee,
    customerId: account?.id,
    sellerIds,
    statusHistory: [{ status: "pending", at: now }],
  };

  store.setState((orders) => [order, ...orders]);

  try {
    await setDoc(docRef(ORDERS_COLLECTION, order.id), order);
  } catch (error) {
    replaceOrder(order.id, undefined);
    console.error("[orderStore] createOrder refusé :", error);
    throw error;
  }

  return order;
}

/**
 * Associe le résultat du paiement (simulé) à la vraie commande déjà créée.
 * Rejette (après rollback local) si Firestore refuse l'écriture ; la
 * notification de succès/échec du paiement n'est émise qu'APRÈS l'écriture.
 */
export async function attachPayment(
  orderId: string,
  payment: { status: PaymentStatus; reference: string }
): Promise<void> {
  const previous = patchOrder(orderId, {
    paymentStatus: payment.status,
    paymentReference: payment.reference,
  });

  try {
    await updateDoc(docRef(ORDERS_COLLECTION, orderId), {
      paymentStatus: payment.status,
      paymentReference: payment.reference,
    });
  } catch (error) {
    if (previous) replaceOrder(orderId, previous);
    console.error("[orderStore] attachPayment refusé :", error);
    throw error;
  }

  if (payment.status === "paid") {
    pushNotification({
      title: "Commande envoyée ✅",
      message: `Commande ${orderId} payée et reçue, en attente de confirmation du vendeur.`,
      type: "success",
    });
  } else {
    pushNotification({
      title: "Paiement refusé 🚨",
      message: `Le paiement de la commande ${orderId} a échoué. Réessayez avec un autre moyen.`,
      type: "error",
    });
  }
}

/** Paiement refusé : la commande créée n'est pas honorée, on l'annule proprement.
 * Rejette (après rollback local) si Firestore refuse l'annulation. */
export async function cancelUnpaidOrder(orderId: string): Promise<void> {
  const now = new Date().toISOString();
  const previous = patchOrder(orderId, { status: "cancelled" as OrderStatus });

  try {
    await updateDoc(docRef(ORDERS_COLLECTION, orderId), {
      status: "cancelled",
      statusHistory: arrayUnion({ status: "cancelled", at: now }),
    });
  } catch (error) {
    if (previous) replaceOrder(orderId, previous);
    console.error("[orderStore] cancelUnpaidOrder refusé :", error);
    throw error;
  }
}

const STATUS_NOTIFICATION_MESSAGE: Record<OrderStatus, (order: Order) => string> = {
  pending: (order) => `Commande ${order.id} en attente.`,
  confirmed: (order) => `Le vendeur a confirmé votre commande ${order.id}.`,
  preparing: (order) => `Votre commande ${order.id} est en préparation.`,
  shipping: (order) => `Un livreur a pris en charge votre commande ${order.id} 🛵`,
  delivered: (order) => `Commande ${order.id} livrée, bon appétit / bon usage ! 🎉`,
  cancelled: (order) => `Commande ${order.id} annulée.`,
};

export function updateOrderStatus(id: string, status: OrderStatus) {
  const now = new Date().toISOString();
  const previous = patchOrder(id, { status });
  if (!previous) return;
  const updated: Order = { ...previous, status };

  updateDoc(docRef(ORDERS_COLLECTION, id), {
    status,
    statusHistory: arrayUnion({ status, at: now }),
  })
    .then(() => {
      // Notification émise seulement une fois le changement réellement enregistré.
      const meta = STATUS_META[status];
      pushNotification({
        title: `${meta.icon} ${meta.label}`,
        message: STATUS_NOTIFICATION_MESSAGE[status](updated),
        type: status === "cancelled" ? "error" : status === "delivered" ? "success" : "info",
        // Adressée au vrai client, même quand c'est le vendeur/livreur qui déclenche
        // le changement depuis son propre appareil.
        userId: updated.customerId,
      });
    })
    .catch((error) => {
      replaceOrder(id, previous);
      reportWriteError("orderStore.updateOrderStatus", error);
    });
}

/** Rattache un livreur à une commande (voir acceptOrder/acceptAvailableOrder dans deliveryStore). */
export function assignDelivery(orderId: string, deliveryId: string) {
  const previous = patchOrder(orderId, { deliveryId });

  updateDoc(docRef(ORDERS_COLLECTION, orderId), { deliveryId }).catch((error) => {
    if (previous) replaceOrder(orderId, previous);
    reportWriteError("orderStore.assignDelivery", error);
  });
}

export function getActiveDeliveryOrder() {
  return store
    .getState()
    .find(
      (order) => order.status === "shipping" || order.status === "preparing"
    );
}
