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
import { useAvailableOrders, useMissionOrder, useMissionPhase } from "../../store/deliveryStore";
import { useCurrentAccount } from "../../store/authStore";
import DeliveryStatusCard from "../../components/delivery/DeliveryStatusCard";

type Props = {
  onNewOrder: () => void;
  onActive: () => void;
  onEarnings: () => void;
  onHistory: () => void;
  onProfile: () => void;
};

export default function DeliveryDashboard({
  onNewOrder,
  onActive,
  onEarnings,
  onHistory,
  onProfile,
}: Props) {
  const orders = useOrderStore();
  const available = useAvailableOrders();
  const activeOrder = useMissionOrder();
  const phase = useMissionPhase();
  const account = useCurrentAccount();
  const pendingApproval = account?.status === "pending_approval";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>Livreur 🛵 · {account?.vehicle ?? "Moto"}</Text>
            <Text style={styles.title}>Tableau de bord</Text>
          </View>
          <View style={[styles.online, pendingApproval && styles.pending]}>
            <View style={[styles.dot, pendingApproval && styles.pendingDot]} />
            <Text style={[styles.onlineText, pendingApproval && styles.pendingText]}>
              {pendingApproval ? "En attente" : "En ligne"}
            </Text>
          </View>
        </View>

        {pendingApproval ? (
          <View style={styles.pendingBanner}>
            <Text style={styles.pendingBannerIcon}>⏳</Text>
            <Text style={styles.pendingBannerText}>
              Compte en attente d'approbation par l'équipe ML CHOP. Vous ne pouvez pas encore
              accepter de missions.
            </Text>
          </View>
        ) : null}

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Missions disponibles</Text>
          <Text style={styles.heroValue}>{available.length}</Text>
          <Text style={styles.heroHint}>Acceptez une livraison pour démarrer</Text>
        </View>

        {activeOrder && activeOrder.status !== "delivered" ? (
          <DeliveryStatusCard order={activeOrder} phase={phase} onPress={onActive} />
        ) : null}

        <TouchableOpacity style={styles.cta} onPress={onNewOrder}>
          <Text style={styles.ctaText}>📦 LIVRAISONS DISPONIBLES</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <TouchableOpacity style={styles.tile} onPress={onEarnings}>
            <Text style={styles.tileIcon}>💰</Text>
            <Text style={styles.tileTitle}>Revenus</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tile} onPress={onHistory}>
            <Text style={styles.tileIcon}>🕘</Text>
            <Text style={styles.tileTitle}>Historique</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tile} onPress={onProfile}>
            <Text style={styles.tileIcon}>👤</Text>
            <Text style={styles.tileTitle}>Profil</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.section}>Dernières commandes</Text>
        {orders.slice(0, 4).map((order) => (
          <View key={order.id} style={styles.card}>
            <View>
              <Text style={styles.orderId}>{order.id}</Text>
              <Text style={styles.meta}>{order.customerName}</Text>
            </View>
            <Text style={styles.fee}>
              {formatPrice(order.deliveryFee ?? 2500)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hello: { color: "#888", fontSize: 13 },
  title: { marginTop: 4, fontSize: 24, fontWeight: "900", color: "#222" },
  online: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F7EE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22A06B",
    marginRight: 6,
  },
  onlineText: { color: "#22A06B", fontWeight: "800", fontSize: 11 },
  pending: { backgroundColor: "#FEF3C7" },
  pendingDot: { backgroundColor: "#D97706" },
  pendingText: { color: "#B45309" },
  pendingBanner: {
    marginTop: 16,
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    borderRadius: 14,
    padding: 12,
  },
  pendingBannerIcon: { fontSize: 18, marginRight: 8 },
  pendingBannerText: { flex: 1, fontSize: 11, color: "#92400E", lineHeight: 16, fontWeight: "700" },
  hero: {
    marginTop: 20,
    backgroundColor: "#F28C28",
    borderRadius: 20,
    padding: 20,
  },
  heroLabel: { color: "#FFF", opacity: 0.9 },
  heroValue: { marginTop: 6, color: "#FFF", fontSize: 36, fontWeight: "900" },
  heroHint: { marginTop: 6, color: "#FFF", opacity: 0.9, fontSize: 12 },
  cta: {
    marginTop: 16,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#FFF", fontWeight: "900" },
  row: { marginTop: 16, flexDirection: "row", gap: 10 },
  tile: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEE",
    alignItems: "center",
  },
  tileIcon: { fontSize: 22 },
  tileTitle: { marginTop: 6, fontWeight: "800", fontSize: 12 },
  section: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "900",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  orderId: { fontWeight: "900", color: "#F28C28" },
  meta: { marginTop: 4, fontSize: 12, color: "#777" },
  fee: { fontWeight: "900", color: "#222" },
});
