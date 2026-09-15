import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type HeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightLabel?: string;
  onRightPress?: () => void;
  right?: React.ReactNode;
};

export default function Header({
  title,
  subtitle,
  onBack,
  rightLabel,
  onRightPress,
  right,
}: HeaderProps) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <TouchableOpacity style={styles.side} onPress={onBack}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.side} />
      )}

      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {right ? (
        <View style={styles.side}>{right}</View>
      ) : rightLabel ? (
        <TouchableOpacity style={styles.side} onPress={onRightPress}>
          <Text style={styles.right}>{rightLabel}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.side} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 18,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  side: {
    width: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#222",
  },
  subtitle: {
    marginTop: 2,
    fontSize: 11,
    color: "#888",
  },
  back: {
    fontSize: 22,
    color: "#F28C28",
    fontWeight: "900",
  },
  right: {
    fontSize: 12,
    fontWeight: "800",
    color: "#F28C28",
  },
});
