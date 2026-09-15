import React from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { setAccountStatus, useAccounts } from "../../store/authStore";
import { getRoleTheme } from "../../constants/roleTheme";
import Header from "../../components/Header";

type Props = { onBack: () => void };

export default function AdminApprovals({ onBack }: Props) {
  const accounts = useAccounts();
  const pending = accounts.filter((account) => account.status === "pending_approval");
  const decided = accounts.filter((account) => account.status !== "pending_approval" && account.role !== "client");

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Approbations" subtitle="Vendeurs & livreurs" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>En attente ({pending.length})</Text>
        {pending.length === 0 ? (
          <Text style={styles.empty}>Aucune demande en attente.</Text>
        ) : (
          pending.map((account) => {
            const theme = getRoleTheme(account.role);
            return (
              <View key={account.id} style={styles.card}>
                <View style={[styles.avatar, { backgroundColor: theme.light }]}>
                  <Text style={{ fontSize: 20 }}>{theme.emoji}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{account.fullName}</Text>
                  <Text style={styles.meta}>
                    {theme.label} · {account.phone}
                    {account.shopName ? ` · ${account.shopName}` : ""}
                    {account.vehicle ? ` · ${account.vehicle}` : ""}
                  </Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.approve]}
                    onPress={() => {
                      setAccountStatus(account.id, "active");
                      Alert.alert("Compte validé", `${account.fullName} peut maintenant se connecter.`);
                    }}
                  >
                    <Text style={styles.approveText}>✅</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.reject]}
                    onPress={() => setAccountStatus(account.id, "rejected")}
                  >
                    <Text style={styles.rejectText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        <Text style={styles.section}>Historique</Text>
        {decided.map((account) => {
          const theme = getRoleTheme(account.role);
          return (
            <View key={account.id} style={styles.historyRow}>
              <Text style={styles.historyName}>{account.fullName}</Text>
              <Text
                style={[
                  styles.historyStatus,
                  { color: account.status === "active" ? "#16A34A" : "#DC2626" },
                ]}
              >
                {account.status === "active" ? "Validé" : "Refusé"}
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
  section: { fontSize: 15, fontWeight: "900", color: "#0F172A", marginBottom: 12, marginTop: 8 },
  empty: { color: "#94A3B8", fontSize: 13 },
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
  avatar: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  info: { flex: 1, marginLeft: 12 },
  name: { fontWeight: "900", color: "#0F172A", fontSize: 13 },
  meta: { marginTop: 3, fontSize: 11, color: "#64748B" },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  approve: { backgroundColor: "#DCFCE7" },
  reject: { backgroundColor: "#FEE2E2" },
  approveText: { fontSize: 14 },
  rejectText: { fontSize: 14, color: "#DC2626", fontWeight: "900" },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  historyName: { fontWeight: "700", color: "#334155", fontSize: 12 },
  historyStatus: { fontWeight: "900", fontSize: 12 },
});
