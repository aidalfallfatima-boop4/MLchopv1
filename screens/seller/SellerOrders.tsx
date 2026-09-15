import React from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useOrderStore, updateOrderStatus } from "../../store/orderStore";
import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/formatDate";
import { OrderStatus } from "../../types";
import { STATUS_META } from "../../constants/theme";
import { getRoleTheme } from "../../constants/roleTheme";
import Header from "../../components/Header";

type Props = {
  onBack?: () => void;
};

const theme = getRoleTheme("seller");

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "shipping",
  shipping: "delivered",
};

const NEXT_ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  pending: "✅ Confirmer",
  confirmed: "👨‍🍳 Préparer",
  preparing: "📦 Marquer prête / transmettre au livreur",
  shipping: "🏁 Marquer livrée",
};

export default function SellerOrders({ onBack }: Props) {
  const orders = useOrderStore();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Commandes" subtitle="Gestion boutique" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        {orders.length === 0 ? (
          <Text style={styles.empty}>Aucune commande pour le moment.</Text>
        ) : (
          orders.map((order) => {
            const next = NEXT[order.status];
            const meta = STATUS_META[order.status];
            const canReject = order.status === "pending";

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
                <Text style={styles.customer}>{order.customerName}</Text>
                <Text style={styles.meta}>{order.deliveryAddress}</Text>
                <Text style={styles.meta}>{formatDate(order.createdAt)}</Text>
                <Text style={styles.items}>
                  {order.items.map((item) => `${item.emoji} ${item.name} ×${item.quantity}`).join(" · ")}
                </Text>
                <Text style={styles.price}>{formatPrice(order.total)}</Text>

                {next ? (
                  <TouchableOpacity
                    style={styles.cta}
                    onPress={() => updateOrderStatus(order.id, next)}
                  >
                    <Text style={styles.ctaText}>{NEXT_ACTION_LABEL[order.status]}</Text>
                  </TouchableOpacity>
                ) : null}

                {canReject ? (
                  <TouchableOpacity
                    style={styles.reject}
                    onPress={() =>
                      Alert.alert("Refuser la commande", `Refuser ${order.id} ?`, [
                        { text: "Annuler", style: "cancel" },
                        {
                          text: "Refuser",
                          style: "destructive",
                          onPress: () => updateOrderStatus(order.id, "cancelled"),
                        },
                      ])
                    }
                  >
                    <Text style={styles.rejectText}>Refuser</Text>
                  </TouchableOpacity>
                ) : null}
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
  content: { padding: 20, paddingBottom: 40 },
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
  id: { fontWeight: "900", color: theme.primary },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: "900" },
  customer: { marginTop: 8, fontWeight: "800", color: "#222" },
  meta: { marginTop: 4, fontSize: 12, color: "#777" },
  items: { marginTop: 6, fontSize: 12, color: "#4B5563" },
  price: { marginTop: 8, fontWeight: "900", color: "#222" },
  cta: {
    marginTop: 12,
    height: 42,
    borderRadius: 12,
    backgroundColor: theme.light,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: theme.primary, fontWeight: "800", fontSize: 12 },
  reject: { marginTop: 8, alignItems: "center", paddingVertical: 6 },
  rejectText: { color: "#DC2626", fontWeight: "800", fontSize: 12 },
});
