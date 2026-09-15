import { createStore } from "./createStore";
import { loadJSON, saveJSON } from "../services/persistence";

const STORAGE_KEY = "mlchop.favorites.v1";

const store = createStore<number[]>([]);

export const useFavoriteIds = store.useStore;

let hydrated = false;

/** À appeler une fois au démarrage : restaure les favoris du client. */
export async function hydrateFavoriteStore() {
  if (hydrated) return;
  hydrated = true;
  const saved = await loadJSON<number[]>(STORAGE_KEY, []);
  store.setState(saved);
  store.subscribe(() => saveJSON(STORAGE_KEY, store.getState()));
}

export function toggleFavorite(productId: number) {
  store.setState((current) =>
    current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId]
  );
}

export function isFavorite(productId: number, ids: number[] = store.getState()): boolean {
  return ids.includes(productId);
}
