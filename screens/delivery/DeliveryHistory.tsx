import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";

import { useOrderStore } from "../../store/orderStore";
import { Order } from "../../types";
import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/formatDate";
import { getRoleTheme } from "../../constants/roleTheme";

const theme = getRoleTheme("delivery");

type Props = {
  onBack?: () => void;
};

export default function DeliveryHistory({ onBack }: Props) {
  const orders = useOrderStore();
  const history = orders.filter(
    (order) => order.status === "delivered" || order.status === "cancelled"
  );
  const totalEarned = history
    .filter((order) => order.status === "delivered")
    .reduce((sum, order) => sum + (order.deliveryFee ?? 0), 0);

  const renderDelivery = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.orderNumber}>#{item.id}</Text>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            item.status === "delivered" ? styles.deliveredBadge : styles.cancelledBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === "delivered" ? styles.deliveredText : styles.cancelledText,
            ]}
          >
            {item.status === "delivered" ? "Livrée" : "Annulée"}
          </Text>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.infoRow}>
        <Text style={styles.icon}>👤</Text>
        <View style={styles.infoContent}>
          <Text style={styles.label}>Client</Text>
          <Text style={styles.value}>{item.customerName}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.icon}>📍</Text>
        <View style={styles.infoContent}>
          <Text style={styles.label}>Destination</Text>
          <Text style={styles.value}>{item.deliveryAddress}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.deliveryLabel}>Frais de livraison</Text>
        <Text style={styles.amount}>{formatPrice(item.deliveryFee ?? 0)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.subtitle}>← Accueil</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Historique</Text>
          <Text style={styles.subtitle}>Retrouvez toutes vos livraisons</Text>
        </View>

        <View style={styles.historyIcon}>
          <Text style={styles.historyIconText}>🕘</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{history.length}</Text>
          <Text style={styles.summaryLabel}>Livraisons</Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{formatPrice(totalEarned)}</Text>
          <Text style={styles.summaryLabel}>Gagnés</Text>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Vos dernières livraisons</Text>
      </View>

      {history.length === 0 ? (
        <Text style={styles.empty}>Aucune livraison terminée pour le moment.</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={renderDelivery}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7F9",
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#171717",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#777",
  },

  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  historyIconText: {
    fontSize: 23,
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
  },

  summaryNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#171717",
  },

  summaryLabel: {
    marginTop: 5,
    fontSize: 13,
    color: "#777",
  },

  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E5E5",
  },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  listTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#171717",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#9CA3AF",
    fontSize: 13,
  },

  listContent: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    marginBottom: 13,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  orderNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#171717",
  },

  date: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  deliveredBadge: {
    backgroundColor: "#E9F8EF",
  },

  cancelledBadge: {
    backgroundColor: "#FDECEC",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  deliveredText: {
    color: "#18864B",
  },

  cancelledText: {
    color: "#D64545",
  },

  separator: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 14,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  icon: {
    width: 32,
    fontSize: 18,
  },

  infoContent: {
    flex: 1,
  },

  label: {
    fontSize: 11,
    color: "#999",
    marginBottom: 2,
  },

  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  bottomRow: {
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 13,
    marginTop: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  deliveryLabel: {
    fontSize: 12,
    color: "#888",
  },

  amount: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.primary,
  },
});
