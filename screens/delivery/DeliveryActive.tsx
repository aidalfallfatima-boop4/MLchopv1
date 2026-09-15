import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import {
  clearMission,
  confirmPickedUp,
  markArrivingSoon,
  useMissionOrder,
  useMissionPhase,
} from "../../store/deliveryStore";
import { getRoleTheme } from "../../constants/roleTheme";
import DeliveryPickup from "./DeliveryPickup";
import DeliveryMap from "./DeliveryMap";
import DeliveryInProgress from "./DeliveryInProgress";
import DeliveryArrived from "./DeliveryArrived";
import DeliveryConfirmation from "./DeliveryConfirmation";
import DeliverySuccess from "./DeliverySuccess";

const theme = getRoleTheme("delivery");

type Props = {
  onGoToAvailable: () => void;
  onGoHome: () => void;
  onGoHistory: () => void;
};

/**
 * Orchestre le parcours d'une mission déjà acceptée :
 * récupération → route → arrivée → confirmation OTP → succès.
 * L'étape affichée dépend de missionPhase (store) + order.status, pas d'un
 * état de navigation séparé — elle survit donc si on quitte/revient sur l'onglet.
 */
export default function DeliveryActive({ onGoToAvailable, onGoHome, onGoHistory }: Props) {
  const order = useMissionOrder();
  const phase = useMissionPhase();
  const [showMap, setShowMap] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛵</Text>
          <Text style={styles.emptyTitle}>Aucune livraison en cours</Text>
          <Text style={styles.emptyText}>
            Acceptez une mission depuis l'onglet "Disponibles" pour la voir apparaître ici.
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={onGoToAvailable}>
            <Text style={styles.emptyButtonText}>Voir les livraisons disponibles</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (order.status === "delivered") {
    return (
      <DeliverySuccess
        onHome={() => {
          setConfirming(false);
          clearMission();
          onGoHome();
        }}
        onHistory={() => {
          setConfirming(false);
          clearMission();
          onGoHistory();
        }}
      />
    );
  }

  if (confirming) {
    return (
      <DeliveryConfirmation
        onBack={() => setConfirming(false)}
        onConfirm={() => setConfirming(false)}
      />
    );
  }

  if (showMap) {
    return <DeliveryMap onBack={() => setShowMap(false)} onStart={() => setShowMap(false)} />;
  }

  if (phase === "assigned" || phase === "pickup") {
    return (
      <DeliveryPickup
        order={order}
        onPickedUp={confirmPickedUp}
        onOpenMap={() => setShowMap(true)}
      />
    );
  }

  if (phase === "enroute") {
    return <DeliveryInProgress onComplete={markArrivingSoon} />;
  }

  return (
    <DeliveryArrived order={order} onConfirmDelivery={() => setConfirming(true)} />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30 },
  emptyIcon: { fontSize: 48, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  emptyText: { marginTop: 8, fontSize: 12, color: "#6B7280", textAlign: "center", lineHeight: 18 },
  emptyButton: {
    marginTop: 20,
    backgroundColor: theme.primary,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  emptyButtonText: { color: "#FFFFFF", fontWeight: "900", fontSize: 12 },
});
