import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export type NavTab = {
  key: string;
  icon: string;
  label: string;
  badge?: number;
};

type Props = {
  tabs: NavTab[];
  active: string;
  onChange: (key: string) => void;
  /** Couleur d'accent pour l'onglet actif — permet une identité par rôle. */
  accentColor?: string;
};

export default function BottomNavigation({ tabs, active, onChange, accentColor = "#F28C28" }: Props) {
  return (
    <View style={styles.bar}>
      {tabs.map((tab) => {
        const isActive = tab.key === active;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.item}
            onPress={() => onChange(tab.key)}
          >
            <View>
              <Text style={styles.icon}>{tab.icon}</Text>
              {tab.badge ? (
                <View style={[styles.badge, { backgroundColor: accentColor }]}>
                  <Text style={styles.badgeText}>{tab.badge > 9 ? "9+" : tab.badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, isActive && { color: accentColor }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingVertical: 10,
    paddingHorizontal: 8,
    paddingBottom: 14,
  },
  item: {
    flex: 1,
    alignItems: "center",
  },
  icon: {
    fontSize: 18,
  },
  label: {
    marginTop: 4,
    fontSize: 10,
    color: "#999",
    fontWeight: "700",
  },
  badge: {
    position: "absolute",
    right: -8,
    top: -4,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
  },
});
