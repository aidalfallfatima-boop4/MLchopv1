import { CartItem, Product } from "../types";
import { createStore } from "./createStore";
import { loadJSON, saveJSON } from "../services/persistence";

const STORAGE_KEY = "mlchop.cart.v1";

const store = createStore<CartItem[]>([]);

export const useCartStore = store.useStore;

let hydrated = false;

/** À appeler une fois au démarrage : restaure le panier laissé avant fermeture de l'app. */
export async function hydrateCartStore() {
  if (hydrated) return;
  hydrated = true;
  const saved = await loadJSON<CartItem[]>(STORAGE_KEY, []);
  store.setState(saved);
  store.subscribe(() => saveJSON(STORAGE_KEY, store.getState()));
}

export function addToCart(product: Product, quantity: number = 1) {
  store.setState((items) => {
    const existing = items.find((item) => item.id === product.id);

    if (existing) {
      return items.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    }

    return [...items, { ...product, quantity }];
  });
}

export function removeFromCart(productId: number) {
  store.setState((items) => items.filter((item) => item.id !== productId));
}

export function updateQuantity(productId: number, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  store.setState((items) =>
    items.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    )
  );
}

export function clearCart() {
  store.setState([]);
}

export function getCartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
