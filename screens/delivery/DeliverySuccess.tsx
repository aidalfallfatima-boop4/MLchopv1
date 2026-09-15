import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { useActiveOrder } from "../../store/deliveryStore";
import { formatPrice } from "../../utils/formatPrice";

type Props = {
  onHome?: () => void;
  onHistory?: () => void;
};

export default function DeliverySuccess({ onHome, onHistory }: Props) {
  const order = useActiveOrder();
  const orderId = order?.id ?? "—";
  const fee = formatPrice(order?.deliveryFee ?? 2500);
  const client = order?.customerName ?? "Client ML CHOP";
  return (
    <View style={styles.container}>
      <View style={styles.successCircle}>
        <Text style={styles.successIcon}>✓</Text>
      </View>

      <Text style={styles.title}>Livraison réussie !</Text>

      <Text style={styles.subtitle}>
        La commande a été remise au client avec succès.
      </Text>

      <View style={styles.orderCard}>
        <Text style={styles.orderIcon}>📦</Text>

        <View style={styles.orderInfo}>
          <Text style={styles.orderLabel}>Commande</Text>
          <Text style={styles.orderNumber}>#{orderId}</Text>
        </View>

        <Text style={styles.status}>✅ Livrée</Text>
      </View>

      <View style={styles.earningsCard}>
        <Text style={styles.moneyIcon}>💰</Text>

        <Text style={styles.earningsLabel}>
          Vous avez gagné
        </Text>

        <Text style={styles.amount}>
          {fee}
        </Text>

        <Text style={styles.earningsDescription}>
          Les frais de livraison ont été ajoutés à vos revenus.
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Distance</Text>
          <Text style={styles.summaryValue}>4,2 km</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Durée</Text>
          <Text style={styles.summaryValue}>18 min</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Client</Text>
          <Text style={styles.summaryValue}>{client}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onHistory}>
        <Text style={styles.primaryText}>
          📦 VOIR MES LIVRAISONS
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={onHome}>
        <Text style={styles.secondaryText}>
          🏠 RETOUR À L'ACCUEIL
        </Text>
      </TouchableOpacity>

      <Text style={styles.thanks}>
        Bravo pour cette livraison 👏🇲🇱
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  successCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#168A45",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  successIcon: {
    color: "#FFFFFF",
    fontSize: 52,
    fontWeight: "800",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 22,
  },

  orderCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  orderIcon: {
    fontSize: 32,
    marginRight: 12,
  },

  orderInfo: {
    flex: 1,
  },

  orderLabel: {
    fontSize: 12,
    color: "#777777",
    marginBottom: 3,
  },

  orderNumber: {
    fontSize: 17,
    fontWeight: "800",
  },

  status: {
    fontSize: 13,
    fontWeight: "800",
  },

  earningsCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    marginBottom: 12,
  },

  moneyIcon: {
    fontSize: 34,
    marginBottom: 6,
  },

  earningsLabel: {
    fontSize: 14,
    color: "#666666",
  },

  amount: {
    fontSize: 32,
    fontWeight: "900",
    marginVertical: 5,
  },

  earningsDescription: {
    fontSize: 12,
    color: "#777777",
    textAlign: "center",
  },

  summaryCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
  },

  summaryLabel: {
    fontSize: 14,
    color: "#777777",
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
  },

  primaryButton: {
    width: "100%",
    backgroundColor: "#168A45",
    borderRadius: 15,
    paddingVertical: 17,
    marginBottom: 10,
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },

  secondaryButton: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },

  secondaryText: {
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },

  thanks: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: "600",
  },
});