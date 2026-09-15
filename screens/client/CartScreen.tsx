import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

import {
  getCartTotal,
  removeFromCart,
  updateQuantity,
  useCartStore,
} from "../../store/cartStore";
import { formatPrice } from "../../utils/formatPrice";
import { DELIVERY_FEE } from "../../constants/config";
import Header from "../../components/Header";

type Props = {
  onCheckout: () => void;
  onBack: () => void;
};

export default function CartScreen({ onCheckout, onBack }: Props) {
  const items = useCartStore();
  const subtotal = getCartTotal(items);
  const total = items.length > 0 ? subtotal + DELIVERY_FEE : 0;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Panier" subtitle="Vos articles" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Panier vide</Text>
            <Text style={styles.emptyText}>
              Ajoutez des produits depuis le catalogue.
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.emoji}>{item.emoji}</Text>

              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>{formatPrice(item.price)}</Text>

                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Text style={styles.qtyText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qty}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Text style={styles.qtyText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                <Text style={styles.remove}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {items.length > 0 ? (
        <View style={styles.footer}>
          <View style={styles.row}>
            <Text style={styles.label}>Sous-total</Text>
            <Text style={styles.value}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Livraison</Text>
            <Text style={styles.value}>{formatPrice(DELIVERY_FEE)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.total}>{formatPrice(total)}</Text>
          </View>

          <TouchableOpacity style={styles.cta} onPress={onCheckout}>
            <Text style={styles.ctaText}>PASSER COMMANDE</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingBottom: 40 },
  empty: { alignItems: "center", marginTop: 80 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { marginTop: 12, fontSize: 18, fontWeight: "900", color: "#222" },
  emptyText: { marginTop: 6, color: "#888", fontSize: 13 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  emoji: { fontSize: 32, width: 48, textAlign: "center" },
  info: { flex: 1, marginLeft: 8 },
  name: { fontSize: 14, fontWeight: "800", color: "#222" },
  price: { marginTop: 3, color: "#F28C28", fontWeight: "900" },
  qtyRow: { marginTop: 8, flexDirection: "row", alignItems: "center" },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#FFF3E7",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { color: "#F28C28", fontWeight: "900", fontSize: 16 },
  qty: { marginHorizontal: 10, fontWeight: "900" },
  remove: { fontSize: 16, color: "#999", padding: 8 },
  footer: {
    padding: 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: { color: "#888" },
  value: { fontWeight: "800", color: "#333" },
  totalLabel: { fontWeight: "900", fontSize: 16 },
  total: { fontWeight: "900", fontSize: 16, color: "#F28C28" },
  cta: {
    marginTop: 12,
    backgroundColor: "#F28C28",
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#FFF", fontWeight: "900" },
});
