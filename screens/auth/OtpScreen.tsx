import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Role } from "../../types";
import { getRoleTheme } from "../../constants/roleTheme";
import { DEMO_OTP_CODE } from "../../constants/config";
import { useRegistrationDraft, verifyRegistrationOtp } from "../../store/authStore";

type Props = {
  role: Exclude<Role, null | "admin">;
  onBack: () => void;
};

/** Écran OTP — code fixe de démo, aucune vraie API SMS branchée (voir constants/config.ts). */
export default function OtpScreen({ role, onBack }: Props) {
  const theme = getRoleTheme(role);
  const draft = useRegistrationDraft();
  const [code, setCode] = useState("");

  function verify() {
    const result = verifyRegistrationOtp(code.trim());

    if (!result.success) {
      Alert.alert(
        "Code incorrect",
        result.reason === "no_draft"
          ? "Session d'inscription expirée, recommencez."
          : `Code de démo : ${DEMO_OTP_CODE}`
      );
      return;
    }
    // Le compte est créé + la session ouverte dans verifyRegistrationOtp :
    // App.tsx redirige automatiquement vers la bonne interface.
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.light }]}>
      <View style={styles.content}>
        <TouchableOpacity onPress={onBack}>
          <Text style={[styles.back, { color: theme.primary }]}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.emoji}>📲</Text>
        <Text style={styles.title}>Vérification du numéro</Text>
        <Text style={styles.subtitle}>
          Code envoyé au {draft?.phone ?? "votre numéro"}{"\n"}
          (démo : {DEMO_OTP_CODE})
        </Text>

        <TextInput
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={4}
          placeholder="••••"
          style={styles.input}
        />

        <TouchableOpacity style={[styles.cta, { backgroundColor: theme.primary }]} onPress={verify}>
          <Text style={styles.ctaText}>VÉRIFIER ET CRÉER MON COMPTE</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setCode(DEMO_OTP_CODE)}>
          <Text style={styles.fill}>Remplir avec le code de démo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  back: { position: "absolute", top: 8, left: 24, fontWeight: "800", fontSize: 13 },
  emoji: { fontSize: 44, textAlign: "center" },
  title: { marginTop: 14, fontSize: 22, fontWeight: "900", textAlign: "center", color: "#111827" },
  subtitle: { marginTop: 8, fontSize: 13, color: "#6B7280", textAlign: "center", lineHeight: 19 },
  input: {
    marginTop: 26,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    textAlign: "center",
    fontSize: 26,
    letterSpacing: 10,
    color: "#111827",
  },
  cta: {
    marginTop: 22,
    height: 54,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: "#FFFFFF", fontWeight: "900", fontSize: 13 },
  fill: { marginTop: 16, textAlign: "center", color: "#9CA3AF", fontSize: 12, fontWeight: "700" },
});
