import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { useOrderStore } from "../../store/orderStore";
import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/formatDate";
import { STATUS_META } from "../../constants/theme";
import Header from "../../components/Header";

type Props = { onBack: () => void };

export default function AdminOrders({ onBack }: Props) {
  const orders = useOrderStore();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Commandes" subtitle={`${orders.length} au total`} onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        {orders.map((order) => {
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
              <Text style={styles.customer}>{order.customerName} · {order.deliveryAddress}</Text>
              <Text style={styles.meta}>{formatDate(order.createdAt)}</Text>
              <Text style={styles.total}>{formatPrice(order.total)}</Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  content: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  id: { fontWeight: "900", color: "#0F172A" },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: "900" },
  customer: { marginTop: 8, fontSize: 12, fontWeight: "700", color: "#334155" },
  meta: { marginTop: 4, fontSize: 11, color: "#94A3B8" },
  total: { marginTop: 8, fontWeight: "900", color: "#0F172A" },
});
