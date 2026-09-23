import { createStore } from "./createStore";
import { Account, ApprovalStatus, Role, Vehicle } from "../types";
import { DEMO_OTP_CODE, DEMO_PASSWORD, DEMO_PHONES } from "../constants/config";
import { setRole, updateUserProfile, logout as logoutUserStore } from "./userStore";
import {
  UserDoc,
  docToAccount,
  registerAccount,
  signInAccount,
  signOutAccount,
  subscribeAuthUser,
} from "../services/firebase/auth";
import { col, docRef, subscribeCollection, subscribeDoc, updateDoc } from "../services/firebase/firestore";

const USERS_COLLECTION = "users";

/** Compte connu au moment de l'inscription/OTP (avant que la session Firebase ne soit prête). */
const currentAccountStore = createStore<Account | null>(null);
/** Liste complète des comptes — alimentée uniquement quand le compte connecté est admin
 * (les Security Rules refusent de toute façon le `list` sur "users" aux autres rôles). */
const accountsStore = createStore<Account[]>([]);

export const useAccounts = accountsStore.useStore;
export const getAccounts = accountsStore.getState;
export const useCurrentAccount = currentAccountStore.useStore;
export const getCurrentAccount = currentAccountStore.getState;
/** Abonnement non-React : permet à d'autres stores (cart/favorites/notifications)
 * de ré-écouter leurs propres collections Firestore dès que le compte change. */
export const subscribeCurrentAccount = currentAccountStore.subscribe;

/** Brouillon d'inscription : porte role+fullName+phone+password+shopName/vehicle
 * d'un seul bloc entre l'écran d'inscription et l'écran OTP — c'est le correctif
 * du bug "le rôle se perd entre register() et verifyOtp()". Reste 100% local,
 * jamais persisté : un mot de passe en clair ne doit pas traîner sur disque. */
export type RegistrationDraft = {
  role: Exclude<Role, null | "admin">;
  fullName: string;
  phone: string;
  password: string;
  shopName?: string;
  vehicle?: Vehicle;
};

const draftStore = createStore<RegistrationDraft | null>(null);
export const useRegistrationDraft = draftStore.useStore;

function applyAccountToUserStore(account: Account | null) {
  if (!account) return;
  setRole(account.role);
  updateUserProfile({ name: account.fullName, phone: account.phone });
}

let unsubscribeAccountDoc: (() => void) | null = null;
let unsubscribeAccountsList: (() => void) | null = null;

function stopAccountsListListener() {
  unsubscribeAccountsList?.();
  unsubscribeAccountsList = null;
  accountsStore.setState([]);
}

function ensureAccountsListListener() {
  if (unsubscribeAccountsList) return;
  unsubscribeAccountsList = subscribeCollection<UserDoc>(
    col(USERS_COLLECTION),
    (items) => accountsStore.setState(items.map((item) => docToAccount(item.id, item))),
    () => accountsStore.setState([])
  );
}

let hydrated = false;

/** À appeler une fois au démarrage de l'app (voir App.tsx). Remplace l'ancienne
 * hydratation AsyncStorage par un abonnement temps réel à la session Firebase. */
export async function hydrateAuthStore() {
  if (hydrated) return;
  hydrated = true;

  subscribeAuthUser((user) => {
    unsubscribeAccountDoc?.();
    unsubscribeAccountDoc = null;

    if (!user) {
      currentAccountStore.setState(null);
      stopAccountsListListener();
      logoutUserStore();
      return;
    }

    unsubscribeAccountDoc = subscribeDoc<UserDoc>(
      USERS_COLLECTION,
      user.uid,
      (data) => {
        const account = data ? docToAccount(user.uid, data) : null;
        currentAccountStore.setState(account);
        applyAccountToUserStore(account);

        if (account?.role === "admin") {
          ensureAccountsListListener();
        } else {
          stopAccountsListListener();
        }
      },
      () => currentAccountStore.setState(null)
    );
  });
}

export function startRegistration(draft: RegistrationDraft) {
  draftStore.setState(draft);
}

export function clearRegistrationDraft() {
  draftStore.setState(null);
}

function mapAuthError(error: unknown): string {
  const code = (error as { code?: string } | null)?.code ?? "";
  switch (code) {
    case "auth/email-already-in-use":
      return "Ce numéro de téléphone est déjà associé à un compte ML CHOP.";
    case "auth/weak-password":
      return "Mot de passe trop court (6 caractères minimum).";
    case "auth/network-request-failed":
      return "Pas de connexion internet — réessayez.";
    default:
      return "Une erreur est survenue. Réessayez dans un instant.";
  }
}

