import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { CATEGORIES } from "../../data/products";
import { useVisibleProducts } from "../../store/productStore";
import { getCategoryColor, getCategoryTint } from "../../constants/theme";
import Header from "../../components/Header";

type Props = {
  onSelectCategory: (category: string) => void;
};

export default function CategoriesScreen({ onSelectCategory }: Props) {
  const products = useVisibleProducts();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Catégories" subtitle="Parcourir par rayon" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {CATEGORIES.filter((item) => item.name !== "Tout").map((item) => {
            const count = products.filter((p) => p.category === item.name).length;
            const color = getCategoryColor(item.name);
            return (
              <TouchableOpacity
                key={item.name}
                style={[styles.card, { backgroundColor: getCategoryTint(item.name) }]}
                onPress={() => onSelectCategory(item.name)}
              >
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text style={[styles.name, { color }]}>{item.name}</Text>
                <Text style={styles.count}>{count} produit{count > 1 ? "s" : ""}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingBottom: 100 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: {
    width: "48%",
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    alignItems: "center",
  },
  emoji: { fontSize: 36 },
  name: { marginTop: 10, fontSize: 14, fontWeight: "900" },
  count: { marginTop: 4, fontSize: 11, color: "#6B7280" },
});
