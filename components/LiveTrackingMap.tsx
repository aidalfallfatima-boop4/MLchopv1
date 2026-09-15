import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { OrderStatus } from "../types";
import {
  CLIENT_LOCATION,
  ROUTE_LANDMARKS,
  distanceKm,
  estimateEtaMinutes,
  projectPoint,
  STORE_LOCATION,
} from "../constants/landmarks";
import { DriverPositionState } from "../store/deliveryStore";
import { STATUS_META } from "../constants/theme";

type Props = {
  status: OrderStatus;
  driver: DriverPositionState;
};

function pct(value: number): `${number}%` {
  return `${Math.round(value * 1000) / 10}%`;
}

export default function LiveTrackingMap({ status, driver }: Props) {
  const isShipping = status === "shipping";
  const storePos = projectPoint(STORE_LOCATION);
  const clientPos = projectPoint(CLIENT_LOCATION);

  const driverGeo = driver.position
    ? { lat: driver.position.lat, lng: driver.position.lng }
    : null;
  const driverPos = driverGeo ? projectPoint(driverGeo) : null;

  const distance = driverGeo ? distanceKm(driverGeo, CLIENT_LOCATION) : null;
  const eta = distance !== null ? estimateEtaMinutes(distance) : null;

  return (
    <View style={styles.card}>
      <View style={styles.map}>
        {ROUTE_LANDMARKS.map((landmark) => {
          const p = projectPoint(landmark.point);
          return (
            <View
              key={landmark.name}
              style={[styles.landmark, { left: pct(p.x), top: pct(p.y) }]}
            >
              <Text style={styles.landmarkIcon}>{landmark.icon}</Text>
              <Text style={styles.landmarkLabel}>{landmark.name}</Text>
            </View>
          );
        })}

        <View style={[styles.pin, { left: pct(storePos.x), top: pct(storePos.y) }]}>
          <View style={[styles.pinDot, { backgroundColor: "#16A34A" }]}>
            <Text style={styles.pinEmoji}>🏪</Text>
          </View>
        </View>

        <View style={[styles.pin, { left: pct(clientPos.x), top: pct(clientPos.y) }]}>
          <View style={[styles.pinDot, { backgroundColor: "#DC2626" }]}>
            <Text style={styles.pinEmoji}>🏠</Text>
          </View>
        </View>

        {isShipping && driverPos ? (
          <View style={[styles.pin, { left: pct(driverPos.x), top: pct(driverPos.y) }]}>
            <View style={styles.driverPulse} />
            <View style={[styles.pinDot, { backgroundColor: "#2563EB" }]}>
              <Text style={styles.pinEmoji}>🛵</Text>
            </View>
          </View>
        ) : null}
      </View>

      {isShipping ? (
        <DriverStatusBar driver={driver} distance={distance} eta={eta} />
      ) : (
        <View style={styles.waitingBar}>
          <Text style={styles.waitingIcon}>{STATUS_META[status].icon}</Text>
          <Text style={styles.waitingText}>
            Le suivi GPS en direct démarre dès qu'un livreur accepte votre commande.
          </Text>
        </View>
      )}
    </View>
  );
}

function DriverStatusBar({
  driver,
  distance,
  eta,
}: {
  driver: DriverPositionState;
  distance: number | null;
  eta: number | null;
}) {
  if (driver.status === "requesting") {
    return (
      <View style={styles.infoBar}>
        <Text style={styles.infoIcon}>📡</Text>
        <Text style={styles.infoText}>
          Connexion au GPS du livreur en cours...
        </Text>
      </View>
    );
  }

  if (driver.status === "denied") {
    return (
      <View style={[styles.infoBar, styles.infoBarWarning]}>
        <Text style={styles.infoIcon}>⚠️</Text>
        <Text style={styles.infoText}>
          Localisation indisponible côté livreur. Vous serez notifié à chaque étape.
        </Text>
      </View>
    );
  }

  if (driver.status === "tracking" && distance !== null && eta !== null) {
    return (
      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricIcon}>📏</Text>
          <Text style={styles.metricValue}>{distance.toFixed(1)} km</Text>
          <Text style={styles.metricLabel}>Distance</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricIcon}>⏱️</Text>
          <Text style={styles.metricValue}>{eta} min</Text>
          <Text style={styles.metricLabel}>Estimé</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricIcon}>🟢</Text>
          <Text style={styles.metricValue}>Live</Text>
          <Text style={styles.metricLabel}>Position</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.infoBar}>
      <Text style={styles.infoIcon}>🛵</Text>
      <Text style={styles.infoText}>En attente du signal GPS du livreur...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEF0F3",
  },
  map: {
    height: 260,
    backgroundColor: "#E7F0FB",
    position: "relative",
  },
  pin: {
    position: "absolute",
    marginLeft: -18,
    marginTop: -18,
    alignItems: "center",
  },
  pinDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    elevation: 4,
  },
  pinEmoji: { fontSize: 16 },
  driverPulse: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    top: -8,
    left: -8,
    backgroundColor: "rgba(37,99,235,0.18)",
  },
  landmark: {
    position: "absolute",
    marginLeft: -10,
    marginTop: -10,
    alignItems: "center",
  },
  landmarkIcon: {
    fontSize: 13,
    backgroundColor: "#FFFFFF",
    width: 22,
    height: 22,
    textAlign: "center",
    lineHeight: 22,
    borderRadius: 11,
    overflow: "hidden",
  },
  landmarkLabel: {
    marginTop: 2,
    fontSize: 8,
    fontWeight: "800",
    color: "#374151",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  waitingBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  waitingIcon: { fontSize: 18, marginRight: 10 },
  waitingText: { flex: 1, fontSize: 12, color: "#6B7280", lineHeight: 17 },
  infoBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#EFF6FF",
  },
  infoBarWarning: { backgroundColor: "#FFFBEB" },
  infoIcon: { fontSize: 16, marginRight: 8 },
  infoText: { flex: 1, fontSize: 12, color: "#374151" },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 14,
  },
  metric: { alignItems: "center" },
  metricIcon: { fontSize: 18 },
  metricValue: { marginTop: 4, fontWeight: "900", color: "#111827", fontSize: 14 },
  metricLabel: { marginTop: 2, fontSize: 10, color: "#9CA3AF" },
});
