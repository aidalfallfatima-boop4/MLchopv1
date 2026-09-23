import { Platform } from "react-native";

import { createStore } from "./createStore";
import { Role } from "../types";
import { getCurrentAccount, subscribeCurrentAccount } from "./authStore";
import {
  col,
  doc,
  docRef,
  limit,
  orderBy,
  query,
  setDoc,
  subscribeCollection,
  updateDoc,
} from "../services/firebase/firestore";

/** Retours des testeurs ("Signaler un bug"). La forme du document est vérifiée
 * à l'identique par les Security Rules (firestore.rules) : ne pas ajouter de clé. */
const FEEDBACK_COLLECTION = "feedback";
const MAX_FEEDBACK_LISTED = 200;

export const FEEDBACK_MESSAGE_MIN = 5;
export const FEEDBACK_MESSAGE_MAX = 2000;
const SCREEN_MAX = 60;
const USER_AGENT_MAX = 300;

export type FeedbackType = "bug" | "suggestion" | "security";
export type FeedbackStatus = "new" | "seen" | "fixed";

export type Feedback = {
  id: string;
  userId: string;
  role: Exclude<Role, null>;
  type: FeedbackType;
  message: string;
  screen: string;
  userAgent: string;
  createdAt: string;
  status: FeedbackStatus;
};

type FeedbackDoc = Omit<Feedback, "id">;

export type FeedbackInput = {
  type: FeedbackType;
  message: string;
  screen: string;
};

const FEEDBACK_TYPES: FeedbackType[] = ["bug", "suggestion", "security"];

function readUserAgent(): string {
  if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.userAgent) {
    return navigator.userAgent.slice(0, USER_AGENT_MAX);
  }
  return `${Platform.OS}`.slice(0, USER_AGENT_MAX);
}

/** Envoie un retour testeur. Lève une Error au message lisible (affiché dans la modale). */
export async function sendFeedback(input: FeedbackInput): Promise<void> {
  const account = getCurrentAccount();
  if (!account) {
    throw new Error("Vous devez être connecté pour envoyer un retour.");
  }
  if (!FEEDBACK_TYPES.includes(input.type)) {
    throw new Error("Type de retour invalide.");
  }

  const message = input.message.trim();
  if (message.length < FEEDBACK_MESSAGE_MIN) {
    throw new Error(`Décrivez le problème en au moins ${FEEDBACK_MESSAGE_MIN} caractères.`);
  }
  if (message.length > FEEDBACK_MESSAGE_MAX) {
    throw new Error(`Message trop long (${FEEDBACK_MESSAGE_MAX} caractères maximum).`);
  }

  const feedback: FeedbackDoc = {
    userId: account.id,
    role: account.role,
    type: input.type,
    message,
    screen: (input.screen || "inconnu").slice(0, SCREEN_MAX),
    userAgent: readUserAgent(),
    createdAt: new Date().toISOString(),
    status: "new",
  };

  try {
    await setDoc(doc(col(FEEDBACK_COLLECTION)), feedback);
  } catch (error) {
    if (__DEV__) console.warn("[feedbackStore] sendFeedback failed:", error);
    throw new Error("Envoi impossible pour le moment. Vérifiez votre connexion et réessayez.");
  }
}

// --- Liste temps réel (admin uniquement) -----------------------------------

const listStore = createStore<Feedback[]>([]);
let started = false;
let unsubscribeList: (() => void) | null = null;
let listeningUid: string | null = null;

function resubscribeList() {
  const account = getCurrentAccount();
  const adminUid = account?.role === "admin" ? account.id : null;
  if (adminUid === listeningUid) return;
  listeningUid = adminUid;

  unsubscribeList?.();
  unsubscribeList = null;
  listStore.setState([]);

  if (!adminUid) return;

  const target = query(
    col(FEEDBACK_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(MAX_FEEDBACK_LISTED)
  );
  unsubscribeList = subscribeCollection<FeedbackDoc>(
    target,
    (items) => listStore.setState(items),
    () => listStore.setState([])
  );
}

function ensureListListener() {
  if (started) return;
  started = true;
  resubscribeList();
  subscribeCurrentAccount(resubscribeList);
}

/** Retours testeurs, du plus récent au plus ancien. Vide pour tout rôle non admin
 * (les Security Rules refusent de toute façon la lecture aux autres rôles). */
export function useFeedbackList(): Feedback[] {
  ensureListListener();
  return listStore.useStore();
}

export async function setFeedbackStatus(id: string, status: FeedbackStatus): Promise<void> {
  const previous = listStore.getState();
  listStore.setState((current) =>
    current.map((item) => (item.id === id ? { ...item, status } : item))
  );
  try {
    await updateDoc(docRef(FEEDBACK_COLLECTION, id), { status });
  } catch (error) {
    listStore.setState(previous);
    throw error;
  }
}