export type OtpResult =
  | { success: true; account: Account }
  | { success: false; reason: "invalid_code" | "no_draft" | "registration_failed"; message?: string };

/** Vérifie le code OTP démo, puis crée le vrai compte Firebase à partir du brouillon conservé. */
export async function verifyRegistrationOtp(code: string): Promise<OtpResult> {
  const draft = draftStore.getState();
  if (!draft) {
    return { success: false, reason: "no_draft" };
  }

  if (code !== DEMO_OTP_CODE) {
    return { success: false, reason: "invalid_code" };
  }

  try {
    const account = await registerAccount({
      role: draft.role,
      fullName: draft.fullName,
      phone: draft.phone,
      password: draft.password,
      shopName: draft.shopName,
      vehicle: draft.role === "delivery" ? draft.vehicle ?? "Moto" : undefined,
    });

    draftStore.setState(null);
    // La session (currentAccountStore) se met à jour toute seule via
    // subscribeAuthUser, déclenché par createUserWithEmailAndPassword.
    return { success: true, account };
  } catch (error) {
    return { success: false, reason: "registration_failed", message: mapAuthError(error) };
  }
}

export type LoginResult =
  | { success: true; account: Account }
  | { success: false; reason: "not_found" | "wrong_password" | "error"; message?: string };

export async function login(phone: string, password: string): Promise<LoginResult> {
  try {
    const account = await signInAccount(phone, password);
    return { success: true, account };
  } catch (error) {
    const code = (error as { code?: string } | null)?.code ?? "";
    if (code === "auth/wrong-password") {
      return { success: false, reason: "wrong_password" };
    }
    if (
      code === "auth/user-not-found" ||
      code === "auth/invalid-credential" ||
      code === "auth/invalid-email"
    ) {
      return { success: false, reason: "not_found" };
    }
    return { success: false, reason: "error", message: mapAuthError(error) };
  }
}

const DEMO_FULL_NAMES: Record<Exclude<Role, null>, string> = {
  client: "Client ML CHOP",
  seller: "Vendeur Démo",
  delivery: "Livreur Démo",
  admin: "Admin ML CHOP",
};

/**
 * Connexion rapide "démo" (bouton dédié dans LoginScreen) : tente une vraie
 * connexion Firebase, et si le compte n'existe pas encore sur CE projet
 * Firebase, le crée à la volée (self-healing) — évite d'avoir à seed la
 * base manuellement avant de tester l'app.
 */
export async function loginDemo(role: Exclude<Role, null>): Promise<LoginResult> {
  const phone = DEMO_PHONES[role];

  try {
    const account = await signInAccount(phone, DEMO_PASSWORD);
    return { success: true, account };
  } catch (error) {
    const code = (error as { code?: string } | null)?.code ?? "";
    const shouldCreate =
      code === "auth/user-not-found" ||
      code === "auth/invalid-credential" ||
      code === "auth/invalid-email";

    if (!shouldCreate) {
      return { success: false, reason: "error", message: mapAuthError(error) };
    }

    // Un compte admin ne s'auto-crée jamais (les Security Rules le refusent, et
    // un admin au mot de passe public serait une faille) : il se crée à la main
    // dans Firebase Console (users/{uid}.role = "admin").
    if (role === "admin") {
      return {
        success: false,
        reason: "error",
        message: "Pas de connexion rapide pour l'admin : connectez-vous avec son mot de passe.",
      };
    }

    try {
      const account = await registerAccount({
        role,
        fullName: DEMO_FULL_NAMES[role],
        phone,
        password: DEMO_PASSWORD,
        shopName: role === "seller" ? "Boutique ML CHOP" : undefined,
        vehicle: role === "delivery" ? "Moto" : undefined,
        forceActive: true,
      });
      return { success: true, account };
    } catch (registerError) {
      return { success: false, reason: "error", message: mapAuthError(registerError) };
    }
  }
}

export function logoutAccount() {
  signOutAccount().catch(() => {});
}

export function setAccountStatus(id: string, status: ApprovalStatus) {
  updateDoc(docRef(USERS_COLLECTION, id), {
    status,
    updatedAt: new Date().toISOString(),
  }).catch((error) => {
    if (__DEV__) {
      console.warn("[authStore] setAccountStatus failed:", error);
    }
  });
}
