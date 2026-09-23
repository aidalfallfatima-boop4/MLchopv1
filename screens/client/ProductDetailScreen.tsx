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

import { useProductStore } from "../../store/productStore";
import { addToCart } from "../../store/cartStore";
import { useUserStore } from "../../store/userStore";
import {
  addReview,
  getAverageRating,
  useReviewsForProduct,
} from "../../store/reviewStore";
import { isFavorite, toggleFavorite, useFavoriteIds } from "../../store/favoriteStore";
import { formatPrice } from "../../utils/formatPrice";
import { formatDate } from "../../utils/formatDate";
import { getCategoryColor, getCategoryTint } from "../../constants/theme";
import Header from "../../components/Header";

type Props = {
  productId: number;
  onBack: () => void;
  onOpenCart: () => void;
};

export default function ProductDetailScreen({ productId, onBack, onOpenCart }: Props) {
  const products = useProductStore();
  const user = useUserStore();
  const favoriteIds = useFavoriteIds();
  const reviews = useReviewsForProduct(productId);

  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const product = products.find((item) => item.id === productId);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Produit" onBack={onBack} />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Ce produit n'est plus disponible.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const color = getCategoryColor(product.category);
  const sellerName = product.sellerName || "ML CHOP";
  const available = (product.stock ?? 1) > 0 && product.active !== false;
  const avgRating = getAverageRating(product.id);
  const favorite = isFavorite(product.id, favoriteIds);

  function submitReview() {
    if (!comment.trim()) {
      Alert.alert("Avis vide", "Ajoutez un commentaire avant d'envoyer.");
      return;
    }
    addReview({
      productId,
      author: user.name || "Client ML CHOP",
      rating,
      comment,
    });
    setComment("");
    setRating(5);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={product.name}
        onBack={onBack}
        right={
          <TouchableOpacity onPress={() => toggleFavorite(product.id)}>
            <Text style={styles.heart}>{favorite ? "❤️" : "🤍"}</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: getCategoryTint(product.category) }]}>
          <Text style={styles.heroEmoji}>{product.emoji}</Text>
        </View>

        <View style={styles.topRow}>
          <Text style={[styles.category, { color }]}>{product.category}</Text>
          <View style={[styles.availability, { backgroundColor: available ? "#DCFCE7" : "#FEE2E2" }]}>
            <Text style={{ color: available ? "#16A34A" : "#DC2626", fontSize: 10, fontWeight: "900" }}>
              {available ? "En stock" : "Indisponible"}
            </Text>
          </View>
        </View>

        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.seller}>Vendu par {sellerName}</Text>

        <View style={styles.ratingRow}>
          <Text style={styles.ratingValue}>
            {avgRating !== null ? `⭐ ${avgRating.toFixed(1)}` : "⭐ Pas encore noté"}
          </Text>
          <Text style={styles.ratingCount}>({reviews.length} avis)</Text>
        </View>

        <Text style={[styles.price, { color }]}>{formatPrice(product.price)}</Text>

        {product.description ? (
          <Text style={styles.description}>{product.description}</Text>
        ) : null}

        <View style={styles.qtyRow}>
          <Text style={styles.qtyLabel}>Quantité</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Text style={styles.stepperText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{quantity}</Text>
            <TouchableOpacity style={styles.stepperBtn} onPress={() => setQuantity((q) => q + 1)}>
              <Text style={styles.stepperText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: color }, !available && styles.disabled]}
          disabled={!available}
          onPress={() => {
            addToCart(product, quantity);
            Alert.alert("Ajouté au panier", `${quantity} × ${product.name}`, [
              { text: "Continuer mes achats", style: "cancel" },
              { text: "Voir le panier", onPress: onOpenCart },
            ]);
          }}
        >
          <Text style={styles.addButtonText}>
            + AJOUTER · {formatPrice(product.price * quantity)}
          </Text>
        </TouchableOpacity>

        <Text style={styles.section}>Avis clients ({reviews.length})</Text>
        <View style={styles.reviewForm}>
          <Text style={styles.reviewFormLabel}>Laisser un avis</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity key={value} onPress={() => setRating(value)}>
                <Text style={styles.star}>{value <= rating ? "⭐" : "☆"}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Votre commentaire..."
            placeholderTextColor="#9CA3AF"
            style={styles.commentInput}
            multiline
          />
          <TouchableOpacity style={[styles.submitReview, { backgroundColor: color }]} onPress={submitReview}>
            <Text style={styles.submitReviewText}>Envoyer mon avis</Text>
          </TouchableOpacity>
        </View>

        {reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewTop}>
              <Text style={styles.reviewAuthor}>{review.author}</Text>
              <Text style={styles.reviewStars}>{"⭐".repeat(review.rating)}</Text>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
            <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingBottom: 50 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#9CA3AF" },
  heart: { fontSize: 20 },
  hero: {
    height: 200,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  heroEmoji: { fontSize: 90 },
  topRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  category: { fontSize: 12, fontWeight: "900" },
  availability: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  name: { marginTop: 8, fontSize: 22, fontWeight: "900", color: "#111827" },
  seller: { marginTop: 4, fontSize: 12, color: "#6B7280" },
  ratingRow: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 6 },
  ratingValue: { fontSize: 13, fontWeight: "800", color: "#111827" },
  ratingCount: { fontSize: 11, color: "#9CA3AF" },
  price: { marginTop: 12, fontSize: 26, fontWeight: "900" },
  description: { marginTop: 10, fontSize: 13, color: "#4B5563", lineHeight: 19 },
  qtyRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qtyLabel: { fontSize: 13, fontWeight: "800", color: "#374151" },
  stepper: { flexDirection: "row", alignItems: "center", gap: 14 },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperText: { fontSize: 18, fontWeight: "900", color: "#374151" },
  stepperValue: { fontSize: 15, fontWeight: "900", minWidth: 24, textAlign: "center" },
  addButton: {
    marginTop: 18,
    height: 54,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { opacity: 0.4 },
  addButtonText: { color: "#FFFFFF", fontWeight: "900", fontSize: 13 },
  section: { marginTop: 28, marginBottom: 12, fontSize: 16, fontWeight: "900", color: "#111827" },
  reviewForm: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEF0F3",
    marginBottom: 16,
  },
  reviewFormLabel: { fontWeight: "800", fontSize: 13, color: "#111827", marginBottom: 8 },
  starsRow: { flexDirection: "row", gap: 4, marginBottom: 10 },
  star: { fontSize: 22 },
  commentInput: {
    minHeight: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
    fontSize: 13,
    color: "#111827",
    textAlignVertical: "top",
  },
  submitReview: { marginTop: 10, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  submitReviewText: { color: "#FFFFFF", fontWeight: "900", fontSize: 12 },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EEF0F3",
  },
  reviewTop: { flexDirection: "row", justifyContent: "space-between" },
  reviewAuthor: { fontWeight: "900", fontSize: 12, color: "#111827" },
  reviewStars: { fontSize: 11 },
  reviewComment: { marginTop: 6, fontSize: 12, color: "#374151", lineHeight: 17 },
  reviewDate: { marginTop: 6, fontSize: 10, color: "#9CA3AF" },
});
