import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Order } from "../../types";
import { getRoleTheme } from "../../constants/roleTheme";

const theme = getRoleTheme("delivery");

type Props = {
  order: Order;
  onConfirmDelivery: () => void;
};

/** Étape 3 : le livreur est arrivé chez le client, avant la remise/confirmation OTP. */
export default function DeliveryArrived({ order, onConfirmDelivery }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📍</Text>
      <Text style={styles.title}>Vous êtes arrivé !</Text>
      <Text style={styles.subtitle}>
        Vous êtes chez {order.customerName}, à l'adresse : {order.deliveryAddress}
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Commande</Text>
        <Text style={styles.cardValue}>#{order.id}</Text>
      </View>

      <Text style={styles.hint}>
        Remettez la commande au client puis demandez-lui son code de livraison pour confirmer.
      </Text>

      <TouchableOpacity style={styles.cta} onPress={onConfirmDelivery}>
        <Text style={styles.ctaText}>✅ CONFIRMER LA REMISE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: { fontSize: 60, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "900", color: "#111827", textAlign: "center" },
  subtitle: { marginTop: 8, fontSize: 13, color: "#6B7280", textAlign: "center", lineHeight: 19 },
  card: {
    marginTop: 24,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardLabel: { fontSize: 11, color: "#9CA3AF" },
  cardValue: { marginTop: 4, fontSize: 20, fontWeight: "900", color: theme.primary },
  hint: { marginTop: 20, fontSize: 12, color: "#6B7280", textAlign: "center", lineHeight: 18 },
  cta: {
    marginTop: 20,
    width: "100%",
    height: 54,
    borderRadius: 15,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#FFFFFF", fontWeight: "900", fontSize: 13 },
});
