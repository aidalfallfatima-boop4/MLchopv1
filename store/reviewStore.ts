import { createStore } from "./createStore";
import { Review } from "../types";
import { loadJSON, saveJSON } from "../services/persistence";

const STORAGE_KEY = "mlchop.reviews.v1";

const store = createStore<Review[]>([]);

export const useReviews = store.useStore;

let hydrated = false;

/** À appeler une fois au démarrage : restaure les avis laissés par les clients. */
export async function hydrateReviewStore() {
  if (hydrated) return;
  hydrated = true;
  const saved = await loadJSON<Review[]>(STORAGE_KEY, []);
  store.setState(saved);
  store.subscribe(() => saveJSON(STORAGE_KEY, store.getState()));
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
