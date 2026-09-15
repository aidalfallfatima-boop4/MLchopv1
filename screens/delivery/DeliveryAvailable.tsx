import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { acceptOrder, useAvailableOrders } from "../../store/deliveryStore";
import DeliveryOrderCard from "../../components/delivery/DeliveryOrderCard";
import Header from "../../components/Header";

type Props = {
  onAccepted: () => void;
};

export default function DeliveryAvailable({ onAccepted }: Props) {
  const orders = useAvailableOrders();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Livraisons disponibles" subtitle={`${orders.length} mission(s)`} />

      <ScrollView contentContainerStyle={styles.content}>
        {orders.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Aucune mission disponible pour le moment.</Text>
          </View>
        ) : (
          orders.map((order) => (
            <DeliveryOrderCard
              key={order.id}
              order={order}
              onAccept={() => {
                acceptOrder(order.id);
                onAccepted();
              }}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingBottom: 100 },
  empty: { alignItems: "center", marginTop: 60 },
  emptyIcon: { fontSize: 44 },
  emptyText: { marginTop: 10, color: "#9CA3AF", fontSize: 13 },
});
