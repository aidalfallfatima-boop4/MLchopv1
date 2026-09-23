import { CartItem, Product } from "../types";
import { createStore } from "./createStore";
import { getCurrentAccount, subscribeCurrentAccount } from "./authStore";
import { docRef, setDoc, subscribeDoc } from "../services/firebase/firestore";

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

  unsubscribeQuery = subscribeDoc<CartDoc>(CARTS_COLLECTION, uid, (doc) => {
    store.setState(doc?.items ?? []);
  });
}

/** À appeler une fois au démarrage : restaure/écoute le panier du client connecté. */
export async function hydrateCartStore() {
  if (hydrated) return;
  hydrated = true;
  resubscribe();
  subscribeCurrentAccount(resubscribe);
}

function persist(items: CartItem[]) {
  const uid = currentUid;
  if (!uid) return;
  setDoc(docRef(CARTS_COLLECTION, uid), { items } satisfies CartDoc).catch((error) => {
    if (__DEV__) console.warn("[cartStore] persist failed:", error);
  });
}

export function addToCart(product: Product, quantity: number = 1) {
  store.setState((items) => {
    const existing = items.find((item) => item.id === product.id);

    const next = existing
      ? items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        )
      : [...items, { ...product, quantity }];

    persist(next);
    return next;
  });
}

export function removeFromCart(productId: number) {
  store.setState((items) => {
    const next = items.filter((item) => item.id !== productId);
    persist(next);
    return next;
  });
}

export function updateQuantity(productId: number, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  store.setState((items) => {
    const next = items.map((item) => (item.id === productId ? { ...item, quantity } : item));
    persist(next);
    return next;
  });
}

export function clearCart() {
  store.setState([]);
  persist([]);
}

export function getCartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
