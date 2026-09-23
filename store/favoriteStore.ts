import { createStore } from "./createStore";
import { getCurrentAccount, subscribeCurrentAccount } from "./authStore";
import { docRef, setDoc, subscribeDoc } from "../services/firebase/firestore";

const FAVORITES_COLLECTION = "favorites";

type FavoritesDoc = { productIds: number[] };

const store = createStore<number[]>([]);

export const useFavoriteIds = store.useStore;

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

  unsubscribeQuery = subscribeDoc<FavoritesDoc>(FAVORITES_COLLECTION, uid, (doc) => {
    store.setState(doc?.productIds ?? []);
  });
}

/** À appeler une fois au démarrage : restaure/écoute les favoris du client connecté. */
export async function hydrateFavoriteStore() {
  if (hydrated) return;
  hydrated = true;
  resubscribe();
  subscribeCurrentAccount(resubscribe);
}

export function toggleFavorite(productId: number) {
  const next = store
    .getState()
    .includes(productId)
    ? store.getState().filter((id) => id !== productId)
    : [...store.getState(), productId];

  store.setState(next);

  const uid = currentUid;
  if (!uid) return;

  setDoc(docRef(FAVORITES_COLLECTION, uid), { productIds: next } satisfies FavoritesDoc).catch(
    (error) => {
      if (__DEV__) console.warn("[favoriteStore] toggleFavorite failed:", error);
    }
  );
}

export function isFavorite(productId: number, ids: number[] = store.getState()): boolean {
  return ids.includes(productId);
}
