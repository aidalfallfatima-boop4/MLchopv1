import { createStore } from "./createStore";
import { NotificationType } from "../constants/theme";
import { getCurrentAccount, subscribeCurrentAccount } from "./authStore";
import {
  col,
  deleteDoc,
  docRef,
  limit,
  query,
  setDoc,
  subscribeCollection,
  updateDoc,
  where,
} from "../services/firebase/firestore";

const NOTIFICATIONS_COLLECTION = "notifications";
const MAX_NOTIFICATIONS = 30;

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
  read: boolean;
};

type NotificationDoc = Omit<AppNotification, "id"> & { userId: string };

const store = createStore<AppNotification[]>([]);

export const useNotifications = store.useStore;
export const getNotifications = store.getState;

let hydrated = false;
let unsubscribeQuery: (() => void) | null = null;
let currentUid: string | null = null;

function sortByCreatedAtDesc(items: AppNotification[]): AppNotification[] {
  return [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function resubscribe() {
  const uid = getCurrentAccount()?.id ?? null;
  if (uid === currentUid) return;
  currentUid = uid;

  unsubscribeQuery?.();
  unsubscribeQuery = null;
  store.setState([]);

  if (!uid) return;

  const target = query(col(NOTIFICATIONS_COLLECTION), where("userId", "==", uid), limit(200));

  unsubscribeQuery = subscribeCollection<NotificationDoc>(target, (items) => {
    store.setState(
      sortByCreatedAtDesc(
        items.slice(0, MAX_NOTIFICATIONS).map(({ id, title, message, type, createdAt, read }) => ({
          id,
          title,
          message,
          type,
          createdAt,
          read,
        }))
      )
    );
  });
}

/** À appeler une fois au démarrage : écoute mes notifications Firestore en temps réel. */
export async function hydrateNotificationStore() {
  if (hydrated) return;
  hydrated = true;
  resubscribe();
  subscribeCurrentAccount(resubscribe);
}

export function pushNotification(input: {
  title: string;
  message: string;
  type?: NotificationType;
  /** Destinataire — par défaut l'utilisateur connecté (notif "pour moi-même"). */
  userId?: string;
}): AppNotification {
  const notification: AppNotification = {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title,
    message: input.message,
    type: input.type ?? "info",
    createdAt: new Date().toISOString(),
    read: false,
  };

  const targetUid = input.userId ?? currentUid ?? getCurrentAccount()?.id;

  // Optimiste : si la notif me vise (ou si je n'ai pas encore de session), je
  // l'affiche tout de suite sans attendre l'aller-retour Firestore.
  if (!targetUid || targetUid === currentUid) {
    store.setState((current) => sortByCreatedAtDesc([notification, ...current]).slice(0, MAX_NOTIFICATIONS));
  }

  if (targetUid) {
    const doc: NotificationDoc = { ...notification, userId: targetUid };
    setDoc(docRef(NOTIFICATIONS_COLLECTION, notification.id), doc).catch((error) => {
      if (__DEV__) console.warn("[notificationStore] pushNotification failed:", error);
    });
  }

  return notification;
}

export function markNotificationRead(id: string) {
  store.setState((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
  updateDoc(docRef(NOTIFICATIONS_COLLECTION, id), { read: true }).catch(() => {});
}

export function markAllNotificationsRead() {
  const unreadIds = store.getState().filter((item) => !item.read).map((item) => item.id);
  store.setState((current) => current.map((item) => ({ ...item, read: true })));
  unreadIds.forEach((id) => {
    updateDoc(docRef(NOTIFICATIONS_COLLECTION, id), { read: true }).catch(() => {});
  });
}

export function clearNotifications() {
  const ids = store.getState().map((item) => item.id);
  store.setState([]);
  ids.forEach((id) => {
    deleteDoc(docRef(NOTIFICATIONS_COLLECTION, id)).catch(() => {});
  });
}

export function getUnreadCount(list: AppNotification[]): number {
  return list.filter((item) => !item.read).length;
}
