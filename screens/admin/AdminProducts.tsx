import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { toggleProductActive, useProductStore } from "../../store/productStore";
import { formatPrice } from "../../utils/formatPrice";
import { getCategoryColor } from "../../constants/theme";
import Header from "../../components/Header";

type Props = { onBack: () => void };

export default function AdminProducts({ onBack }: Props) {
  const products = useProductStore();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Produits" subtitle={`${products.length} au catalogue`} onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        {products.map((product) => {
          const active = product.active !== false;
          return (
            <View key={product.id} style={styles.card}>
              <Text style={styles.emoji}>{product.emoji}</Text>
              <View style={styles.info}>
                <Text style={styles.name}>{product.name}</Text>
                <Text style={[styles.category, { color: getCategoryColor(product.category) }]}>
                  {product.category}
                </Text>
                <Text style={styles.price}>{formatPrice(product.price)}</Text>
              </View>
              <TouchableOpacity
                style={[styles.toggle, active ? styles.toggleActive : styles.toggleInactive]}
                onPress={() => toggleProductActive(product.id)}
              >
                <Text style={[styles.toggleText, { color: active ? "#16A34A" : "#DC2626" }]}>
                  {active ? "Actif" : "Masqué"}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  content: { padding: 20, paddingBottom: 40 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emoji: { fontSize: 26, width: 40, textAlign: "center" },
  info: { flex: 1, marginLeft: 10 },
  name: { fontWeight: "900", color: "#0F172A", fontSize: 13 },
  category: { marginTop: 2, fontSize: 11, fontWeight: "800" },
  price: { marginTop: 3, fontSize: 12, color: "#334155", fontWeight: "700" },
  toggle: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  toggleActive: { backgroundColor: "#DCFCE7" },
  toggleInactive: { backgroundColor: "#FEE2E2" },
  toggleText: { fontSize: 10, fontWeight: "900" },
});
