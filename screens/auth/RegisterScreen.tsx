import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Role, Vehicle } from "../../types";
import { getRoleTheme } from "../../constants/roleTheme";
import { startRegistration } from "../../store/authStore";

type Props = {
  role: Exclude<Role, null | "admin">;
  onBack: () => void;
  onSubmitted: () => void;
};

const VEHICLES: Vehicle[] = ["Moto", "Voiture", "Tricycle"];

export default function RegisterScreen({ role, onBack, onSubmitted }: Props) {
  const theme = getRoleTheme(role);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [shopName, setShopName] = useState("");
  const [vehicle, setVehicle] = useState<Vehicle>("Moto");

  function submit() {
    if (!fullName.trim() || !phone.trim() || !password.trim()) {
      Alert.alert("Champs manquants", "Nom, téléphone et mot de passe sont requis.");
      return;
    }

    if (role === "seller" && !shopName.trim()) {
      Alert.alert("Boutique requise", "Indiquez le nom de votre boutique.");
      return;
    }

    // Le rôle + toutes les infos saisies sont conservés d'un bloc pour l'étape OTP —
    // c'est ce qui évite qu'un compte "client" soit créé par erreur.
    startRegistration({
      role,
      fullName: fullName.trim(),
      phone: phone.trim(),
      password,
      shopName: role === "seller" ? shopName.trim() : undefined,
      vehicle: role === "delivery" ? vehicle : undefined,
    });

    onSubmitted();
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.light }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={onBack}>
            <Text style={[styles.back, { color: theme.primary }]}>← Retour</Text>
          </TouchableOpacity>

          <Text style={styles.emoji}>{theme.emoji}</Text>
          <Text style={styles.title}>Créer un compte {theme.label}</Text>
          <Text style={styles.subtitle}>Un code de vérification vous sera envoyé par SMS</Text>

          <Text style={styles.label}>Nom complet</Text>
          <TextInput value={fullName} onChangeText={setFullName} style={styles.input} placeholder="Votre nom" />

          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
            placeholder="+223 XX XX XX XX"
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholder="••••••••"
          />

          {role === "seller" ? (
            <>
              <Text style={styles.label}>Nom de la boutique</Text>
              <TextInput
                value={shopName}
                onChangeText={setShopName}
                style={styles.input}
                placeholder="Ex : Boutique Fatoumata"
              />
            </>
          ) : null}

          {role === "delivery" ? (
            <>
              <Text style={styles.label}>Véhicule</Text>
              <View style={styles.vehicleRow}>
                {VEHICLES.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.vehicleChip,
                      vehicle === item && { backgroundColor: theme.light, borderColor: theme.primary },
                    ]}
                    onPress={() => setVehicle(item)}
                  >
                    <Text
                      style={[
                        styles.vehicleText,
                        vehicle === item && { color: theme.primary },
                      ]}
                    >
                      {item === "Moto" ? "🛵" : item === "Voiture" ? "🚗" : "🛺"} {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}

          {role !== "client" ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeText}>
                ℹ️ Votre compte {theme.label.toLowerCase()} sera actif après validation par
                l'équipe ML CHOP (statut "En attente d'approbation" au départ).
              </Text>
            </View>
          ) : null}

          <TouchableOpacity style={[styles.cta, { backgroundColor: theme.primary }]} onPress={submit}>
            <Text style={styles.ctaText}>CONTINUER → CODE SMS</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 60 },
  back: { fontWeight: "800", fontSize: 13 },
  emoji: { fontSize: 36, marginTop: 16, textAlign: "center" },
  title: { marginTop: 10, fontSize: 22, fontWeight: "900", textAlign: "center", color: "#111827" },
  subtitle: { marginTop: 6, fontSize: 12, color: "#6B7280", textAlign: "center", marginBottom: 18 },
  label: { marginTop: 12, marginBottom: 6, fontWeight: "800", color: "#333" },
  input: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    color: "#111827",
  },
  vehicleRow: { flexDirection: "row", gap: 8 },
  vehicleChip: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    alignItems: "center",
  },
  vehicleText: { fontSize: 12, fontWeight: "800", color: "#374151" },
  noticeCard: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
  },
  noticeText: { fontSize: 11, color: "#6B7280", lineHeight: 16 },
  cta: {
    marginTop: 22,
    height: 54,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#FFFFFF", fontWeight: "900", fontSize: 13 },
});
