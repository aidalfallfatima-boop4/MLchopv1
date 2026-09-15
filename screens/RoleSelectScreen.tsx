import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Role } from "../types";
import { getRoleTheme } from "../constants/roleTheme";

const ROLES: {
  role: Exclude<Role, null>;
  title: string;
  description: string;
}[] = [
  { role: "client", title: "Client", description: "Je veux acheter des produits" },
  { role: "seller", title: "Vendeur", description: "Je veux vendre mes produits" },
  { role: "delivery", title: "Livreur", description: "Je veux effectuer des livraisons" },
  { role: "admin", title: "Admin", description: "Supervision de la plateforme" },
];

type Props = {
  onSelectRole: (role: Exclude<Role, null>) => void;
};

export default function RoleSelectScreen({ onSelectRole }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerWrap}>
        <Text style={styles.badge}>🇲🇱</Text>
        <Text style={styles.logo}>ML CHOP</Text>
        <Text style={styles.title}>Bienvenue sur ML Chop</Text>
        <Text style={styles.subtitle}>Choisissez votre espace pour continuer</Text>
      </View>

      {ROLES.map((item) => {
        const theme = getRoleTheme(item.role);
        return (
          <TouchableOpacity
            key={item.role}
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => onSelectRole(item.role)}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.light }]}>
              <Text style={styles.emoji}>{theme.emoji}</Text>
            </View>

            <View style={styles.info}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardText}>{item.description}</Text>
            </View>

            <Text style={[styles.arrow, { color: theme.primary }]}>→</Text>
          </TouchableOpacity>
        );
      })}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 22,
    paddingTop: 52,
    paddingBottom: 28,
    justifyContent: "center",
  },
  headerWrap: {
    marginBottom: 28,
    alignItems: "center",
  },
  badge: {
    fontSize: 28,
    marginBottom: 8,
  },
  logo: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0.5,
    color: "#F28C28",
    textAlign: "center",
  },
  title: {
    marginTop: 16,
    fontSize: 25,
    fontWeight: "800",
    textAlign: "center",
    color: "#191919",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E8EBF0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 28,
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#121826",
  },
  cardText: {
    marginTop: 5,
    fontSize: 13,
    color: "#667085",
  },
  arrow: {
    fontSize: 24,
    fontWeight: "700",
    marginLeft: 10,
  },
});
