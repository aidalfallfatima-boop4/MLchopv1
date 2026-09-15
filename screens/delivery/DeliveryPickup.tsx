import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Order } from "../../types";
import { formatPrice } from "../../utils/formatPrice";
import { paymentLabel } from "../../utils/orderLabels";
import { getRoleTheme } from "../../constants/roleTheme";
import DeliveryMapCard from "../../components/delivery/DeliveryMapCard";

const theme = getRoleTheme("delivery");

type Props = {
  order: Order;
  onPickedUp: () => void;
  onOpenMap: () => void;
};

/** Étape 1 de la mission acceptée : se rendre chez le vendeur et récupérer la commande. */
export default function DeliveryPickup({ order, onPickedUp, onOpenMap }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Récupération 🏪</Text>
        <Text style={styles.subtitle}>Rendez-vous chez le vendeur pour récupérer la commande</Text>

        <View style={styles.card}>
          <Text style={styles.orderId}>Commande {order.id}</Text>
          <Text style={styles.line}>🏪 Boutique ML CHOP — Hamdallaye ACI 2000</Text>
          <Text style={styles.line}>👤 Client : {order.customerName}</Text>
          <Text style={styles.line}>💰 Frais : {formatPrice(order.deliveryFee ?? 2500)}</Text>
          <Text style={styles.line}>💳 {paymentLabel(order.paymentMethod)}</Text>
        </View>

        <DeliveryMapCard />

        <TouchableOpacity style={styles.mapButton} onPress={onOpenMap}>
          <Text style={styles.mapButtonText}>🗺️ Voir la carte</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cta} onPress={onPickedUp}>
          <Text style={styles.ctaText}>📦 COMMANDE RÉCUPÉRÉE</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 25, fontWeight: "900", color: "#111827" },
  subtitle: { marginTop: 6, fontSize: 13, color: "#6B7280", marginBottom: 18 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  orderId: { fontWeight: "900", color: theme.primary, fontSize: 15, marginBottom: 10 },
  line: { fontSize: 13, color: "#374151", marginBottom: 6 },
  mapButton: {
    marginTop: 14,
    alignItems: "center",
    paddingVertical: 10,
  },
  mapButtonText: { color: theme.primary, fontWeight: "800", fontSize: 12 },
  cta: {
    marginTop: 8,
    height: 54,
    borderRadius: 15,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#FFFFFF", fontWeight: "900", fontSize: 13 },
});
