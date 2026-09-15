import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { useOrderStore } from "../../store/orderStore";
import { formatPrice } from "../../utils/formatPrice";
import { getRoleTheme } from "../../constants/roleTheme";
import Header from "../../components/Header";

const theme = getRoleTheme("seller");

export default function SellerRevenue({ onBack }: { onBack?: () => void }) {
  const orders = useOrderStore();
  const paidOrders = orders.filter((order) => order.status !== "cancelled");
  const revenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const today = new Date().toDateString();
  const todayOrders = paidOrders.filter((order) => new Date(order.createdAt).toDateString() === today);
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
  const avgOrder = paidOrders.length > 0 ? revenue / paidOrders.length : 0;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Revenus" subtitle="Performance de la boutique" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mainCard}>
          <Text style={styles.mainLabel}>Chiffre d'affaires total</Text>
          <Text style={styles.mainValue}>{formatPrice(revenue)}</Text>
          <Text style={styles.mainHint}>{paidOrders.length} commande(s) valides</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statValue}>{formatPrice(todayRevenue)}</Text>
            <Text style={styles.statLabel}>Aujourd'hui ({todayOrders.length})</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🧮</Text>
            <Text style={styles.statValue}>{formatPrice(avgOrder)}</Text>
            <Text style={styles.statLabel}>Panier moyen</Text>
          </View>
        </View>

        <Text style={styles.section}>Dernières ventes</Text>
        {paidOrders.slice(0, 8).map((order) => (
          <View key={order.id} style={styles.orderRow}>
            <Text style={styles.orderId}>{order.id}</Text>
            <Text style={styles.orderCustomer}>{order.customerName}</Text>
            <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingBottom: 100 },
  mainCard: {
    backgroundColor: theme.primary,
    borderRadius: 20,
    padding: 22,
  },
  mainLabel: { color: "#E0E7FF", fontSize: 13 },
  mainValue: { marginTop: 8, color: "#FFFFFF", fontSize: 30, fontWeight: "900" },
  mainHint: { marginTop: 8, color: "#E0E7FF", fontSize: 12 },
  row: { marginTop: 14, flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statIcon: { fontSize: 20 },
  statValue: { marginTop: 8, fontSize: 15, fontWeight: "900", color: "#1E1B4B" },
  statLabel: { marginTop: 4, fontSize: 11, color: "#6B7280" },
  section: { marginTop: 24, marginBottom: 12, fontSize: 16, fontWeight: "900", color: "#1E1B4B" },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  orderId: { fontWeight: "900", color: theme.primary, width: 80, fontSize: 12 },
  orderCustomer: { flex: 1, fontSize: 12, color: "#374151" },
  orderTotal: { fontWeight: "900", fontSize: 12, color: "#1E1B4B" },
});
