import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { logoutAccount, useCurrentAccount } from "../../store/authStore";
import { getRoleTheme } from "../../constants/roleTheme";
import Header from "../../components/Header";

const theme = getRoleTheme("seller");

const STATUS_LABEL: Record<string, { label: string; color: string; background: string }> = {
  active: { label: "Boutique active ✅", color: "#16A34A", background: "#DCFCE7" },
  pending_approval: { label: "En attente d'approbation ⏳", color: "#B45309", background: "#FEF3C7" },
  rejected: { label: "Compte refusé", color: "#DC2626", background: "#FEE2E2" },
};

export default function SellerProfile({ onBack }: { onBack?: () => void }) {
  const account = useCurrentAccount();
  const status = STATUS_LABEL[account?.status ?? "active"];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Profil" subtitle="Espace vendeur" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🏪</Text>
          </View>
          <Text style={styles.name}>{account?.shopName || account?.fullName || "Ma boutique"}</Text>
          <Text style={styles.meta}>{account?.fullName}</Text>
          <Text style={styles.meta}>{account?.phone}</Text>

          <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logout} onPress={logoutAccount}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: theme.light,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 32 },
  name: { marginTop: 12, fontSize: 18, fontWeight: "900", color: "#1E1B4B" },
  meta: { marginTop: 4, color: "#777", fontSize: 13 },
  statusBadge: { marginTop: 12, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  statusText: { fontSize: 12, fontWeight: "900" },
  logout: {
    marginTop: 24,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#EEE",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: { fontWeight: "800", color: "#D64545" },
});
