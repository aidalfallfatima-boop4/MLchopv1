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
import { reportSubscriptionError, reportWriteError } from "../services/firebase/writeError";

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
/** Notifications purement locales (erreurs d'écriture, alertes réseau…) : jamais
 * écrites dans Firestore, donc ré-injectées à chaque snapshot pour ne pas
 * disparaître dès que le listener pousse la liste serveur. */
let localOnly: AppNotification[] = [];
let lastRemote: AppNotification[] = [];

function sortByCreatedAtDesc(items: AppNotification[]): AppNotification[] {
  return [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

function resubscribe() {
  const uid = getCurrentAccount()?.id ?? null;
  if (uid === currentUid) return;
  currentUid = uid;

  unsubscribeQuery?.();
  unsubscribeQuery = null;
  localOnly = [];
  lastRemote = [];
  store.setState([]);

  if (!uid) return;

  const target = query(col(NOTIFICATIONS_COLLECTION), where("userId", "==", uid), limit(200));

  unsubscribeQuery = subscribeCollection<NotificationDoc>(
    target,
    (items) => {
      lastRemote = items.map(({ id, title, message, type, createdAt, read }) => ({
        id,
        title,
        message,
        type,
        createdAt,
        read,
      }));
      renderMerged();
    },
    // Erreur d'écoute : on garde les notifications déjà affichées.
    (error) => reportSubscriptionError("notificationStore", error)
  );
}

function renderMerged() {
  store.setState(sortByCreatedAtDesc([...localOnly, ...lastRemote]).slice(0, MAX_NOTIFICATIONS));
}

function isLocalOnly(id: string): boolean {
  return localOnly.some((item) => item.id === id);
}

/** À appeler une fois au démarrage : écoute mes notifications Firestore en temps réel. */
export async function hydrateNotificationStore() {
  if (hydrated) return;
  hydrated = true;
  resubscribe();
  subscribeCurrentAccount(resubscribe);
}

/**
 * Notification 100% locale (jamais écrite dans Firestore) — utilisée pour les
 * toasts d'erreur (voir services/firebase/writeError.ts). NotificationToast
 * affiche automatiquement le dernier élément de ce store.
 */
export function pushLocalNotification(input: {
  title: string;
  message: string;
  type?: NotificationType;
}): AppNotification {
  const notification: AppNotification = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title,
    message: input.message,
    type: input.type ?? "info",
    createdAt: new Date().toISOString(),
    read: false,
  };

  localOnly = [notification, ...localOnly].slice(0, MAX_NOTIFICATIONS);
  store.setState((current) => sortByCreatedAtDesc([notification, ...current]).slice(0, MAX_NOTIFICATIONS));
  return notification;
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
    setDoc(docRef(NOTIFICATIONS_COLLECTION, notification.id), doc).catch((error) =>
      reportWriteError("notificationStore.pushNotification", error)
    );
  }

  return notification;
}

export function markNotificationRead(id: string) {
  const wasRead = store.getState().find((item) => item.id === id)?.read ?? false;
  localOnly = localOnly.map((item) => (item.id === id ? { ...item, read: true } : item));
  store.setState((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
  if (isLocalOnly(id)) return;

  updateDoc(docRef(NOTIFICATIONS_COLLECTION, id), { read: true }).catch((error) => {
    store.setState((current) =>
      current.map((item) => (item.id === id ? { ...item, read: wasRead } : item))
    );
    reportWriteError("notificationStore.markNotificationRead", error);
  });
}

export function markAllNotificationsRead() {
  const unreadIds = store
    .getState()
    .filter((item) => !item.read && !isLocalOnly(item.id))
    .map((item) => item.id);
  localOnly = localOnly.map((item) => ({ ...item, read: true }));
  store.setState((current) => current.map((item) => ({ ...item, read: true })));

  Promise.all(
    unreadIds.map((id) => updateDoc(docRef(NOTIFICATIONS_COLLECTION, id), { read: true }))
  ).catch((error) => reportWriteError("notificationStore.markAllNotificationsRead", error));
}

export function clearNotifications() {
  const ids = store
    .getState()
    .filter((item) => !isLocalOnly(item.id))
    .map((item) => item.id);
  localOnly = [];
  store.setState([]);

  Promise.all(ids.map((id) => deleteDoc(docRef(NOTIFICATIONS_COLLECTION, id)))).catch((error) => {
    // Restaure la dernière liste serveur connue (docs non supprimés inclus).
    renderMerged();
    reportWriteError("notificationStore.clearNotifications", error);
  });
}

export function getUnreadCount(list: AppNotification[]): number {
  return list.filter((item) => !item.read).length;
}
