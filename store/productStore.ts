import { PRODUCTS } from "../data/products";
import { Product } from "../types";
import { createStore } from "./createStore";
import { loadJSON, saveJSON } from "../services/persistence";

const STORAGE_KEY = "mlchop.products.v1";

const store = createStore<Product[]>([...PRODUCTS]);

export const useProductStore = store.useStore;

let hydrated = false;

/** À appeler une fois au démarrage : restaure les produits ajoutés par le vendeur. */
export async function hydrateProductStore() {
  if (hydrated) return;
  hydrated = true;
  const saved = await loadJSON<Product[]>(STORAGE_KEY, PRODUCTS);
  store.setState(saved);
  store.subscribe(() => saveJSON(STORAGE_KEY, store.getState()));
}

export function addProduct(product: Omit<Product, "id">) {
  const nextId =
    store.getState().reduce((max, item) => Math.max(max, item.id), 0) + 1;

  store.setState((products) => [
    ...products,
    { active: true, ...product, id: nextId },
  ]);
}

export function updateProduct(id: number, patch: Partial<Omit<Product, "id">>) {
  store.setState((products) =>
    products.map((product) => (product.id === id ? { ...product, ...patch } : product))
  );
}

export function removeProduct(id: number) {
  store.setState((products) => products.filter((product) => product.id !== id));
}

export function toggleProductActive(id: number) {
  store.setState((products) =>
    products.map((product) =>
      product.id === id ? { ...product, active: product.active === false } : product
    )
  );
}

export function getProductById(id: number) {
  return store.getState().find((product) => product.id === id);
}

/** Catalogue visible côté client : masque les produits désactivés par le vendeur. */
export function useVisibleProducts(): Product[] {
  return useProductStore().filter((product) => product.active !== false);
}
