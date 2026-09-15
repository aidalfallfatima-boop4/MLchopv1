import React, { useState } from "react";
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { DEMO_DELIVERY_CODE } from "../../constants/config";
import { completeActiveDelivery, useActiveOrder } from "../../store/deliveryStore";

type Props = {
  onConfirm?: () => void;
  onBack?: () => void;
};

export default function DeliveryConfirmation({ onConfirm, onBack }: Props) {
  const [code, setCode] = useState("");
  const order = useActiveOrder();

  const confirmDelivery = () => {
    if (code !== DEMO_DELIVERY_CODE) {
      Alert.alert("Code incorrect", `Code de démo : ${DEMO_DELIVERY_CODE}`);
      return;
    }

    completeActiveDelivery();
    onConfirm?.();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📦</Text>

      <Text style={styles.title}>Remise de la commande</Text>

      <Text style={styles.order}>Commande #{order?.id ?? "—"}</Text>

      <Text style={styles.label}>
        Demandez au client son code de livraison
      </Text>

      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="Code de livraison"
        keyboardType="number-pad"
        maxLength={6}
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.qrButton}
        onPress={() => setCode(DEMO_DELIVERY_CODE)}
      >
        <Text style={styles.qrText}>📷 Scanner le QR code</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={confirmDelivery}
      >
        <Text style={styles.confirmText}>✅ CONFIRMER LA LIVRAISON</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onBack} style={{ marginTop: 16 }}>
        <Text style={{ textAlign: "center", color: "#777", fontWeight: "700" }}>
          ← Retour
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#F7F8FA",
  },

  icon: {
    fontSize: 60,
    textAlign: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },

  order: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 30,
  },

  label: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 14,
    padding: 16,
    fontSize: 22,
    textAlign: "center",
    marginBottom: 16,
  },

  qrButton: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#E9EEF5",
    marginBottom: 16,
  },

  qrText: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
  },

  confirmButton: {
    backgroundColor: "#168A45",
    padding: 18,
    borderRadius: 14,
  },

  confirmText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
  },
});