import {
  CollectionReference,
  DocumentData,
  FirestoreError,
  Query,
  QueryConstraint,
  arrayUnion,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  where,
} from "firebase/firestore";

import { db } from "./app";

export function col(path: string): CollectionReference<DocumentData> {
  return collection(db, path);
}

export function docRef(path: string, id: string) {
  return doc(db, path, id);
}

/**
 * Écoute une collection (ou requête) en temps réel et pousse le tableau
 * `{id, ...data}` résultant dans `onData` à chaque changement serveur ou local
 * optimiste. `onError` reçoit les refus de Security Rules (ex : rôle non autorisé).
 */
export function subscribeCollection<T extends DocumentData>(
  target: CollectionReference<DocumentData> | Query<DocumentData>,
  onData: (items: (T & { id: string })[]) => void,
  onError?: (error: FirestoreError) => void
) {
  return onSnapshot(
    target,
    (snapshot) => {
      const items = snapshot.docs.map(
        (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as T & { id: string }
      );
      onData(items);
    },
    (error) => {
      // Toujours journalisé (y compris en prod web où __DEV__ est faux).
      console.error(`[firestore] subscription error:`, error.code, error.message);
      onError?.(error);
    }
  );
}

/** Écoute un doc unique en temps réel (ex : users/{uid} du compte connecté). */
export function subscribeDoc<T extends DocumentData>(
  path: string,
  id: string,
  onData: (item: (T & { id: string }) | null) => void,
  onError?: (error: FirestoreError) => void
) {
  return onSnapshot(
    docRef(path, id),
    (snap) => {
      onData(snap.exists() ? ({ id: snap.id, ...snap.data() } as T & { id: string }) : null);
    },
    (error) => {
      console.error(`[firestore] doc subscription error (${path}/${id}):`, error.code, error.message);
      onError?.(error);
    }
  );
}

export async function fetchDoc<T extends DocumentData>(
  path: string,
  id: string
): Promise<(T & { id: string }) | null> {
  const snap = await getDoc(docRef(path, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as T & { id: string }) : null;
}

export { setDoc, updateDoc, deleteDoc, query, doc, collection, getDoc, where, orderBy, limit, arrayUnion };
export type { QueryConstraint };
