import { createStore } from "./createStore";
import { Review } from "../types";
import { getCurrentAccount, subscribeCurrentAccount } from "./authStore";
import { col, docRef, setDoc, subscribeCollection } from "../services/firebase/firestore";

const REVIEWS_COLLECTION = "reviews";

const store = createStore<Review[]>([]);

export const useReviews = store.useStore;

let hydrated = false;
let unsubscribeQuery: (() => void) | null = null;
let currentUid: string | null = null;

/** Voir productStore.ts : ré-abonnement à chaque changement de session pour
 * survivre à un premier essai lancé avant que l'auth Firebase ne soit prête. */
function resubscribe() {
  const uid = getCurrentAccount()?.id ?? null;
  if (uid === currentUid && unsubscribeQuery) return;
  currentUid = uid;

  unsubscribeQuery?.();
  unsubscribeQuery = subscribeCollection<Review>(col(REVIEWS_COLLECTION), (items) => {
    store.setState([...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
  });
}

/** À appeler une fois au démarrage : écoute les avis produits en temps réel (lecture publique). */
export async function hydrateReviewStore() {
  if (hydrated) return;
  hydrated = true;
  resubscribe();
  subscribeCurrentAccount(resubscribe);
}

export function addReview(input: {
  productId: number;
  orderId?: string;
  author: string;
  rating: number;
  comment: string;
}) {
  const review: Review = {
    id: `rev-${Date.now()}`,
    productId: input.productId,
    orderId: input.orderId,
    author: input.author,
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    comment: input.comment.trim(),
    createdAt: new Date().toISOString(),
  };

  store.setState((current) => [review, ...current]);

  const account = getCurrentAccount();
  setDoc(docRef(REVIEWS_COLLECTION, review.id), {
    ...review,
    authorId: account?.id ?? null,
  }).catch((error) => {
    if (__DEV__) console.warn("[reviewStore] addReview failed:", error);
  });

  return review;
}

export function useReviewsForProduct(productId: number): Review[] {
  return useReviews().filter((review) => review.productId === productId);
}

export function getAverageRating(productId: number): number | null {
  const reviews = store.getState().filter((review) => review.productId === productId);
  if (reviews.length === 0) return null;
  return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
}
