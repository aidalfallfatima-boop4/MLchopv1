import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  addProduct,
  removeProduct,
  toggleProductActive,
  updateProduct,
  useProductStore,
} from "../../store/productStore";
import { useCurrentAccount } from "../../store/authStore";
import { formatPrice } from "../../utils/formatPrice";
import { CATEGORIES } from "../../data/products";
import { getRoleTheme } from "../../constants/roleTheme";
import Header from "../../components/Header";

type Props = {
  onBack?: () => void;
};

const theme = getRoleTheme("seller");

export default function SellerProducts({ onBack }: Props) {
  const allProducts = useProductStore();
  const account = useCurrentAccount();
  const myProducts = allProducts.filter(
    (product) => !product.sellerId || product.sellerId === account?.id
  );

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Alimentation");
  const [editingId, setEditingId] = useState<number | null>(null);

  function resetForm() {
    setName("");
    setPrice("");
    setStock("");
    setEditingId(null);
  }

  function submit() {
    const priceValue = Number(price);
    const stockValue = stock ? Number(stock) : 10;

    if (!name.trim() || !priceValue) {
      Alert.alert("Champs incomplets", "Indiquez un nom et un prix valide.");
      return;
    }

    if (editingId) {
      updateProduct(editingId, {
        name: name.trim(),
        price: priceValue,
        category,
        stock: stockValue,
      });
    } else {
      addProduct({
        name: name.trim(),
        price: priceValue,
        category,
        emoji: "🛍️",
        stock: stockValue,
        description: name.trim(),
        sellerId: account?.id,
        active: true,
      });
    }

    resetForm();
  }

  function startEdit(id: number) {
    const product = myProducts.find((item) => item.id === id);
    if (!product) return;
    setEditingId(id);
    setName(product.name);
    setPrice(String(product.price));
    setStock(String(product.stock ?? ""));
    setCategory(product.category);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Mes produits" subtitle="Catalogue vendeur" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>
          {editingId ? "Modifier le produit" : "Ajouter un produit"}
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nom du produit"
          placeholderTextColor="#999"
          style={styles.input}
        />
        <View style={styles.row}>
          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="Prix en FCFA"
            keyboardType="numeric"
            placeholderTextColor="#999"
            style={[styles.input, styles.rowInput]}
          />
          <TextInput
            value={stock}
            onChangeText={setStock}
            placeholder="Stock"
            keyboardType="numeric"
            placeholderTextColor="#999"
            style={[styles.input, styles.rowInput]}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.filter((item) => item.name !== "Tout").map((item) => (
            <TouchableOpacity
              key={item.name}
              style={[styles.chip, category === item.name && styles.chipActive]}
              onPress={() => setCategory(item.name)}
            >
              <Text
                style={[
                  styles.chipText,
                  category === item.name && styles.chipTextActive,
                ]}
              >
                {item.emoji} {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.cta} onPress={submit}>
          <Text style={styles.ctaText}>{editingId ? "ENREGISTRER" : "➕ AJOUTER"}</Text>
        </TouchableOpacity>
        {editingId ? (
          <TouchableOpacity style={styles.cancelEdit} onPress={resetForm}>
            <Text style={styles.cancelEditText}>Annuler la modification</Text>
          </TouchableOpacity>
        ) : null}

        <Text style={styles.section}>Catalogue ({myProducts.length})</Text>
        {myProducts.map((product) => {
          const active = product.active !== false;
          return (
            <View key={product.id} style={styles.card}>
              <Text style={styles.emoji}>{product.emoji}</Text>
              <View style={styles.info}>
                <Text style={styles.name}>{product.name}</Text>
                <Text style={styles.meta}>
                  {product.category} · Stock {product.stock ?? 0}
                </Text>
                <Text style={styles.price}>{formatPrice(product.price)}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => startEdit(product.id)} style={styles.iconBtn}>
                  <Text style={{ fontSize: 14 }}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => toggleProductActive(product.id)}
                  style={styles.iconBtn}
                >
                  <Text style={{ fontSize: 14 }}>{active ? "🙈" : "👁️"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert("Supprimer", `Retirer "${product.name}" du catalogue ?`, [
                      { text: "Annuler", style: "cancel" },
                      { text: "Supprimer", style: "destructive", onPress: () => removeProduct(product.id) },
                    ])
                  }
                  style={styles.iconBtn}
                >
                  <Text style={{ fontSize: 14 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingBottom: 40 },
  section: {
    marginTop: 8,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "900",
    color: "#1E1B4B",
  },
  row: { flexDirection: "row", gap: 10 },
  rowInput: { flex: 1 },
  input: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    marginBottom: 10,
    color: "#222",
  },
  chip: {
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipActive: { backgroundColor: theme.light, borderColor: theme.primary },
  chipText: { fontWeight: "700", color: "#555", fontSize: 12 },
  chipTextActive: { color: theme.primary },
  cta: {
    marginTop: 14,
    marginBottom: 6,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#FFF", fontWeight: "900" },
  cancelEdit: { alignItems: "center", marginBottom: 10 },
  cancelEditText: { color: "#9CA3AF", fontSize: 12, fontWeight: "700" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emoji: { fontSize: 24, width: 36, textAlign: "center" },
  info: { flex: 1, marginLeft: 8 },
  name: { fontWeight: "800", color: "#1E1B4B" },
  meta: { marginTop: 3, fontSize: 11, color: "#888" },
  price: { marginTop: 3, fontWeight: "900", color: theme.primary },
  actions: { flexDirection: "row", gap: 4 },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
});
