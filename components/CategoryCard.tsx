import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

import { getCategoryColor, getCategoryTint } from "../constants/theme";

type Props = {
  name: string;
  emoji: string;
  active?: boolean;
  onPress: () => void;
};

export default function CategoryCard({ name, emoji, active, onPress }: Props) {
  const color = getCategoryColor(name);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        active && { backgroundColor: getCategoryTint(name), borderColor: color },
      ]}
      onPress={onPress}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.name, active && { color }]}>{name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 86,
    marginRight: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    alignItems: "center",
  },
  emoji: {
    fontSize: 20,
  },
  name: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "800",
    color: "#555",
  },
});
