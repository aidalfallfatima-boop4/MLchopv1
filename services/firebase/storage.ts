import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import { storage } from "./app";

/**
 * Upload une image locale (uri Expo : file://, content://, ph:// ou data:) vers
 * Firebase Storage et renvoie son downloadURL public. Aucun écran actuel de
 * ML CHOP n'a de sélecteur d'image (produits/profils utilisent des emoji) :
 * prêt à brancher dès qu'un écran ajoute expo-image-picker.
 */
export async function uploadImageAsync(uri: string, path: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, path);

  await uploadBytesResumable(storageRef, blob);
  return getDownloadURL(storageRef);
}

export async function deleteImageAsync(path: string): Promise<void> {
  try {
    await deleteObject(ref(storage, path));
  } catch {
    // Fichier déjà absent : rien à faire.
  }
}

export function productImagePath(productId: string | number, fileName: string) {
  return `products/${productId}/${fileName}`;
}

export function profileImagePath(uid: string, fileName: string) {
  return `profiles/${uid}/${fileName}`;
}

export function shopImagePath(sellerId: string, fileName: string) {
  return `shops/${sellerId}/${fileName}`;
}
