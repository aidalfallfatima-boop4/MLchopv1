import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useUserStore } from "../../store/userStore";
import { logoutAccount, useCurrentAccount } from "../../store/authStore";
import { useFavoriteIds } from "../../store/favoriteStore";
import Header from "../../components/Header";

type Props = {
  onFavorites?: () => void;
};

export default function ProfileScreen({ onFavorites }: Props) {
  const user = useUserStore();
  const account = useCurrentAccount();
  const favoriteIds = useFavoriteIds();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Profil" subtitle="Espace client" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.meta}>{user.phone}</Text>
          <Text style={styles.meta}>{user.address}</Text>
          {account ? (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Compte actif</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.section}>Mon espace</Text>

        <TouchableOpacity style={styles.menuItem} onPress={onFavorites}>
          <View style={styles.menuIcon}>
            <Text>❤️</Text>
          </View>
          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>Favoris</Text>
            <Text style={styles.menuSubtitle}>{favoriteIds.length} produit(s)</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
          <View style={styles.menuIcon}>
            <Text>🔔</Text>
          </View>
          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>Notifications</Text>
            <Text style={styles.menuSubtitle}>Gérer les alertes de commande</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
          <View style={styles.menuIcon}>
            <Text>🔒</Text>
          </View>
          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>Sécurité</Text>
            <Text style={styles.menuSubtitle}>Mot de passe et sécurité</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logout} onPress={logoutAccount}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingBottom: 100 },
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
    backgroundColor: "#FFF3E7",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 32 },
  name: { marginTop: 12, fontSize: 18, fontWeight: "900", color: "#222" },
  meta: { marginTop: 4, color: "#777", fontSize: 13 },
  statusBadge: {
    marginTop: 10,
    backgroundColor: "#DCFCE7",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { color: "#16A34A", fontSize: 11, fontWeight: "900" },
  section: { marginTop: 22, marginBottom: 10, fontSize: 15, fontWeight: "900", color: "#222" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F7F8FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuText: { flex: 1 },
  menuTitle: { fontWeight: "800", fontSize: 13, color: "#222" },
  menuSubtitle: { marginTop: 2, fontSize: 11, color: "#888" },
  arrow: { fontSize: 22, color: "#CCC" },
  logout: {
    marginTop: 12,
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
