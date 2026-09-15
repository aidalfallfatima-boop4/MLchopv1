import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { useProductStore } from "../../store/productStore";
import { useFavoriteIds } from "../../store/favoriteStore";
import { addToCart } from "../../store/cartStore";
import ProductCard from "../../components/ProductCard";
import Header from "../../components/Header";

type Props = {
  onBack: () => void;
  onOpenProduct: (productId: number) => void;
};

export default function FavoritesScreen({ onBack, onOpenProduct }: Props) {
  const products = useProductStore();
  const favoriteIds = useFavoriteIds();
  const favorites = products.filter((product) => favoriteIds.includes(product.id));

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Favoris" subtitle={`${favorites.length} produit(s)`} onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        {favorites.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🤍</Text>
            <Text style={styles.emptyText}>Aucun favori pour le moment.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {favorites.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onPress={(item) => onOpenProduct(item.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingBottom: 40 },
  empty: { alignItems: "center", marginTop: 80 },
  emptyIcon: { fontSize: 40 },
  emptyText: { marginTop: 10, color: "#9CA3AF" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
});
