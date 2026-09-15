import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useOrderStore } from "../../store/orderStore";
import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/formatDate";
import { STATUS_META } from "../../constants/theme";
import Header from "../../components/Header";
import NotificationBell from "../../components/NotificationBell";

type Props = {
  onTrackOrder?: (orderId: string) => void;
};

const TRACKABLE = new Set(["pending", "confirmed", "preparing", "shipping"]);

export default function OrdersScreen({ onTrackOrder }: Props) {
  const orders = useOrderStore();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Commandes" subtitle="Suivi de vos achats" right={<NotificationBell />} />

      <ScrollView contentContainerStyle={styles.content}>
        {orders.length === 0 ? (
          <Text style={styles.empty}>Aucune commande pour le moment.</Text>
        ) : (
          orders.map((order) => {
            const meta = STATUS_META[order.status];
            return (
              <View key={order.id} style={styles.card}>
                <View style={styles.top}>
                  <Text style={styles.id}>{order.id}</Text>
                  <View style={[styles.badge, { backgroundColor: meta.background }]}>
                    <Text style={[styles.badgeText, { color: meta.color }]}>
                      {meta.icon} {meta.label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.meta}>{formatDate(order.createdAt)}</Text>
                <Text style={styles.items}>
                  {order.items.map((item) => `${item.emoji} ${item.name}`).join(" · ")}
                </Text>
                <Text style={styles.address}>📍 {order.deliveryAddress}</Text>
                {order.deliveryCode ? (
                  <Text style={styles.code}>Code : {order.deliveryCode}</Text>
                ) : null}

                <View style={styles.bottomRow}>
                  <Text style={styles.total}>{formatPrice(order.total)}</Text>

                  {onTrackOrder && TRACKABLE.has(order.status) ? (
                    <TouchableOpacity
                      style={[styles.trackButton, { backgroundColor: meta.color }]}
                      onPress={() => onTrackOrder(order.id)}
                    >
                      <Text style={styles.trackButtonText}>🗺️ Suivre ma commande</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingBottom: 100 },
  empty: { textAlign: "center", marginTop: 40, color: "#888" },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  id: { fontWeight: "900", color: "#111827" },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 10, fontWeight: "900" },
  meta: { marginTop: 6, fontSize: 11, color: "#888" },
  items: { marginTop: 8, fontSize: 13, color: "#333" },
  address: { marginTop: 6, fontSize: 12, color: "#666" },
  code: { marginTop: 6, fontSize: 12, fontWeight: "800", color: "#222" },
  bottomRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  total: { fontWeight: "900", color: "#111827", fontSize: 15 },
  trackButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  trackButtonText: { color: "#FFF", fontWeight: "900", fontSize: 11 },
});
