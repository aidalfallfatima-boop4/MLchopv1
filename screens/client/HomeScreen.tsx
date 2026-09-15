import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { CATEGORIES } from "../../data/products";
import { useVisibleProducts } from "../../store/productStore";
import { addToCart, getCartCount, useCartStore } from "../../store/cartStore";
import { useOrderStore } from "../../store/orderStore";
import { STATUS_META } from "../../constants/theme";
import { Product } from "../../types";
import CategoryCard from "../../components/CategoryCard";
import ProductCard from "../../components/ProductCard";
import MLChopChatbot from "../../components/MLChopChatbot";
import NotificationBell from "../../components/NotificationBell";

const TRACKABLE = new Set(["pending", "confirmed", "preparing", "shipping"]);

type Props = {
  onOpenCart: () => void;
  onTrackOrder?: (orderId: string) => void;
  onOpenProduct?: (productId: number) => void;
  /** Catégorie présélectionnée en arrivant depuis l'onglet Catégories. */
  initialCategory?: string | null;
};

export default function HomeScreen({
  onOpenCart,
  onTrackOrder,
  onOpenProduct,
  initialCategory,
}: Props) {
  const products = useVisibleProducts();
  const cart = useCartStore();
  const orders = useOrderStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory || "Tout");

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
  }, [initialCategory]);

  const activeOrder = orders.find((order) => TRACKABLE.has(order.status));

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchCategory =
        category === "Tout" || product.category === category;
      const matchQuery = product.name
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [products, category, query]);

  const popular = useMemo(() => products.filter((p) => p.popular), [products]);
  const trending = useMemo(() => products.filter((p) => p.trending), [products]);

  function openProduct(product: Product) {
    onOpenProduct?.(product.id);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>Bonjour 👋</Text>
            <Text style={styles.logo}>ML CHOP</Text>
          </View>

          <View style={styles.headerActions}>
            <NotificationBell />

            <TouchableOpacity style={styles.cartBadge} onPress={onOpenCart}>
              <Text style={styles.cartIcon}>🛒</Text>
              {getCartCount(cart) > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{getCartCount(cart)}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          </View>
        </View>

        {activeOrder && onTrackOrder ? (
          <TouchableOpacity
            style={[
              styles.trackBanner,
              { backgroundColor: STATUS_META[activeOrder.status].background },
            ]}
            onPress={() => onTrackOrder(activeOrder.id)}
          >
            <Text style={styles.trackBannerIcon}>
              {STATUS_META[activeOrder.status].icon}
            </Text>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.trackBannerTitle,
                  { color: STATUS_META[activeOrder.status].color },
                ]}
              >
                Commande {activeOrder.id} · {STATUS_META[activeOrder.status].label}
              </Text>
              <Text style={styles.trackBannerHint}>Suivre en direct sur la carte →</Text>
            </View>
          </TouchableOpacity>
        ) : null}

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher un produit..."
          placeholderTextColor="#999"
          style={styles.search}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
        >
          {CATEGORIES.map((item) => (
            <CategoryCard
              key={item.name}
              name={item.name}
              emoji={item.emoji}
              active={category === item.name}
              onPress={() => setCategory(item.name)}
            />
          ))}
        </ScrollView>

        {category === "Tout" && !query && popular.length > 0 ? (
          <>
            <Text style={styles.section}>🔥 Produits populaires</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
              {popular.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  onPress={openProduct}
                  style={styles.hCard}
                />
              ))}
            </ScrollView>
          </>
        ) : null}

        {category === "Tout" && !query && trending.length > 0 ? (
          <>
            <Text style={styles.section}>📈 Tendances du moment</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
              {trending.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  onPress={openProduct}
                  style={styles.hCard}
                />
              ))}
            </ScrollView>
          </>
        ) : null}

        <Text style={styles.section}>Tous les produits</Text>

        <View style={styles.grid}>
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              onPress={openProduct}
            />
          ))}
        </View>
      </ScrollView>

      <MLChopChatbot />
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
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hello: {
    fontSize: 13,
    color: "#888",
  },
  logo: {
    marginTop: 3,
    fontSize: 28,
    fontWeight: "900",
    color: "#F28C28",
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  cartBadge: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#EEE",
    alignItems: "center",
    justifyContent: "center",
  },
  trackBanner: {
    marginTop: 16,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  trackBannerIcon: { fontSize: 24, marginRight: 12 },
  trackBannerTitle: { fontSize: 13, fontWeight: "900" },
  trackBannerHint: { marginTop: 3, fontSize: 11, color: "#4B5563", fontWeight: "700" },
  cartIcon: {
    fontSize: 22,
  },
  badge: {
    position: "absolute",
    right: -4,
    top: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#F28C28",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "900",
  },
  search: {
    marginTop: 18,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#EEE",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#222",
  },
  categories: {
    marginTop: 16,
  },
  section: {
    marginTop: 22,
    marginBottom: 14,
    fontSize: 18,
    fontWeight: "900",
    color: "#222",
  },
  hRow: { paddingRight: 8 },
  hCard: { width: 160, marginRight: 12 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
