import { writeBatch } from "firebase/firestore";

import { PRODUCTS } from "../data/products";
import { Product } from "../types";
import { createStore } from "./createStore";
import { loadJSON, saveJSON } from "../services/persistence";
import { getCurrentAccount, subscribeCurrentAccount } from "./authStore";
import { db } from "../services/firebase/app";
import { col, docRef, deleteDoc, setDoc, subscribeCollection, updateDoc } from "../services/firebase/firestore";
import { reportSubscriptionError, reportWriteError } from "../services/firebase/writeError";

const PRODUCTS_COLLECTION = "products";
const STOCK_MOVEMENTS_COLLECTION = "stockMovements";
/** Anti-double-seed : une fois posé, on ne remet plus le catalogue de démo même
 * si un vendeur vide complètement son catalogue par la suite. */
const SEED_FLAG_KEY = "mlchop.products.seeded.v1";

const store = createStore<Product[]>([...PRODUCTS]);

export const useProductStore = store.useStore;

let hydrated = false;

/**
 * Les Security Rules n'autorisent la création de produits qu'à un vendeur (pour
 * lui-même) ou à l'admin : le seed n'est donc tenté que depuis ces comptes, et
 * les produits de démo sont rattachés au vendeur connecté. Le drapeau n'est posé
 * qu'après succès, pour qu'un échec (ex : rules pas encore déployées) soit retenté.
 */
async function seedIfEmpty() {
  const account = getCurrentAccount();
  if (!account || (account.role !== "seller" && account.role !== "admin")) return;

  const alreadySeeded = await loadJSON<boolean>(SEED_FLAG_KEY, false);
  if (alreadySeeded) return;

  const batch = writeBatch(db);
  const now = new Date().toISOString();
  const owner =
    account.role === "seller"
      ? { sellerId: account.id, sellerName: account.shopName || account.fullName }
      : {};
  for (const product of PRODUCTS) {
    batch.set(docRef(PRODUCTS_COLLECTION, String(product.id)), {
      ...product,
      ...owner,
      createdAt: now,
      updatedAt: now,
    });
  }

  try {
    await batch.commit();
    saveJSON(SEED_FLAG_KEY, true);
  } catch (error) {
    // Le drapeau n'est pas posé : le seed sera retenté au prochain démarrage.
    reportWriteError("productStore.seed", error);
  }
}

let unsubscribeQuery: (() => void) | null = null;
let currentUid: string | null = null;

/**
 * Catalogue public (lisible par tout compte connecté, cf. firestore.rules), mais
 * l'écoute est ré-établie à chaque changement de session : si la toute première
 * tentative arrive avant que l'auth Firebase ne soit prête, elle échoue en
 * "permission-denied" et Firestore ne réessaie JAMAIS tout seul un listener en
 * erreur — ce ré-abonnement corrige ce cas au prochain changement de compte.
 */
function resubscribe() {
  const uid = getCurrentAccount()?.id ?? null;
  if (uid === currentUid && unsubscribeQuery) return;
  currentUid = uid;

  unsubscribeQuery?.();
  let firstSnapshot = true;

  unsubscribeQuery = subscribeCollection<Product>(
    col(PRODUCTS_COLLECTION),
    (items) => {
      store.setState(items);
      if (firstSnapshot) {
        firstSnapshot = false;
        if (items.length === 0) {
          void seedIfEmpty();
        }
      }
    },
    (error) => {
      // Lecture refusée : on garde le dernier catalogue connu en mémoire,
      // ré-écouté automatiquement au prochain changement de session.
      reportSubscriptionError("productStore", error);
    }
  );
}

/** À appeler une fois au démarrage : écoute le catalogue Firestore en temps réel. */
export async function hydrateProductStore() {
  if (hydrated) return;
  hydrated = true;
  resubscribe();
  subscribeCurrentAccount(resubscribe);
}

/** Rollback ciblé : remet la version précédente d'UN produit (ré-insérée si supprimée). */
function restoreProduct(previous: Product) {
  store.setState((products) =>
    products.some((product) => product.id === previous.id)
      ? products.map((product) => (product.id === previous.id ? previous : product))
      : [...products, previous]
  );
}

export function addProduct(product: Omit<Product, "id">) {
  const id = Date.now();
  const account = getCurrentAccount();
  const sellerName = product.sellerName ?? (account ? account.shopName || account.fullName : undefined);
  const now = new Date().toISOString();

  const fullProduct: Product = { active: true, ...product, sellerName, id };

  store.setState((products) => [...products, fullProduct]);

  setDoc(docRef(PRODUCTS_COLLECTION, String(id)), {
    ...fullProduct,
    createdAt: now,
    updatedAt: now,
  }).catch((error) => {
    store.setState((products) => products.filter((product) => product.id !== id));
    reportWriteError("productStore.addProduct", error);
  });
}

export function updateProduct(id: number, patch: Partial<Omit<Product, "id">>) {
  const previous = store.getState().find((product) => product.id === id);

  store.setState((products) =>
    products.map((product) => (product.id === id ? { ...product, ...patch } : product))
  );

  updateDoc(docRef(PRODUCTS_COLLECTION, String(id)), {
    ...patch,
    updatedAt: new Date().toISOString(),
  })
    .then(() => {
      // Mouvement de stock journalisé seulement si la mise à jour a été acceptée.
      if (previous && typeof patch.stock === "number" && patch.stock !== previous.stock) {
        logStockMovement(id, previous.stock ?? 0, patch.stock);
      }
    })
    .catch((error) => {
      if (previous) restoreProduct(previous);
      reportWriteError("productStore.updateProduct", error);
    });
}

function logStockMovement(productId: number, previousQty: number, newQty: number) {
  const account = getCurrentAccount();
  const id = `${productId}-${Date.now()}`;

  setDoc(docRef(STOCK_MOVEMENTS_COLLECTION, id), {
    productId,
    previousQty,
    newQty,
    type: newQty > previousQty ? "restock" : "adjustment",
    userId: account?.id ?? null,
    userName: account?.fullName ?? null,
    at: new Date().toISOString(),
  }).catch((error) => reportWriteError("productStore.logStockMovement", error));
}

export function removeProduct(id: number) {
  const previous = store.getState().find((product) => product.id === id);
  store.setState((products) => products.filter((product) => product.id !== id));

  deleteDoc(docRef(PRODUCTS_COLLECTION, String(id))).catch((error) => {
    if (previous) restoreProduct(previous);
    reportWriteError("productStore.removeProduct", error);
  });
}

export function toggleProductActive(id: number) {
  const current = store.getState().find((product) => product.id === id);
  const nextActive = current ? current.active === false : true;

  store.setState((products) =>
    products.map((product) =>
      product.id === id ? { ...product, active: product.active === false } : product
    )
  );

  updateDoc(docRef(PRODUCTS_COLLECTION, String(id)), {
    active: nextActive,
    updatedAt: new Date().toISOString(),
  }).catch((error) => {
    if (current) restoreProduct(current);
    reportWriteError("productStore.toggleProductActive", error);
  });
}

export function getProductById(id: number) {
  return store.getState().find((product) => product.id === id);
}

/** Catalogue visible côté client : masque les produits désactivés par le vendeur. */
export function useVisibleProducts(): Product[] {
  return useProductStore().filter((product) => product.active !== false);
}
