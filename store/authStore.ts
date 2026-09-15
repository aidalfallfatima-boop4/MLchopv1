import { createStore } from "./createStore";
import { Account, ApprovalStatus, Role, Vehicle } from "../types";
import { loadJSON, saveJSON } from "../services/persistence";
import { DEMO_OTP_CODE, DEMO_PHONES } from "../constants/config";
import { setRole, updateUserProfile, logout as logoutUserStore } from "./userStore";

const ACCOUNTS_KEY = "mlchop.accounts.v1";
const SESSION_KEY = "mlchop.session.v1";

/**
 * Comptes de démonstration — inchangés depuis la maquette d'origine :
 * connexion immédiate (mot de passe ignoré) avec ces 4 numéros, sans passer
 * par inscription/OTP. Voir CONTINUER.md / section tests.
 */
const DEMO_ACCOUNTS: Account[] = [
  {
    id: "demo-client",
    role: "client",
    fullName: "Client ML CHOP",
    phone: DEMO_PHONES.client,
    password: "",
    status: "active",
    createdAt: new Date(0).toISOString(),
  },
  {
    id: "demo-seller",
    role: "seller",
    fullName: "Vendeur Démo",
    phone: DEMO_PHONES.seller,
    password: "",
    shopName: "Boutique ML CHOP",
    status: "active",
    createdAt: new Date(0).toISOString(),
  },
  {
    id: "demo-delivery",
    role: "delivery",
    fullName: "Livreur Démo",
    phone: DEMO_PHONES.delivery,
    password: "",
    vehicle: "Moto",
    status: "active",
    createdAt: new Date(0).toISOString(),
  },
  {
    id: "demo-admin",
    role: "admin",
    fullName: "Admin ML CHOP",
    phone: DEMO_PHONES.admin,
    password: "",
    status: "active",
    createdAt: new Date(0).toISOString(),
  },
];

function isDemoAccount(account: Account): boolean {
  return account.id.startsWith("demo-");
}

const accountsStore = createStore<Account[]>(DEMO_ACCOUNTS);
const sessionStore = createStore<string | null>(null);

/** Brouillon d'inscription : porte role+fullName+phone+password+shopName/vehicle
 * d'un seul bloc entre l'écran d'inscription et l'écran OTP — c'est le correctif
 * du bug "le rôle se perd entre register() et verifyOtp()". */
export type RegistrationDraft = {
  role: Exclude<Role, null | "admin">;
  fullName: string;
  phone: string;
  password: string;
  shopName?: string;
  vehicle?: Vehicle;
};

const draftStore = createStore<RegistrationDraft | null>(null);

export const useAccounts = accountsStore.useStore;
export const useRegistrationDraft = draftStore.useStore;
export const getAccounts = accountsStore.getState;

export function useCurrentAccount(): Account | null {
  const id = sessionStore.useStore();
  const accounts = accountsStore.useStore();
  return accounts.find((account) => account.id === id) ?? null;
}

function applySessionToUserStore(account: Account | null) {
  if (!account) return;
  setRole(account.role);
  updateUserProfile({ name: account.fullName, phone: account.phone });
}

let hydrated = false;

/** À appeler une fois au démarrage de l'app (voir App.tsx). */
export async function hydrateAuthStore() {
  if (hydrated) return;
  hydrated = true;

  const savedAccounts = await loadJSON<Account[]>(ACCOUNTS_KEY, DEMO_ACCOUNTS);
  const merged = [...savedAccounts];
  for (const demo of DEMO_ACCOUNTS) {
    if (!merged.some((account) => account.id === demo.id)) {
      merged.push(demo);
    }
  }
  accountsStore.setState(merged);

  const savedSession = await loadJSON<string | null>(SESSION_KEY, null);
  if (savedSession && merged.some((account) => account.id === savedSession)) {
    sessionStore.setState(savedSession);
    applySessionToUserStore(merged.find((account) => account.id === savedSession) ?? null);
  }

  accountsStore.subscribe(() => saveJSON(ACCOUNTS_KEY, accountsStore.getState()));
  sessionStore.subscribe(() => saveJSON(SESSION_KEY, sessionStore.getState()));
}

export function startRegistration(draft: RegistrationDraft) {
  draftStore.setState(draft);
}

export function clearRegistrationDraft() {
  draftStore.setState(null);
}

export type OtpResult =
  | { success: true; account: Account }
  | { success: false; reason: "invalid_code" | "no_draft" };

/** Vérifie le code OTP démo et crée le compte à partir du brouillon conservé. */
export function verifyRegistrationOtp(code: string): OtpResult {
  const draft = draftStore.getState();
  if (!draft) {
    return { success: false, reason: "no_draft" };
  }

  if (code !== DEMO_OTP_CODE) {
    return { success: false, reason: "invalid_code" };
  }

  const account: Account = {
    id: `acc-${Date.now()}`,
    role: draft.role,
    fullName: draft.fullName,
    phone: draft.phone,
    password: draft.password,
    shopName: draft.shopName,
    vehicle: draft.role === "delivery" ? draft.vehicle ?? "Moto" : undefined,
    status: draft.role === "client" ? "active" : "pending_approval",
    createdAt: new Date().toISOString(),
  };

  accountsStore.setState((current) => [...current, account]);
  draftStore.setState(null);
  sessionStore.setState(account.id);
  applySessionToUserStore(account);

  return { success: true, account };
}

export type LoginResult =
  | { success: true; account: Account }
  | { success: false; reason: "not_found" | "wrong_password" };

export function login(phone: string, password: string): LoginResult {
  const account = accountsStore
    .getState()
    .find((item) => item.phone.trim() === phone.trim());

  if (!account) {
    return { success: false, reason: "not_found" };
  }

  if (!isDemoAccount(account) && account.password !== password) {
    return { success: false, reason: "wrong_password" };
  }

  sessionStore.setState(account.id);
  applySessionToUserStore(account);
  return { success: true, account };
}

export function logoutAccount() {
  sessionStore.setState(null);
  logoutUserStore();
}

export function setAccountStatus(id: string, status: ApprovalStatus) {
  accountsStore.setState((current) =>
    current.map((account) => (account.id === id ? { ...account, status } : account))
  );
}
