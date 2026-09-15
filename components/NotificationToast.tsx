import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useNotifications, AppNotification } from "../store/notificationStore";
import { NOTIFICATION_META } from "../constants/theme";

const AUTO_HIDE_MS = 4000;

/**
 * Banniere qui apparaît en haut de l'écran client à chaque nouvelle
 * notification (commande confirmée, livreur en route, etc.) puis se
 * referme seule — pour un système de notification "clair" et immédiat,
 * en plus du centre de notifications (cloche).
 */
export default function NotificationToast() {
  const notifications = useNotifications();
  const [visible, setVisible] = useState<AppNotification | null>(null);
  const lastSeenId = useRef<string | null>(null);
  const translateY = useRef(new Animated.Value(-120)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const latest = notifications[0];
    if (!latest || latest.id === lastSeenId.current) {
      return;
    }

    lastSeenId.current = latest.id;
    setVisible(latest);
  }, [notifications]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      speed: 16,
      bounciness: 6,
    }).start();

    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(dismiss, AUTO_HIDE_MS);

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function dismiss() {
    Animated.timing(translateY, {
      toValue: -120,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setVisible(null));
  }

  if (!visible) {
    return null;
  }

  const meta = NOTIFICATION_META[visible.type];

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { transform: [{ translateY }] },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={dismiss}
        style={[styles.toast, { borderLeftColor: meta.color }]}
      >
        <Text style={styles.icon}>{meta.icon}</Text>
        <View style={styles.body}>
          <Text style={styles.title}>{visible.title}</Text>
          <Text style={styles.message} numberOfLines={2}>
            {visible.message}
          </Text>
        </View>
        <Text style={styles.close}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 14,
    paddingHorizontal: 14,
    zIndex: 1000,
    alignItems: "center",
  },
  toast: {
    width: "100%",
    maxWidth: 420,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderLeftWidth: 5,
    paddingVertical: 12,
    paddingHorizontal: 14,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  icon: { fontSize: 20, marginRight: 10 },
  body: { flex: 1 },
  title: { fontSize: 13, fontWeight: "900", color: "#111827" },
  message: { marginTop: 2, fontSize: 12, color: "#4B5563" },
  close: { fontSize: 20, color: "#9CA3AF", marginLeft: 8, fontWeight: "300" },
});
