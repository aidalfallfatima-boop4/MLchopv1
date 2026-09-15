import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Order } from "../../types";
import { formatPrice } from "../../utils/formatPrice";
import { paymentLabel } from "../../utils/orderLabels";
import { getRoleTheme } from "../../constants/roleTheme";

const theme = getRoleTheme("delivery");

type Props = {
  order: Order;
  onAccept: () => void;
};

/** Ligne de mission disponible (onglet "Disponibles"). */
export default function DeliveryOrderCard({ order, onAccept }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>📦</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.orderId}>{order.id}</Text>
          <Text style={styles.customer}>{order.customerName}</Text>
        </View>
        <Text style={styles.fee}>{formatPrice(order.deliveryFee ?? 2500)}</Text>
      </View>

      <Text style={styles.address}>📍 {order.deliveryAddress}</Text>
      <Text style={styles.payment}>💳 {paymentLabel(order.paymentMethod)}</Text>

      <TouchableOpacity style={styles.button} onPress={onAccept}>
        <Text style={styles.buttonText}>✅ ACCEPTER CETTE LIVRAISON</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  top: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: theme.light,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 22 },
  info: { flex: 1, marginLeft: 12 },
  orderId: { fontWeight: "900", color: theme.primary, fontSize: 13 },
  customer: { marginTop: 3, fontSize: 12, color: "#374151" },
  fee: { fontWeight: "900", color: "#111827", fontSize: 14 },
  address: { marginTop: 12, fontSize: 12, color: "#4B5563" },
  payment: { marginTop: 4, fontSize: 12, color: "#4B5563" },
  button: {
    marginTop: 14,
    height: 46,
    borderRadius: 13,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#FFFFFF", fontWeight: "900", fontSize: 12 },
});
