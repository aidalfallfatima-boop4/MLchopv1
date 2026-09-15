import { CartItem, Order, OrderStatus, PaymentStatus } from "../types";
import { createStore } from "./createStore";
import { DEMO_DELIVERY_CODE } from "../constants/config";
import { pushNotification } from "./notificationStore";
import { STATUS_META } from "../constants/theme";
import { loadJSON, saveJSON } from "../services/persistence";

const STORAGE_KEY = "mlchop.orders.v1";

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

let hydrated = false;

/** À appeler une fois au démarrage : restaure les commandes passées avant fermeture de l'app. */
export async function hydrateOrderStore() {
  if (hydrated) return;
  hydrated = true;
  const saved = await loadJSON<Order[]>(STORAGE_KEY, seed);
  store.setState(saved);
  store.subscribe(() => saveJSON(STORAGE_KEY, store.getState()));
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
    createdAt: new Date().toISOString(),
    deliveryCode: DEMO_DELIVERY_CODE,
    deliveryFee: input.deliveryFee,
  };

  store.setState((orders) => [order, ...orders]);
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
  store.setState((orders) =>
    orders.map((order) =>
      order.id === orderId ? { ...order, status: "cancelled" as OrderStatus } : order
    )
  );
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

  store.setState((orders) =>
    orders.map((order) => {
      if (order.id !== id) {
        return order;
      }
      updated = { ...order, status };
      return updated;
    })
  );

  if (updated) {
    const meta = STATUS_META[status];
    pushNotification({
      title: `${meta.icon} ${meta.label}`,
      message: STATUS_NOTIFICATION_MESSAGE[status](updated),
      type: status === "cancelled" ? "error" : status === "delivered" ? "success" : "info",
    });
  }
}

export function getActiveDeliveryOrder() {
  return store
    .getState()
    .find(
      (order) => order.status === "shipping" || order.status === "preparing"
    );
}
