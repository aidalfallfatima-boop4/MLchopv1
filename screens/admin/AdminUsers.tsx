import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAccounts } from "../../store/authStore";
import { getRoleTheme } from "../../constants/roleTheme";
import Header from "../../components/Header";

type Props = { onBack: () => void };

const STATUS_LABEL: Record<string, string> = {
  active: "Actif",
  pending_approval: "En attente",
  rejected: "Refusé",
};

export default function AdminUsers({ onBack }: Props) {
  const accounts = useAccounts();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Utilisateurs" subtitle={`${accounts.length} comptes`} onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        {accounts.map((account) => {
          const theme = getRoleTheme(account.role);
          return (
            <View key={account.id} style={styles.card}>
              <View style={[styles.avatar, { backgroundColor: theme.light }]}>
                <Text style={{ fontSize: 18 }}>{theme.emoji}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{account.fullName}</Text>
                <Text style={styles.meta}>{theme.label} · {account.phone}</Text>
              </View>
              <Text
                style={[
                  styles.status,
                  {
                    color:
                      account.status === "active"
                        ? "#16A34A"
                        : account.status === "rejected"
                        ? "#DC2626"
                        : "#B45309",
                  },
                ]}
              >
                {STATUS_LABEL[account.status]}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  content: { padding: 20, paddingBottom: 40 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  avatar: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  info: { flex: 1, marginLeft: 12 },
  name: { fontWeight: "900", color: "#0F172A", fontSize: 13 },
  meta: { marginTop: 3, fontSize: 11, color: "#64748B" },
  status: { fontWeight: "900", fontSize: 11 },
});
