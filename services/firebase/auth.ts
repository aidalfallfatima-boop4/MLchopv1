import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { auth } from "./app";
import { docRef, fetchDoc, setDoc } from "./firestore";
import { Account, ApprovalStatus, Role, Vehicle } from "../../types";

const USERS_COLLECTION = "users";

/**
 * Firebase Auth (JS SDK) n'a pas d'auth par téléphone utilisable dans Expo Go
 * (reCAPTCHA natif requis). ML CHOP garde son écran "téléphone + mot de passe"
 * tel quel côté UI, mais s'authentifie en interne via Email/Password avec un
 * email synthétisé depuis le numéro — invisible pour l'utilisateur.
 */
export function phoneToEmail(phone: string): string {
  const normalized = phone.trim().replace(/[^\d+]/g, "");
  return `${normalized.replace(/\+/g, "")}@mlchop.app`;
}

export type UserDoc = {
  role: Exclude<Role, null>;
  fullName: string;
  phone: string;
  shopName?: string;
  vehicle?: Vehicle;
  status: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
};

export function docToAccount(uid: string, data: UserDoc): Account {
  return {
    id: uid,
    role: data.role,
    fullName: data.fullName,
    phone: data.phone,
    shopName: data.shopName,
    vehicle: data.vehicle,
    status: data.status,
    createdAt: data.createdAt,
  };
}

export async function fetchAccount(uid: string): Promise<Account | null> {
  const data = await fetchDoc<UserDoc>(USERS_COLLECTION, uid);
  return data ? docToAccount(uid, data) : null;
}

export type RegisterInput = {
  role: Exclude<Role, null>;
  fullName: string;
  phone: string;
  password: string;
  shopName?: string;
  vehicle?: Vehicle;
};

export async function registerAccount(input: RegisterInput): Promise<Account> {
  const email = phoneToEmail(input.phone);
  const credential = await createUserWithEmailAndPassword(auth, email, input.password);
  const now = new Date().toISOString();

  const doc: UserDoc = {
    role: input.role,
    fullName: input.fullName,
    phone: input.phone,
    shopName: input.shopName,
    vehicle: input.vehicle,
    // Vendeurs/livreurs attendent la validation d'un admin ; les clients sont actifs d'emblée.
    status: input.role === "client" ? "active" : "pending_approval",
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(docRef(USERS_COLLECTION, credential.user.uid), doc);
  return docToAccount(credential.user.uid, doc);
}

export async function signInAccount(phone: string, password: string): Promise<Account> {
  const email = phoneToEmail(phone);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const account = await fetchAccount(credential.user.uid);

  if (!account) {
    // Compte Auth existe mais le doc Firestore users/{uid} est introuvable :
    // on ne le recrée SURTOUT PAS (un vendeur/admin serait silencieusement
    // rétrogradé en "client"). On ferme la session et on remonte l'anomalie.
    await signOut(auth).catch((error) => console.error("[auth] signOut après profil manquant :", error));
    throw Object.assign(new Error("Profil utilisateur introuvable."), { code: "profile-missing" });
  }

  return account;
}

export async function signOutAccount(): Promise<void> {
  await signOut(auth);
}

export function subscribeAuthUser(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUid(): string | null {
  return auth.currentUser?.uid ?? null;
}
