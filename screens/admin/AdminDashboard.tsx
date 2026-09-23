import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAccounts } from "../../store/authStore";
import { useOrderStore } from "../../store/orderStore";
import { useProductStore } from "../../store/productStore";
import { formatPrice } from "../../utils/formatPrice";
import { getRoleTheme } from "../../constants/roleTheme";
import { logoutAccount } from "../../store/authStore";
import { useFeedbackList } from "../../store/feedbackStore";

const theme = getRoleTheme("admin");

type Props = {
  onApprovals: () => void;
  onUsers: () => void;
  onProducts: () => void;
  onOrders: () => void;
  onFeedback: () => void;
};

export default function AdminDashboard({ onApprovals, onUsers, onProducts, onOrders, onFeedback }: Props) {
  const accounts = useAccounts();
  const orders = useOrderStore();
  const products = useProductStore();
  const feedback = useFeedbackList();
  const newFeedbackCount = feedback.filter((item) => item.status === "new").length;

  const pending = accounts.filter((account) => account.status === "pending_approval");
  const revenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>Supervision 👨‍💼</Text>
            <Text style={styles.title}>Espace Admin</Text>
          </View>
          <TouchableOpacity style={styles.logout} onPress={logoutAccount}>
            <Text style={styles.logoutIcon}>↪</Text>
          </TouchableOpacity>
        </View>

        {pending.length > 0 ? (
          <TouchableOpacity style={styles.alertCard} onPress={onApprovals}>
            <Text style={styles.alertIcon}>⏳</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>{pending.length} compte(s) en attente</Text>
              <Text style={styles.alertHint}>Vendeurs / livreurs à valider →</Text>
            </View>
          </TouchableOpacity>
        ) : null}

        <View style={styles.statsGrid}>
          <StatCard icon="👥" value={String(accounts.length)} label="Comptes" onPress={onUsers} />
          <StatCard icon="🛍️" value={String(products.length)} label="Produits" onPress={onProducts} />
          <StatCard icon="📦" value={String(orders.length)} label="Commandes" onPress={onOrders} />
          <StatCard icon="💰" value={formatPrice(revenue)} label="Volume total" small />
          <StatCard
            icon="🐞"
            value={String(newFeedbackCount)}
            label="Retours testeurs (nouveaux)"
            onPress={onFeedback}
          />
        </View>

        <Text style={styles.section}>Accès rapide</Text>
        <MenuRow icon="✅" title="Approbations vendeurs / livreurs" onPress={onApprovals} />
        <MenuRow icon="👥" title="Utilisateurs" onPress={onUsers} />
        <MenuRow icon="🛍️" title="Produits" onPress={onProducts} />
        <MenuRow icon="📦" title="Commandes" onPress={onOrders} />
        <MenuRow icon="🐞" title="Retours testeurs" onPress={onFeedback} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  icon,
  value,
  label,
  onPress,
  small,
}: {
  icon: string;
  value: string;
  label: string;
  onPress?: () => void;
  small?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.statCard} onPress={onPress} disabled={!onPress} activeOpacity={0.8}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, small && { fontSize: 15 }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function MenuRow({ icon, title, onPress }: { icon: string; title: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress}>
      <View style={styles.menuIcon}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuArrow}>→</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9" },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hello: { color: "#64748B", fontSize: 13 },
  title: { marginTop: 4, fontSize: 24, fontWeight: "900", color: theme.primary },
  logout: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  logoutIcon: { fontSize: 20, color: "#334155" },
  alertCard: {
    marginTop: 16,
    backgroundColor: "#FEF3C7",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  alertIcon: { fontSize: 22, marginRight: 12 },
  alertTitle: { fontWeight: "900", color: "#92400E", fontSize: 13 },
  alertHint: { marginTop: 2, fontSize: 11, color: "#B45309", fontWeight: "700" },
  statsGrid: {
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statIcon: { fontSize: 20 },
  statValue: { marginTop: 8, fontSize: 20, fontWeight: "900", color: "#0F172A" },
  statLabel: { marginTop: 3, fontSize: 11, color: "#64748B" },
  section: { marginTop: 10, marginBottom: 12, fontSize: 16, fontWeight: "900", color: "#0F172A" },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuTitle: { flex: 1, fontWeight: "800", color: "#1E293B", fontSize: 13 },
  menuArrow: { color: theme.primary, fontSize: 18, fontWeight: "900" },
});
