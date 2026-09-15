import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { MissionPhase, Order } from "../../types";
import { formatPrice } from "../../utils/formatPrice";
import { getRoleTheme } from "../../constants/roleTheme";

const theme = getRoleTheme("delivery");

const PHASE_LABEL: Record<MissionPhase, string> = {
  assigned: "À récupérer chez le vendeur",
  pickup: "À récupérer chez le vendeur",
  enroute: "En route vers le client",
  arrived: "Arrivé chez le client",
};

type Props = {
  order: Order;
  phase: MissionPhase;
  onPress: () => void;
};

/** Bandeau "mission en cours" affiché sur le tableau de bord livreur. */
export default function DeliveryStatusCard({ order, phase, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.dot} />
      <View style={styles.info}>
        <Text style={styles.title}>Livraison {order.id} en cours</Text>
        <Text style={styles.subtitle}>{PHASE_LABEL[phase]}</Text>
      </View>
      <Text style={styles.fee}>{formatPrice(order.deliveryFee ?? 2500)}</Text>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.light,
    borderRadius: 16,
    padding: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.primary,
    marginRight: 10,
  },
  info: { flex: 1 },
  title: { fontWeight: "900", fontSize: 12, color: theme.primaryDark },
  subtitle: { marginTop: 2, fontSize: 11, color: "#374151" },
  fee: { fontWeight: "900", fontSize: 12, color: "#111827", marginRight: 8 },
  arrow: { fontSize: 16, color: theme.primary, fontWeight: "900" },
});
