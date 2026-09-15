import React from "react";
import {
  GestureResponderEvent,
  Text,
  TouchableOpacity,
  View,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";

import { Product } from "../types";
import { formatPrice } from "../utils/formatPrice";
import { getCategoryColor, getCategoryTint } from "../constants/theme";
import { getAverageRating } from "../store/reviewStore";

type ProductCardProps = {
  product: Product;
  onAddToCart: (product: Product) => void;
  /** Ouvre la fiche produit détaillée — la carte entière devient tapable. */
  onPress?: (product: Product) => void;
  /** Permet de remplacer la largeur par défaut (ex : rangée horizontale). */
  style?: StyleProp<ViewStyle>;
};

export default function ProductCard({
  product,
  onAddToCart,
  onPress,
  style,
}: ProductCardProps) {
  const color = getCategoryColor(product.category);
  const rating = getAverageRating(product.id);

  function handleAdd(event: GestureResponderEvent) {
    // Empêche le clic sur "+" d'ouvrir aussi la fiche produit (web bubbling).
    event.stopPropagation();
    onAddToCart(product);
  }

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      activeOpacity={onPress ? 0.85 : 1}
      onPress={() => onPress?.(product)}
      disabled={!onPress}
    >
      <View style={[styles.image, { backgroundColor: getCategoryTint(product.category) }]}>
        <Text style={styles.emoji}>
          {product.emoji}
        </Text>
      </View>

      <Text style={[styles.category, { color }]}>
        {product.category}
        {rating !== null ? `  ⭐ ${rating.toFixed(1)}` : ""}
      </Text>

      <Text
        style={styles.name}
        numberOfLines={2}
      >
        {product.name}
      </Text>

      <View style={styles.bottom}>
        <Text style={[styles.price, { color }]}>
          {formatPrice(product.price)}
        </Text>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: color }]}
          onPress={handleAdd}
        >
          <Text style={styles.addButtonText}>
            +
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 11,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  image: {
    height: 125,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  emoji: {
    fontSize: 55,
  },

  category: {
    marginTop: 9,
    fontSize: 10,
    fontWeight: "800",
  },

  name: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
    color: "#333333",
    minHeight: 38,
  },

  bottom: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  price: {
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
  },

  addButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },
});
