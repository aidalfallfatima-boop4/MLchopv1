import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { useActiveOrder } from "../../store/deliveryStore";

type Props = {
  onComplete?: () => void;
  onBack?: () => void;
};

export default function DeliveryInProgress({ onComplete, onBack }: Props) {
  const order = useActiveOrder();
  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🚚</Text>

        <View>
          <Text style={styles.title}>Livraison en cours</Text>
          <Text style={styles.subtitle}>ML CHOP</Text>
        </View>

        <TouchableOpacity style={styles.notification}>
          <Text style={styles.notificationText}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Destination */}
      <View style={styles.destinationCard}>
        <Text style={styles.sectionTitle}>📍 Destination</Text>

        <Text style={styles.clientName}>
          Client : {order?.customerName ?? "Client ML CHOP"}
        </Text>

        <Text style={styles.address}>
          {order?.deliveryAddress ?? "Bamako"}
        </Text>

        <Text style={styles.landmark}>
          📍 Repère : À côté de la station-service
        </Text>
      </View>

      {/* Informations trajet */}
      <View style={styles.infoRow}>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>⏱️</Text>
          <Text style={styles.infoValue}>12 min</Text>
          <Text style={styles.infoLabel}>Temps restant</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>📏</Text>
          <Text style={styles.infoValue}>4,2 km</Text>
          <Text style={styles.infoLabel}>Distance</Text>
        </View>
      </View>

      {/* Prochains repères */}
      <View style={styles.landmarksCard}>
        <Text style={styles.sectionTitle}>
          🧭 Prochains repères
        </Text>

        <View style={styles.landmarkRow}>
          <Text style={styles.landmarkDistance}>500 m</Text>
          <Text style={styles.landmarkText}>
            → Rond-point
          </Text>
        </View>

        <View style={styles.landmarkRow}>
          <Text style={styles.landmarkDistance}>300 m</Text>
          <Text style={styles.landmarkText}>
            → Station-service
          </Text>
        </View>

        <View style={styles.landmarkRow}>
          <Text style={styles.landmarkDistance}>100 m</Text>
          <Text style={styles.landmarkText}>
            → Tourner à droite
          </Text>
        </View>
      </View>

      {/* Navigation */}
      <TouchableOpacity style={styles.navigationButton} onPress={onComplete}>
        <Text style={styles.navigationText}>
          🧭 JE SUIS ARRIVÉ
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.contactButton} onPress={onBack}>
        <Text style={styles.contactText}>← Retour</Text>
      </TouchableOpacity>

      {/* Contact */}
      <View style={styles.contactRow}>
        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactText}>
            ☎️ Appeler
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactText}>
            💬 Message
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    padding: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  headerIcon: {
    fontSize: 36,
    marginRight: 12,
  },

  title: {
    fontSize: 23,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },

  notification: {
    marginLeft: "auto",
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  notificationText: {
    fontSize: 22,
  },

  destinationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },

  clientName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },

  address: {
    fontSize: 16,
    marginBottom: 10,
  },

  landmark: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },

  infoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },

  infoCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },

  infoIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  infoValue: {
    fontSize: 20,
    fontWeight: "800",
  },

  infoLabel: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
    textAlign: "center",
  },

  landmarksCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },

  landmarkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  landmarkDistance: {
    width: 65,
    fontWeight: "800",
    fontSize: 14,
  },

  landmarkText: {
    fontSize: 15,
    fontWeight: "600",
  },

  navigationButton: {
    backgroundColor: "#168A45",
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 12,
  },

  navigationText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "800",
  },

  contactRow: {
    flexDirection: "row",
    gap: 12,
  },

  contactButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },

  contactText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
  },
});