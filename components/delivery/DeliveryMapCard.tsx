import React from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  CLIENT_LOCATION,
  STORE_LOCATION,
  distanceKm,
  estimateEtaMinutes,
} from "../../constants/landmarks";
import { getRoleTheme } from "../../constants/roleTheme";

const theme = getRoleTheme("delivery");

/**
 * Aperçu compact trajet vendeur → client (distance/ETA), utilisé dans le
 * tableau de bord et les écrans de mission. Pas une vraie carte GPS —
 * l'itinéraire détaillé (repères, position réelle) vit dans DeliveryMap.tsx.
 */
export default function DeliveryMapCard() {
  const distance = distanceKm(STORE_LOCATION, CLIENT_LOCATION);
  const eta = estimateEtaMinutes(distance);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.point}>
          <Text style={styles.icon}>🏪</Text>
          <Text style={styles.label}>Vendeur</Text>
        </View>

        <View style={styles.line}>
          <Text style={styles.arrow}>➡️</Text>
        </View>

        <View style={styles.point}>
          <Text style={styles.icon}>🏠</Text>
          <Text style={styles.label}>Client</Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <Text style={styles.metricText}>📏 {distance.toFixed(1)} km</Text>
        <Text style={styles.metricText}>⏱️ {eta} min</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  row: { flexDirection: "row", alignItems: "center" },
  point: { alignItems: "center", width: 60 },
  icon: { fontSize: 22 },
  label: { marginTop: 4, fontSize: 10, fontWeight: "800", color: "#374151" },
  line: { flex: 1, alignItems: "center" },
  arrow: { fontSize: 18 },
  metrics: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricText: { fontSize: 11, fontWeight: "800", color: theme.primaryDark },
});
