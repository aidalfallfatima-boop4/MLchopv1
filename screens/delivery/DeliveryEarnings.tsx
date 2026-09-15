import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

import { useOrderStore } from "../../store/orderStore";
import { formatPrice } from "../../utils/formatPrice";

type Props = {
  onBack?: () => void;
  onHistory?: () => void;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export default function DeliveryEarnings({ onBack, onHistory }: Props) {
  const orders = useOrderStore();
  const delivered = orders.filter((order) => order.status === "delivered");
  const now = Date.now();

  const todayDelivered = delivered.filter((order) => now - new Date(order.createdAt).getTime() < DAY_MS);
  const weekDelivered = delivered.filter((order) => now - new Date(order.createdAt).getTime() < 7 * DAY_MS);
  const monthDelivered = delivered.filter((order) => now - new Date(order.createdAt).getTime() < 30 * DAY_MS);

  const sumFees = (list: typeof delivered) =>
    list.reduce((sum, order) => sum + (order.deliveryFee ?? 0), 0);

  const todayTotal = sumFees(todayDelivered);
  const weekTotal = sumFees(weekDelivered);
  const monthTotal = sumFees(monthDelivered);
  const allTimeTotal = sumFees(delivered);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* En-tête */}
      <View style={styles.header}>
        <View>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.subtitle}>← Accueil</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Mes revenus</Text>
          <Text style={styles.subtitle}>
            Suivez vos gains avec ML CHOP
          </Text>
        </View>

        <Text style={styles.headerIcon}>💰</Text>
      </View>

      {/* Revenus principaux */}
      <View style={styles.mainCard}>
        <Text style={styles.mainLabel}>Gains aujourd'hui</Text>

        <Text style={styles.mainAmount}>
          {formatPrice(todayTotal)}
        </Text>

        <Text style={styles.mainInfo}>
          {todayDelivered.length} livraison(s) effectuée(s)
        </Text>
      </View>

      {/* Périodes */}
      <View style={styles.periodRow}>
        <View style={styles.periodCard}>
          <Text style={styles.periodIcon}>💰</Text>
          <Text style={styles.periodLabel}>Aujourd'hui</Text>
          <Text style={styles.periodAmount}>{formatPrice(todayTotal).replace(" FCFA", "")}</Text>
          <Text style={styles.fcfa}>FCFA</Text>
        </View>

        <View style={styles.periodCard}>
          <Text style={styles.periodIcon}>📅</Text>
          <Text style={styles.periodLabel}>Cette semaine</Text>
          <Text style={styles.periodAmount}>{formatPrice(weekTotal).replace(" FCFA", "")}</Text>
          <Text style={styles.fcfa}>FCFA</Text>
        </View>
      </View>

      <View style={styles.periodCardFull}>
        <Text style={styles.periodIcon}>🗓️</Text>

        <View style={styles.monthInfo}>
          <Text style={styles.periodLabel}>Ce mois</Text>
          <Text style={styles.periodAmount}>{formatPrice(monthTotal)}</Text>
        </View>
      </View>

      {/* Statistiques */}
      <Text style={styles.sectionTitle}>
        📊 Résumé
      </Text>

      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <View>
            <Text style={styles.statLabel}>
              📦 Livraisons
            </Text>
            <Text style={styles.statValue}>{delivered.length}</Text>
          </View>

          <View>
            <Text style={styles.statLabel}>
              💰 Total gagné
            </Text>
            <Text style={styles.statValue}>{formatPrice(allTimeTotal)}</Text>
          </View>
        </View>
      </View>

      {/* Versement */}
      <Text style={styles.sectionTitle}>
        💳 Versements
      </Text>

      <View style={styles.paymentCard}>
        <View>
          <Text style={styles.paymentTitle}>
            Pas encore de vrai versement bancaire
          </Text>

          <Text style={styles.paymentDate}>
            Simulation locale — à brancher sur Orange/Moov/Wave plus tard
          </Text>
        </View>
      </View>

      {/* Bouton */}
      <TouchableOpacity style={styles.historyButton} onPress={onHistory}>
        <Text style={styles.historyText}>
          📄 VOIR TOUT L'HISTORIQUE
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  title: {
    fontSize: 27,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 4,
    color: "#777777",
    fontSize: 14,
  },

  headerIcon: {
    fontSize: 38,
  },

  mainCard: {
    backgroundColor: "#168A45",
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },

  mainLabel: {
    color: "#E9FFF1",
    fontSize: 15,
    fontWeight: "600",
  },

  mainAmount: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    marginVertical: 8,
  },

  mainInfo: {
    color: "#E9FFF1",
    fontSize: 14,
  },

  periodRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },

  periodCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 17,
  },

  periodIcon: {
    fontSize: 25,
    marginBottom: 8,
  },

  periodLabel: {
    fontSize: 13,
    color: "#777777",
    marginBottom: 6,
  },

  periodAmount: {
    fontSize: 20,
    fontWeight: "900",
  },

  fcfa: {
    fontSize: 12,
    color: "#777777",
  },

  periodCardFull: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  monthInfo: {
    flex: 1,
  },

  arrow: {
    fontSize: 32,
    color: "#777777",
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 12,
  },

  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
  },

  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statLabel: {
    color: "#777777",
    fontSize: 13,
    marginBottom: 5,
  },

  statValue: {
    fontSize: 17,
    fontWeight: "800",
  },

  separator: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 17,
  },

  bonusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  bonusIcon: {
    fontSize: 32,
    marginRight: 12,
  },

  bonusInfo: {
    flex: 1,
  },

  bonusTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },

  bonusDescription: {
    fontSize: 12,
    color: "#777777",
    lineHeight: 17,
  },

  bonusAmount: {
    fontSize: 14,
    fontWeight: "900",
  },

  paymentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  paymentTitle: {
    fontSize: 14,
    fontWeight: "700",
  },

  paymentDate: {
    fontSize: 12,
    color: "#888888",
    marginTop: 4,
  },

  paymentAmount: {
    fontSize: 14,
    fontWeight: "800",
  },

  historyButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 15,
    paddingVertical: 17,
    marginTop: 8,
  },

  historyText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "800",
  },
});