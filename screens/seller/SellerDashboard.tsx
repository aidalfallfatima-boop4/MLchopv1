import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { logoutAccount, useCurrentAccount } from "../../store/authStore";
import { useOrderStore } from "../../store/orderStore";
import { useProductStore } from "../../store/productStore";
import { formatPrice } from "../../utils/formatPrice";
import { OrderStatus } from "../../types";
import { getRoleTheme } from "../../constants/roleTheme";

const theme = getRoleTheme("seller");

type Props = {
  onProducts?: () => void;
  onOrders?: () => void;
  onRevenue?: () => void;
  onProfile?: () => void;
};

export default function SellerDashboard({ onProducts, onOrders, onRevenue, onProfile }: Props) {
  const orders = useOrderStore();
  const products = useProductStore();
  const account = useCurrentAccount();
  const pendingApproval = account?.status === "pending_approval";
  const revenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);
  const clients = new Set(orders.map((order) => order.customerPhone)).size;
  const recent = orders.slice(0, 3);

  const statusView = (
    status: OrderStatus
  ): { label: string; type: "new" | "preparing" | "done" } => {
    if (status === "delivered") {
      return { label: "Terminée", type: "done" };
    }
    if (status === "preparing" || status === "shipping" || status === "confirmed") {
      return { label: "En préparation", type: "preparing" };
    }
    return { label: "Nouvelle", type: "new" };
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.smallText}>Bonjour 👋</Text>
            <Text style={styles.title}>Mon espace vendeur</Text>
          </View>

          <TouchableOpacity onPress={logoutAccount} style={styles.notification}>
            <Text style={styles.notificationIcon}>↪</Text>
          </TouchableOpacity>
        </View>

        {pendingApproval ? (
          <View style={styles.pendingBanner}>
            <Text style={styles.pendingIcon}>⏳</Text>
            <Text style={styles.pendingText}>
              Compte en attente d'approbation par l'équipe ML CHOP. Votre boutique n'est pas
              encore visible des clients.
            </Text>
          </View>
        ) : null}

        {/* BOUTIQUE */}
        <View style={styles.shopCard}>
          <View style={styles.shopIcon}>
            <Text style={styles.shopEmoji}>🏪</Text>
          </View>

          <View style={styles.shopInfo}>
            <Text style={styles.shopName}>{account?.shopName || "Ma boutique"}</Text>

            <View style={styles.onlineRow}>
              <View style={[styles.onlineDot, pendingApproval && styles.pendingDot]} />

              <Text style={[styles.onlineText, pendingApproval && styles.pendingOnlineText]}>
                {pendingApproval ? "En attente" : "Boutique active"}
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={onProfile}>
            <Text style={styles.editText}>Profil</Text>
          </TouchableOpacity>
        </View>

        {/* CHIFFRE D'AFFAIRES */}
        <View style={styles.revenueCard}>
          <Text style={styles.revenueLabel}>
            Chiffre d'affaires
          </Text>

          <Text style={styles.revenue}>
            {formatPrice(revenue)}
          </Text>

          <View style={styles.revenueBottom}>
            <View style={styles.growth}>
              <Text style={styles.growthText}>
                ↗ +12,5 %
              </Text>
            </View>

            <Text style={styles.period}>
              Ce mois
            </Text>
          </View>
        </View>

        {/* STATISTIQUES */}
        <Text style={styles.sectionTitle}>
          Vue d'ensemble
        </Text>

        <View style={styles.statsGrid}>
          <StatCard
            icon="📦"
            value={String(orders.length)}
            label="Commandes"
          />

          <StatCard
            icon="🛍️"
            value={String(products.length)}
            label="Produits"
          />

          <StatCard
            icon="👥"
            value={String(clients)}
            label="Clients"
          />

          <StatCard
            icon="⭐"
            value="4,8"
            label="Note moyenne"
          />
        </View>

        {/* ACTIONS RAPIDES */}
        <Text style={styles.sectionTitle}>
          Actions rapides
        </Text>

        <View style={styles.actions}>
          <ActionButton
            icon="➕"
            title="Ajouter un produit"
            onPress={onProducts}
          />

          <ActionButton
            icon="📦"
            title="Voir les commandes"
            onPress={onOrders}
          />

          <ActionButton
            icon="🛍️"
            title="Mes produits"
            onPress={onProducts}
          />

          <ActionButton
            icon="💰"
            title="Mes revenus"
            onPress={onRevenue}
          />
        </View>

        {/* COMMANDES RÉCENTES */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>
            Commandes récentes
          </Text>

          <TouchableOpacity onPress={onOrders}>
            <Text style={styles.seeAll}>
              Voir tout
            </Text>
          </TouchableOpacity>
        </View>

        {recent.map((order) => {
          const view = statusView(order.status);
          return (
            <OrderCard
              key={order.id}
              customer={order.customerName}
              product={order.items[0]?.name ?? order.id}
              price={formatPrice(order.total)}
              status={view.label}
              statusType={view.type}
            />
          );
        })}

        {/* INFO */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💡</Text>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Conseil ML CHOP
            </Text>

            <Text style={styles.infoText}>
              Ajoutez des photos de qualité à vos
              produits pour augmenter vos ventes.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* STAT CARD */

function StatCard({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Text style={styles.statEmoji}>
          {icon}
        </Text>
      </View>

      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

/* ACTION BUTTON */

function ActionButton({
  icon,
  title,
  onPress,
}: {
  icon: string;
  title: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={styles.actionIcon}>
        <Text style={styles.actionEmoji}>
          {icon}
        </Text>
      </View>

      <Text style={styles.actionText}>
        {title}
      </Text>

      <Text style={styles.actionArrow}>
        →
      </Text>
    </TouchableOpacity>
  );
}

/* ORDER CARD */

function OrderCard({
  customer,
  product,
  price,
  status,
  statusType,
}: {
  customer: string;
  product: string;
  price: string;
  status: string;
  statusType: "new" | "preparing" | "done";
}) {
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderIcon}>
        <Text style={styles.orderEmoji}>📦</Text>
      </View>

      <View style={styles.orderInfo}>
        <Text style={styles.customer}>
          {customer}
        </Text>

        <Text style={styles.orderProduct}>
          {product}
        </Text>

        <Text style={styles.orderPrice}>
          {price}
        </Text>
      </View>

      <View
        style={[
          styles.status,
          statusType === "new" && styles.statusNew,
          statusType === "preparing" &&
            styles.statusPreparing,
          statusType === "done" && styles.statusDone,
        ]}
      >
        <Text
          style={[
            styles.statusText,
            statusType === "new" && styles.statusTextNew,
            statusType === "preparing" &&
              styles.statusTextPreparing,
            statusType === "done" &&
              styles.statusTextDone,
          ]}
        >
          {status}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  header: {
    paddingTop: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  smallText: {
    fontSize: 13,
    color: "#888",
  },

  title: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: "900",
    color: "#222",
  },

  notification: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEE",
  },

  notificationIcon: {
    fontSize: 22,
  },

  badge: {
    position: "absolute",
    right: -3,
    top: -3,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "900",
  },

  pendingBanner: {
    marginTop: 18,
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    borderRadius: 14,
    padding: 12,
  },
  pendingIcon: { fontSize: 18, marginRight: 8 },
  pendingText: { flex: 1, fontSize: 11, color: "#92400E", lineHeight: 16, fontWeight: "700" },
  pendingDot: { backgroundColor: "#D97706" },
  pendingOnlineText: { color: "#B45309" },
  shopCard: {
    marginTop: 22,
    padding: 15,
    backgroundColor: "#FFF",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEE",
  },

  shopIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: theme.light,
    justifyContent: "center",
    alignItems: "center",
  },

  shopEmoji: {
    fontSize: 27,
  },

  shopInfo: {
    flex: 1,
    marginLeft: 13,
  },

  shopName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#222",
  },

  onlineRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#2E9B59",
  },

  onlineText: {
    marginLeft: 5,
    fontSize: 11,
    color: "#2E9B59",
  },

  editText: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: "800",
  },

  revenueCard: {
    marginTop: 15,
    padding: 20,
    borderRadius: 20,
    backgroundColor: theme.primary,
  },

  revenueLabel: {
    color: "#FFF",
    fontSize: 13,
    opacity: 0.9,
  },

  revenue: {
    marginTop: 7,
    color: "#FFF",
    fontSize: 28,
    fontWeight: "900",
  },

  revenueBottom: {
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  growth: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  growthText: {
    color: theme.primary,
    fontSize: 11,
    fontWeight: "900",
  },

  period: {
    marginLeft: 10,
    color: "#FFF",
    fontSize: 11,
    opacity: 0.9,
  },

  sectionTitle: {
    marginTop: 23,
    marginBottom: 13,
    fontSize: 18,
    fontWeight: "900",
    color: "#222",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statCard: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 17,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },

  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.light,
    justifyContent: "center",
    alignItems: "center",
  },

  statEmoji: {
    fontSize: 20,
  },

  statValue: {
    marginTop: 11,
    fontSize: 22,
    fontWeight: "900",
    color: "#222",
  },

  statLabel: {
    marginTop: 3,
    fontSize: 11,
    color: "#888",
  },

  actions: {
    gap: 10,
  },

  actionButton: {
    minHeight: 62,
    paddingHorizontal: 13,
    backgroundColor: "#FFF",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEE",
  },

  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.light,
    justifyContent: "center",
    alignItems: "center",
  },

  actionEmoji: {
    fontSize: 19,
  },

  actionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
  },

  actionArrow: {
    fontSize: 20,
    color: theme.primary,
  },

  recentHeader: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  seeAll: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: "800",
  },

  orderCard: {
    minHeight: 90,
    marginBottom: 10,
    padding: 12,
    backgroundColor: "#FFF",
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEE",
  },

  orderIcon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },

  orderEmoji: {
    fontSize: 23,
  },

  orderInfo: {
    flex: 1,
    marginLeft: 11,
  },

  customer: {
    fontSize: 13,
    fontWeight: "900",
    color: "#333",
  },

  orderProduct: {
    marginTop: 3,
    fontSize: 11,
    color: "#888",
  },

  orderPrice: {
    marginTop: 4,
    fontSize: 12,
    color: theme.primary,
    fontWeight: "900",
  },

  status: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },

  statusNew: {
    backgroundColor: theme.light,
  },

  statusPreparing: {
    backgroundColor: "#FFF7D6",
  },

  statusDone: {
    backgroundColor: "#E8F7EE",
  },

  statusText: {
    fontSize: 9,
    fontWeight: "900",
  },

  statusTextNew: {
    color: theme.primary,
  },

  statusTextPreparing: {
    color: "#A57900",
  },

  statusTextDone: {
    color: "#2E9B59",
  },

  infoCard: {
    marginTop: 20,
    padding: 15,
    borderRadius: 17,
    backgroundColor: "#FFF",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#EEE",
  },

  infoIcon: {
    fontSize: 25,
  },

  infoContent: {
    flex: 1,
    marginLeft: 10,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#333",
  },

  infoText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: "#888",
  },
});