import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { OrderStatus } from "../types";
import { STATUS_FLOW, STATUS_META } from "../constants/theme";

type Props = {
  status: OrderStatus;
};

/** Timeline verticale du parcours d'une commande, colorée par étape. */
export default function OrderStatusTimeline({ status }: Props) {
  if (status === "cancelled") {
    const meta = STATUS_META.cancelled;
    return (
      <View style={[styles.cancelledBanner, { backgroundColor: meta.background }]}>
        <Text style={styles.cancelledIcon}>{meta.icon}</Text>
        <Text style={[styles.cancelledText, { color: meta.color }]}>
          Commande annulée
        </Text>
      </View>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(status);

  return (
    <View style={styles.container}>
      {STATUS_FLOW.map((step, index) => {
        const meta = STATUS_META[step];
        const done = index <= currentIndex;
        const isLast = index === STATUS_FLOW.length - 1;

        return (
          <View key={step} style={styles.row}>
            <View style={styles.markerColumn}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: done ? meta.color : "#E5E7EB",
                  },
                ]}
              >
                <Text style={styles.dotIcon}>{done ? meta.icon : ""}</Text>
              </View>
              {!isLast ? (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: index < currentIndex ? meta.color : "#E5E7EB" },
                  ]}
                />
              ) : null}
            </View>

            <View style={styles.textColumn}>
              <Text
                style={[
                  styles.label,
                  { color: done ? "#111827" : "#9CA3AF", fontWeight: done ? "900" : "700" },
                ]}
              >
                {meta.label}
              </Text>
              {index === currentIndex ? (
                <Text style={[styles.current, { color: meta.color }]}>En cours</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 4 },
  row: { flexDirection: "row" },
  markerColumn: { alignItems: "center", width: 34 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  dotIcon: { fontSize: 13 },
  line: { width: 3, flex: 1, minHeight: 22, borderRadius: 2 },
  textColumn: { flex: 1, paddingBottom: 18, paddingLeft: 10, paddingTop: 3 },
  label: { fontSize: 14 },
  current: { marginTop: 2, fontSize: 11, fontWeight: "800" },
  cancelledBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
  },
  cancelledIcon: { fontSize: 18, marginRight: 8 },
  cancelledText: { fontWeight: "900", fontSize: 14 },
});
