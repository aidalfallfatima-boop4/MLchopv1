import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

type Order = {
  id: string;
  customer: string;
  address: string;
  price: string;
  status: string;
};

const ORDERS: Order[] = [
  {
    id: "#ML1025",
    customer: "Client ML CHOP",
    address: "ACI 2000, Bamako",
    price: "2 500 FCFA",
    status: "À livrer",
  },
  {
    id: "#ML1024",
    customer: "Client ML CHOP",
    address: "Hamdallaye ACI",
    price: "2 000 FCFA",
    status: "En cours",
  },
  {
    id: "#ML1023",
    customer: "Client ML CHOP",
    address: "Badalabougou",
    price: "2 000 FCFA",
    status: "Livrée",
  },
];

export default function DeliveryOrders() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>
          Mes livraisons
        </Text>

        <Text style={styles.subtitle}>
          Gérez toutes vos commandes à livrer.
        </Text>

        {ORDERS.map((order) => (
          <View
            key={order.id}
            style={styles.orderCard}
          >
            <View style={styles.topRow}>
              <View style={styles.iconBox}>
                <Text style={styles.icon}>
                  📦
                </Text>
              </View>

              <View style={styles.info}>
                <Text style={styles.orderId}>
                  {order.id}
                </Text>

                <Text style={styles.customer}>
                  {order.customer}
                </Text>
              </View>

              <View
                style={[
                  styles.badge,
                  order.status === "Livrée" &&
                    styles.badgeDone,
                  order.status === "En cours" &&
                    styles.badgeProgress,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    order.status === "Livrée" &&
                      styles.badgeTextDone,
                  ]}
                >
                  {order.status}
                </Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.addressRow}>
              <Text style={styles.addressIcon}>
                📍
              </Text>

              <View>
                <Text style={styles.addressLabel}>
                  Adresse
                </Text>

                <Text style={styles.address}>
                  {order.address}
                </Text>
              </View>
            </View>

            <View style={styles.bottomRow}>
              <View>
                <Text style={styles.earnLabel}>
                  Livraison
                </Text>

                <Text style={styles.price}>
                  {order.price}
                </Text>
              </View>

              {order.status !== "Livrée" && (
                <TouchableOpacity
                  style={styles.actionButton}
                >
                  <Text style={styles.actionText}>
                    {order.status === "En cours"
                      ? "Terminer"
                      : "Accepter"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
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

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#222",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    color: "#888",
    marginBottom: 22,
  },

  orderCard: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EEE",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    fontSize: 25,
  },

  info: {
    flex: 1,
    marginLeft: 11,
  },

  orderId: {
    fontSize: 13,
    fontWeight: "900",
    color: "#F28C28",
  },

  customer: {
    marginTop: 3,
    fontSize: 12,
    color: "#555",
  },

  badge: {
    backgroundColor: "#FFF3E7",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },

  badgeProgress: {
    backgroundColor: "#EEF4FF",
  },

  badgeDone: {
    backgroundColor: "#EAF8EF",
  },

  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#F28C28",
  },

  badgeTextDone: {
    color: "#2EAF62",
  },

  separator: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: 14,
  },

  addressRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  addressIcon: {
    fontSize: 21,
    marginRight: 9,
  },

  addressLabel: {
    fontSize: 9,
    color: "#999",
  },

  address: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
  },

  bottomRow: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  earnLabel: {
    fontSize: 9,
    color: "#999",
  },

  price: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: "900",
    color: "#222",
  },

  actionButton: {
    backgroundColor: "#F28C28",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  actionText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "900",
  },
});