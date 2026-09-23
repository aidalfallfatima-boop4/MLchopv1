import { CartItem, Product } from "../types";
import { createStore } from "./createStore";
import { getCurrentAccount, subscribeCurrentAccount } from "./authStore";
import { docRef, setDoc, subscribeDoc } from "../services/firebase/firestore";
import { reportSubscriptionError, reportWriteError } from "../services/firebase/writeError";
import { MAX_CART_ITEMS, MAX_ITEM_QUANTITY } from "../constants/config";
import { pushLocalNotification } from "./notificationStore";

const CARTS_COLLECTION = "cart";

type CartDoc = { items: CartItem[] };

const store = createStore<CartItem[]>([]);

export const useCartStore = store.useStore;

let hydrated = false;
let unsubscribeQuery: (() => void) | null = null;
let currentUid: string | null = null;

function resubscribe() {
  const uid = getCurrentAccount()?.id ?? null;
  if (uid === currentUid) return;
  currentUid = uid;

  unsubscribeQuery?.();
  unsubscribeQuery = null;
  store.setState([]);

  if (!uid) return;

  unsubscribeQuery = subscribeDoc<CartDoc>(
    CARTS_COLLECTION,
    uid,
    (doc) => {
      store.setState(doc?.items ?? []);
    },
    // Erreur d'écoute : on garde le dernier panier connu plutôt que de le vider.
    (error) => reportSubscriptionError("cartStore", error)
  );
}

/** À appeler une fois au démarrage : restaure/écoute le panier du client connecté. */
export async function hydrateCartStore() {
  if (hydrated) return;
  hydrated = true;
  resubscribe();
  subscribeCurrentAccount(resubscribe);
}

/** Quantité entière bornée 1..MAX_ITEM_QUANTITY (règle serveur sur les commandes). */
function clampQuantity(quantity: number): number {
  return Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.round(quantity)));
}

/**
 * Applique `next` localement tout de suite (optimiste) puis l'écrit dans
 * Firestore ; en cas de refus, restaure le panier d'avant et prévient l'utilisateur.
 */
function commit(next: CartItem[]) {
  const previous = store.getState();
  store.setState(next);

  const uid = currentUid;
  if (!uid) return;
  setDoc(docRef(CARTS_COLLECTION, uid), { items: next } satisfies CartDoc).catch((error) => {
    // Ne restaure que si personne n'a modifié le panier entre-temps.
    if (store.getState() === next) store.setState(previous);
    reportWriteError("cartStore", error);
  });
}

export function addToCart(product: Product, quantity: number = 1) {
  const items = store.getState();
  const existing = items.find((item) => item.id === product.id);

  if (!existing && items.length >= MAX_CART_ITEMS) {
    pushLocalNotification({
      title: "Panier plein",
      message: `Maximum ${MAX_CART_ITEMS} produits différents par commande`,
      type: "warning",
    });
    return;
  }

  const next = existing
    ? items.map((item) =>
        item.id === product.id ? { ...item, quantity: clampQuantity(item.quantity + quantity) } : item
      )
    : [...items, { ...product, quantity: clampQuantity(quantity) }];

  commit(next);
}

export function removeFromCart(productId: number) {
  commit(store.getState().filter((item) => item.id !== productId));
}

export function updateQuantity(productId: number, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  commit(
    store
      .getState()
      .map((item) => (item.id === productId ? { ...item, quantity: clampQuantity(quantity) } : item))
  );
}

export function clearCart() {
  commit([]);
}

export function getCartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
