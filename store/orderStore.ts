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
    () => store.setState([])
  );
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
 */
export function createOrder(input: {
  items: CartItem[];
  total: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethod: Order["paymentMethod"];
  deliveryFee: number;
}) {
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

  setDoc(docRef(ORDERS_COLLECTION, order.id), order).catch((error) => {
    if (__DEV__) console.warn("[orderStore] createOrder failed:", error);
  });

  return order;
}

/** Associe le résultat du paiement (simulé) à la vraie commande déjà créée. */
export function attachPayment(
  orderId: string,
  payment: { status: PaymentStatus; reference: string }
) {
  store.setState((orders) =>
    orders.map((order) =>
      order.id === orderId
        ? { ...order, paymentStatus: payment.status, paymentReference: payment.reference }
        : order
    )
  );

  updateDoc(docRef(ORDERS_COLLECTION, orderId), {
    paymentStatus: payment.status,
    paymentReference: payment.reference,
  }).catch((error) => {
    if (__DEV__) console.warn("[orderStore] attachPayment failed:", error);
  });

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

/** Paiement refusé : la commande créée n'est pas honorée, on l'annule proprement. */
export function cancelUnpaidOrder(orderId: string) {
  const now = new Date().toISOString();

  store.setState((orders) =>
    orders.map((order) =>
      order.id === orderId ? { ...order, status: "cancelled" as OrderStatus } : order
    )
  );

  updateDoc(docRef(ORDERS_COLLECTION, orderId), {
    status: "cancelled",
    statusHistory: arrayUnion({ status: "cancelled", at: now }),
  }).catch((error) => {
    if (__DEV__) console.warn("[orderStore] cancelUnpaidOrder failed:", error);
  });
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
  let updated: Order | undefined;
  const now = new Date().toISOString();

  store.setState((orders) =>
    orders.map((order) => {
      if (order.id !== id) {
        return order;
      }
      updated = { ...order, status };
      return updated;
    })
  );

  if (!updated) return;

  updateDoc(docRef(ORDERS_COLLECTION, id), {
    status,
    statusHistory: arrayUnion({ status, at: now }),
  }).catch((error) => {
    if (__DEV__) console.warn("[orderStore] updateOrderStatus failed:", error);
  });

  const meta = STATUS_META[status];
  pushNotification({
    title: `${meta.icon} ${meta.label}`,
    message: STATUS_NOTIFICATION_MESSAGE[status](updated),
    type: status === "cancelled" ? "error" : status === "delivered" ? "success" : "info",
    // Adressée au vrai client, même quand c'est le vendeur/livreur qui déclenche
    // le changement depuis son propre appareil.
    userId: updated.customerId,
  });
}

/** Rattache un livreur à une commande (voir acceptOrder/acceptAvailableOrder dans deliveryStore). */
export function assignDelivery(orderId: string, deliveryId: string) {
  store.setState((orders) =>
    orders.map((order) => (order.id === orderId ? { ...order, deliveryId } : order))
  );

  updateDoc(docRef(ORDERS_COLLECTION, orderId), { deliveryId }).catch((error) => {
    if (__DEV__) console.warn("[orderStore] assignDelivery failed:", error);
  });
}

export function getActiveDeliveryOrder() {
  return store
    .getState()
    .find(
      (order) => order.status === "shipping" || order.status === "preparing"
    );
}
