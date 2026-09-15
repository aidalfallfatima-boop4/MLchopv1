import { createStore } from "./createStore";
import { NotificationType } from "../constants/theme";
import { loadJSON, saveJSON } from "../services/persistence";

const STORAGE_KEY = "mlchop.notifications.v1";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
  read: boolean;
};

const MAX_NOTIFICATIONS = 30;

const store = createStore<AppNotification[]>([]);

export const useNotifications = store.useStore;
export const getNotifications = store.getState;

let hydrated = false;

/** À appeler une fois au démarrage : restaure le centre de notifications. */
export async function hydrateNotificationStore() {
  if (hydrated) return;
  hydrated = true;
  const saved = await loadJSON<AppNotification[]>(STORAGE_KEY, []);
  store.setState(saved);
  store.subscribe(() => saveJSON(STORAGE_KEY, store.getState()));
}

export function pushNotification(input: {
  title: string;
  message: string;
  type?: NotificationType;
}): AppNotification {
  const notification: AppNotification = {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title,
    message: input.message,
    type: input.type ?? "info",
    createdAt: new Date().toISOString(),
    read: false,
  };

  store.setState((current) =>
    [notification, ...current].slice(0, MAX_NOTIFICATIONS)
  );

  return notification;
}

export function markNotificationRead(id: string) {
  store.setState((current) =>
    current.map((item) => (item.id === id ? { ...item, read: true } : item))
  );
}

export function markAllNotificationsRead() {
  store.setState((current) => current.map((item) => ({ ...item, read: true })));
}

export function clearNotifications() {
  store.setState([]);
}

export function getUnreadCount(list: AppNotification[]): number {
  return list.filter((item) => !item.read).length;
}
