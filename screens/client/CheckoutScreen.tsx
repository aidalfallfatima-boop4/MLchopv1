import React, { useRef, useState } from "react";
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

import { PAYMENT_METHODS } from "../../constants/config";
import { clearCart, getCartTotal, useCartStore } from "../../store/cartStore";
import { updateUserProfile, useUserStore } from "../../store/userStore";
import { placeOrder } from "../../services/orders";
import { processPayment } from "../../services/payments";
import { attachPayment, cancelUnpaidOrder } from "../../store/orderStore";
import { formatPrice } from "../../utils/formatPrice";
import { DELIVERY_FEE } from "../../constants/config";
import { Order } from "../../types";
import Header from "../../components/Header";

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

type Props = {
  onBack: () => void;
  onSuccess: () => void;
};

export default function CheckoutScreen({ onBack, onSuccess }: Props) {
  const items = useCartStore();
  const user = useUserStore();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [address, setAddress] = useState(user.address);
  const [method, setMethod] = useState<Order["paymentMethod"]>("cash");
  const [paying, setPaying] = useState(false);
  const submittingRef = useRef(false);

  const subtotal = getCartTotal(items);

  async function submit() {
    // Garde anti double-clic : une seule commande à la fois.
    if (submittingRef.current) return;

    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert("Informations manquantes", "Remplissez nom, téléphone et adresse.");
      return;
    }

    if (items.length === 0) {
      Alert.alert("Panier vide", "Ajoutez un produit avant de commander.");
      return;
    }

    submittingRef.current = true;
    setPaying(true);

    try {
      // 1. La commande est créée D'ABORD (Firestore), avec son vrai numéro.
      let order: Order;
      try {
        order = await placeOrder({
          items,
          subtotal,
          customerName: name.trim(),
          customerPhone: phone.trim(),
          deliveryAddress: address.trim(),
          paymentMethod: method,
        });
      } catch (error) {
        Alert.alert("Commande impossible", errorMessage(error, "La commande n'a pas pu être enregistrée. Réessayez."));
        return;
      }

      // 2. Le paiement (simulation locale) est ensuite rattaché à cette commande réelle.
      try {
        const payment = await processPayment(order.id, method, subtotal + DELIVERY_FEE);
        await attachPayment(order.id, { status: payment.status, reference: payment.reference });

        if (payment.status !== "paid") {
          await cancelUnpaidOrder(order.id);
          Alert.alert(
            "Paiement refusé",
            `Le paiement simulé de la commande ${order.id} a échoué. Choisissez un autre moyen de paiement et réessayez.`
          );
          return;
        }
      } catch (error) {
        // On tente d'annuler la commande orpheline ; son échec ne doit pas masquer l'erreur initiale.
        await cancelUnpaidOrder(order.id).catch((cancelError) =>
          console.error("[Checkout] Annulation impossible :", cancelError)
        );
        Alert.alert("Paiement impossible", errorMessage(error, "Le paiement n'a pas pu être enregistré. Réessayez."));
        return;
      }

      updateUserProfile({ name, phone, address });
      clearCart();

      // Confirmation purement informative : la navigation ne dépend PAS du bouton.
      Alert.alert(
        "Commande confirmée",
        `Commande ${order.id}
Code de livraison : ${order.deliveryCode}
(Paiement simulé — aucune vraie transaction bancaire.)`
      );
      onSuccess();
    } finally {
      submittingRef.current = false;
      setPaying(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Caisse" subtitle="Finaliser la commande" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Nom</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} />

        <Text style={styles.label}>Téléphone</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />

        <Text style={styles.label}>Adresse de livraison</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          style={styles.input}
        />

        <Text style={styles.section}>Paiement</Text>
        {PAYMENT_METHODS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.method, method === item.id && styles.methodActive]}
            onPress={() => setMethod(item.id)}
          >
            <Text style={styles.methodText}>
              {item.emoji}  {item.label}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            Total : {formatPrice(subtotal + DELIVERY_FEE)}
          </Text>
          <Text style={styles.simulatedNote}>
            💡 Paiement simulé pour cette démo — aucune vraie transaction bancaire.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.cta, paying && styles.ctaDisabled]}
          onPress={submit}
          disabled={paying}
          accessibilityRole="button"
          accessibilityLabel="Confirmer la commande"
          accessibilityState={{ disabled: paying }}
        >
          <Text style={styles.ctaText}>
            {paying ? "TRAITEMENT..." : `CONFIRMER • ${formatPrice(subtotal + DELIVERY_FEE)}`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingBottom: 40 },
  label: { marginTop: 14, marginBottom: 6, fontWeight: "800", color: "#333" },
  input: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#EEE",
    paddingHorizontal: 14,
    color: "#222",
  },
  section: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "900",
  },
  method: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  methodActive: {
    borderColor: "#F28C28",
    backgroundColor: "#FFF3E7",
  },
  methodText: { fontWeight: "700", color: "#333" },
  summary: { marginTop: 16, marginBottom: 8 },
  summaryText: { fontWeight: "900", fontSize: 16, color: "#F28C28" },
  simulatedNote: { marginTop: 6, fontSize: 11, color: "#9CA3AF" },
  cta: {
    marginTop: 8,
    backgroundColor: "#F28C28",
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaDisabled: { opacity: 0.6 },
  ctaText: { color: "#FFF", fontWeight: "900" },
});
