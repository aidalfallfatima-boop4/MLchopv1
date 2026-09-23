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
} from "react-native";

import { Role } from "../../types";
import { getRoleTheme } from "../../constants/roleTheme";
import { login } from "../../store/authStore";

type Props = {
  role: Exclude<Role, null>;
  onBack: () => void;
  onRegister: () => void;
};

export default function LoginScreen({ role, onBack, onRegister }: Props) {
  const theme = getRoleTheme(role);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!phone.trim()) {
      Alert.alert("Numéro requis", "Entrez votre numéro de téléphone.");
      return;
    }

    setLoading(true);
    const result = await login(phone.trim(), password);
    setLoading(false);

    if (!result.success) {
      Alert.alert(
        "Connexion impossible",
        result.reason === "not_found"
          ? "Aucun compte trouvé avec ce numéro. Créez un compte."
          : result.reason === "wrong_password"
            ? "Mot de passe incorrect."
            : result.message ?? "Une erreur est survenue."
      );
      return;
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.light }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={onBack}>
            <Text style={[styles.back, { color: theme.primary }]}>← Changer de rôle</Text>
          </TouchableOpacity>

          <Text style={styles.emoji}>{theme.emoji}</Text>
          <Text style={styles.title}>Connexion {theme.label}</Text>
          <Text style={styles.subtitle}>Entrez vos identifiants ML CHOP</Text>

          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+223 XX XX XX XX"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity
            style={[styles.cta, { backgroundColor: theme.primary }, loading && { opacity: 0.6 }]}
            onPress={submit}
            disabled={loading}
          >
            <Text style={styles.ctaText}>{loading ? "CONNEXION..." : "SE CONNECTER"}</Text>
          </TouchableOpacity>

          {role !== "admin" ? (
            <TouchableOpacity style={styles.registerLink} onPress={onRegister}>
              <Text style={styles.registerText}>
                Pas encore de compte ? <Text style={{ color: theme.primary, fontWeight: "900" }}>Créer un compte</Text>
              </Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 60 },
  back: { fontWeight: "800", fontSize: 13 },
  emoji: { fontSize: 40, marginTop: 20, textAlign: "center" },
  title: { marginTop: 10, fontSize: 24, fontWeight: "900", textAlign: "center", color: "#111827" },
  subtitle: { marginTop: 6, fontSize: 13, color: "#6B7280", textAlign: "center", marginBottom: 24 },
  label: { marginTop: 14, marginBottom: 6, fontWeight: "800", color: "#333" },
  input: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    color: "#111827",
  },
  cta: {
    marginTop: 22,
    height: 54,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#FFFFFF", fontWeight: "900", fontSize: 14 },
  registerLink: { marginTop: 18, alignItems: "center" },
  registerText: { fontSize: 13, color: "#4B5563" },
});
