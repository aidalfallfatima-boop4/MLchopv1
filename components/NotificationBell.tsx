import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  markAllNotificationsRead,
  useNotifications,
  getUnreadCount,
} from "../store/notificationStore";
import { NOTIFICATION_META } from "../constants/theme";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;

  return `il y a ${Math.floor(hours / 24)} j`;
}

export default function NotificationBell() {
  const notifications = useNotifications();
  const unread = getUnreadCount(notifications);
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.bellButton}
        onPress={() => {
          setOpen(true);
          markAllNotificationsRead();
        }}
      >
        <Text style={styles.bellIcon}>🔔</Text>
        {unread > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread > 9 ? "9+" : unread}</Text>
          </View>
        ) : null}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={styles.panel}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text style={styles.close}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <Text style={styles.empty}>Aucune notification pour le moment.</Text>
              ) : (
                notifications.map((item) => {
                  const meta = NOTIFICATION_META[item.type];
                  return (
                    <View
                      key={item.id}
                      style={[styles.item, { backgroundColor: meta.background }]}
                    >
                      <Text style={styles.itemIcon}>{meta.icon}</Text>
                      <View style={styles.itemBody}>
                        <Text style={[styles.itemTitle, { color: meta.color }]}>
                          {item.title}
                        </Text>
                        <Text style={styles.itemMessage}>{item.message}</Text>
                        <Text style={styles.itemTime}>{timeAgo(item.createdAt)}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    alignItems: "center",
    justifyContent: "center",
  },
  bellIcon: { fontSize: 19 },
  badge: {
    position: "absolute",
    right: -4,
    top: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#FFF", fontSize: 9, fontWeight: "900" },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.35)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    padding: 16,
  },
  panel: {
    marginTop: 56,
    width: 320,
    maxWidth: "100%",
    maxHeight: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  panelTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },
  close: { fontSize: 24, color: "#9CA3AF", fontWeight: "300" },
  list: { maxHeight: 360 },
  empty: {
    textAlign: "center",
    color: "#9CA3AF",
    paddingVertical: 30,
    fontSize: 13,
  },
  item: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  itemIcon: { fontSize: 18, marginRight: 10 },
  itemBody: { flex: 1 },
  itemTitle: { fontWeight: "900", fontSize: 13 },
  itemMessage: { marginTop: 3, fontSize: 12, color: "#374151", lineHeight: 17 },
  itemTime: { marginTop: 4, fontSize: 10, color: "#9CA3AF", fontWeight: "700" },
});
