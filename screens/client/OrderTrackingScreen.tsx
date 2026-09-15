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
import { useDriverPosition } from "../../store/deliveryStore";
import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/formatDate";
import { paymentLabel } from "../../utils/orderLabels";
import { STATUS_META } from "../../constants/theme";
import { ROUTE_LANDMARKS } from "../../constants/landmarks";
import Header from "../../components/Header";
import OrderStatusTimeline from "../../components/OrderStatusTimeline";
import LiveTrackingMap from "../../components/LiveTrackingMap";

type Props = {
  orderId: string | null;
  onBack: () => void;
};

export default function OrderTrackingScreen({ orderId, onBack }: Props) {
  const orders = useOrderStore();
  const driver = useDriverPosition();

  const order = orderId
    ? orders.find((item) => item.id === orderId)
    : orders[0];

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Suivi de commande" onBack={onBack} />
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>Aucune commande à suivre pour le moment.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const meta = STATUS_META[order.status];

  return (
    <SafeAreaView style={styles.container}>
      <Header title={`Commande ${order.id}`} subtitle={formatDate(order.createdAt)} onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.statusBanner, { backgroundColor: meta.background }]}>
          <Text style={styles.statusIcon}>{meta.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusLabel, { color: meta.color }]}>{meta.label}</Text>
            <Text style={styles.statusHint}>
              {order.status === "shipping"
                ? "Votre livreur est en route."
                : order.status === "delivered"
                ? "Livraison terminée."
                : "Nous vous tenons informé à chaque étape."}
            </Text>
          </View>
        </View>

        <Text style={styles.section}>🗺️ Suivi en direct</Text>
        <LiveTrackingMap status={order.status} driver={driver} />

        <Text style={styles.section}>📍 Repères sur le trajet</Text>
        <View style={styles.landmarksCard}>
          {ROUTE_LANDMARKS.map((landmark, index) => (
            <View
              key={landmark.name}
              style={[
                styles.landmarkRow,
                index === ROUTE_LANDMARKS.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Text style={styles.landmarkIcon}>{landmark.icon}</Text>
              <Text style={styles.landmarkName}>{landmark.name}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.section}>📋 Étapes de la commande</Text>
        <View style={styles.timelineCard}>
          <OrderStatusTimeline status={order.status} />
        </View>

        {order.deliveryCode ? (
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Code de remise à donner au livreur</Text>
            <Text style={styles.codeValue}>{order.deliveryCode}</Text>
          </View>
        ) : null}

        <Text style={styles.section}>🛒 Contenu</Text>
        <View style={styles.itemsCard}>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQty}>×{item.quantity}</Text>
              <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.totalLabel}>Total ({paymentLabel(order.paymentMethod)})</Text>
            <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
          </View>
        </View>

        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactIcon}>☎️</Text>
            <Text style={styles.contactText}>Appeler le livreur</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactIcon}>💬</Text>
            <Text style={styles.contactText}>Message</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingBottom: 50 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyText: { color: "#9CA3AF", fontSize: 13 },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  statusIcon: { fontSize: 26, marginRight: 12 },
  statusLabel: { fontSize: 16, fontWeight: "900" },
  statusHint: { marginTop: 3, fontSize: 12, color: "#4B5563" },
  section: { fontSize: 15, fontWeight: "900", color: "#111827", marginBottom: 10, marginTop: 6 },
  landmarksCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EEF0F3",
    marginBottom: 20,
  },
  landmarkRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  landmarkIcon: { fontSize: 18, marginRight: 10 },
  landmarkName: { fontSize: 13, fontWeight: "700", color: "#374151" },
  timelineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EEF0F3",
    padding: 16,
    marginBottom: 20,
  },
  codeCard: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    marginBottom: 20,
  },
  codeLabel: { color: "#D1D5DB", fontSize: 12, textAlign: "center" },
  codeValue: { color: "#FFFFFF", fontSize: 30, fontWeight: "900", letterSpacing: 6, marginTop: 6 },
  itemsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EEF0F3",
    padding: 16,
    marginBottom: 20,
  },
  itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  itemEmoji: { fontSize: 18, width: 28 },
  itemName: { flex: 1, fontSize: 13, color: "#111827", fontWeight: "700" },
  itemQty: { fontSize: 12, color: "#9CA3AF", marginRight: 10 },
  itemPrice: { fontSize: 13, fontWeight: "900", color: "#111827" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 10 },
  totalLabel: { flex: 1, fontWeight: "900", color: "#111827" },
  totalValue: { fontWeight: "900", color: "#111827", fontSize: 15 },
  contactRow: { flexDirection: "row", gap: 12 },
  contactButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEF0F3",
  },
  contactIcon: { fontSize: 18 },
  contactText: { marginTop: 4, fontSize: 11, fontWeight: "800", color: "#374151" },
});
