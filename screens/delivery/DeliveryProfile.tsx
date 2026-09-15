import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { logoutAccount, useCurrentAccount } from "../../store/authStore";

type Props = {
  onBack?: () => void;
};

const STATUS_LABEL: Record<string, string> = {
  active: "Disponible",
  pending_approval: "En attente d'approbation",
  rejected: "Compte refusé",
};

export default function DeliveryProfile({ onBack }: Props) {
  const account = useCurrentAccount();
  const initials = (account?.fullName || "Livreur ML CHOP")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.subtitle}>← Accueil</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Mon profil</Text>
          <Text style={styles.subtitle}>
            Gérez vos informations personnelles
          </Text>
        </View>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.bigAvatar}>
          <Text style={styles.bigAvatarText}>{initials}</Text>
        </View>

        <Text style={styles.name}>{account?.fullName || "Livreur ML CHOP"}</Text>
        <Text style={styles.role}>Livreur ML CHOP · {account?.vehicle ?? "Moto"}</Text>

        <View style={styles.onlineBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>{STATUS_LABEL[account?.status ?? "active"]}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Informations personnelles</Text>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Text>👤</Text>
          </View>

          <View style={styles.infoText}>
            <Text style={styles.label}>Nom complet</Text>
            <Text style={styles.value}>{account?.fullName || "Livreur ML CHOP"}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Text>📱</Text>
          </View>

          <View style={styles.infoText}>
            <Text style={styles.label}>Téléphone</Text>
            <Text style={styles.value}>{account?.phone || "+223 XX XX XX XX"}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Text>📍</Text>
          </View>

          <View style={styles.infoText}>
            <Text style={styles.label}>Zone principale</Text>
            <Text style={styles.value}>Bamako</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Mes statistiques</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📦</Text>
          <Text style={styles.statNumber}>124</Text>
          <Text style={styles.statLabel}>Livraisons</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>⭐</Text>
          <Text style={styles.statNumber}>4.9</Text>
          <Text style={styles.statLabel}>Note moyenne</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statNumber}>245K</Text>
          <Text style={styles.statLabel}>Gains</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Paramètres</Text>

      <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
        <View style={styles.menuIcon}>
          <Text>🔔</Text>
        </View>

        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>Notifications</Text>
          <Text style={styles.menuSubtitle}>
            Gérer les notifications
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
        <View style={styles.menuIcon}>
          <Text>🔒</Text>
        </View>

        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>Sécurité</Text>
          <Text style={styles.menuSubtitle}>
            Mot de passe et sécurité
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        activeOpacity={0.8}
        onPress={() => {
          logoutAccount();
        }}
      >
        <Text style={styles.logoutIcon}>↪</Text>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7F9",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#171717",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: "#777",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#E85D04",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 25,
    alignItems: "center",
    marginBottom: 25,
  },

  bigAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E85D04",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  bigAvatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },

  name: {
    fontSize: 21,
    fontWeight: "800",
    color: "#171717",
  },

  role: {
    marginTop: 5,
    fontSize: 14,
    color: "#777",
  },

  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9F8EF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 12,
  },

  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#20A45A",
    marginRight: 7,
  },

  onlineText: {
    color: "#18864B",
    fontSize: 12,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#171717",
    marginBottom: 12,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 25,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F6F7F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  infoText: {
    flex: 1,
  },

  label: {
    fontSize: 11,
    color: "#999",
    marginBottom: 3,
  },

  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  separator: {
    height: 1,
    backgroundColor: "#EEEEEE",
  },

  statsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 25,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    paddingVertical: 16,
    alignItems: "center",
  },

  statIcon: {
    fontSize: 20,
    marginBottom: 8,
  },

  statNumber: {
    fontSize: 17,
    fontWeight: "800",
    color: "#171717",
  },

  statLabel: {
    marginTop: 4,
    fontSize: 11,
    color: "#888",
    textAlign: "center",
  },

  menuItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F6F7F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  menuText: {
    flex: 1,
  },

  menuTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
  },

  menuSubtitle: {
    fontSize: 11,
    color: "#888",
    marginTop: 3,
  },

  arrow: {
    fontSize: 25,
    color: "#999",
  },

  logoutButton: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0B5B5",
    backgroundColor: "#FFF7F7",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  logoutIcon: {
    fontSize: 20,
    color: "#D64545",
    marginRight: 8,
  },

  logoutText: {
    color: "#D64545",
    fontSize: 14,
    fontWeight: "800",
  },
});