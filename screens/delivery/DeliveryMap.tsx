import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { useActiveOrder } from "../../store/deliveryStore";

type Props = {
  onStart?: () => void;
  onBack?: () => void;
};

export default function DeliveryMap({ onStart, onBack }: Props) {
  const order = useActiveOrder();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Carte</Text>
          <Text style={styles.subtitle}>Itinéraire de livraison</Text>
        </View>

        <TouchableOpacity style={styles.notification}>
          <Text style={styles.notificationIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* CARTE GPS */}
      <View style={styles.map}>

        {/* Route */}
        <View style={styles.routeVertical} />
        <View style={styles.routeHorizontal} />

        {/* Position livreur */}
        <View style={[styles.marker, styles.driverMarker]}>
          <Text style={styles.markerText}>🛵</Text>
        </View>

        <Text style={[styles.markerLabel, styles.driverLabel]}>
          Vous êtes ici
        </Text>

        {/* Vendeur */}
        <View style={[styles.marker, styles.sellerMarker]}>
          <Text style={styles.markerText}>🟢</Text>
        </View>

        <Text style={[styles.markerLabel, styles.sellerLabel]}>
          Vendeur
        </Text>

        {/* Client */}
        <View style={[styles.marker, styles.clientMarker]}>
          <Text style={styles.markerText}>🔴</Text>
        </View>

        <Text style={[styles.markerLabel, styles.clientLabel]}>
          Client
        </Text>

        {/* Repères */}
        <View style={[styles.landmarkMarker, styles.landmark1]}>
          <Text>⛽</Text>
        </View>

        <Text style={[styles.landmarkText, styles.landmarkText1]}>
          Station-service
        </Text>

        <View style={[styles.landmarkMarker, styles.landmark2]}>
          <Text>🔄</Text>
        </View>

        <Text style={[styles.landmarkText, styles.landmarkText2]}>
          Rond-point ACI
        </Text>

        <View style={[styles.landmarkMarker, styles.landmark3]}>
          <Text>🏥</Text>
        </View>

        <Text style={[styles.landmarkText, styles.landmarkText3]}>
          Pharmacie
        </Text>

        {/* Indication */}
        <View style={styles.directionBubble}>
          <Text style={styles.directionIcon}>➡️</Text>

          <View>
            <Text style={styles.directionTitle}>
              Continue tout droit
            </Text>

            <Text style={styles.directionSubtitle}>
              Tourne à droite après la station
            </Text>
          </View>
        </View>

      </View>

      {/* INFORMATIONS */}
      <ScrollView
        style={styles.bottomContent}
        contentContainerStyle={styles.bottomInner}
      >
        <View style={styles.destinationCard}>

          <Text style={styles.destinationTitle}>
            Livraison vers le client
          </Text>

          <Text style={styles.destinationName}>
            📍 {order?.deliveryAddress ?? "Bamako"}
          </Text>

          <View style={styles.infoRow}>

            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>⏱️</Text>
              <Text style={styles.infoValue}>12 min</Text>
              <Text style={styles.infoLabel}>Temps</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📏</Text>
              <Text style={styles.infoValue}>4,2 km</Text>
              <Text style={styles.infoLabel}>Distance</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.infoValue}>Rond-point</Text>
              <Text style={styles.infoLabel}>Repère</Text>
            </View>

          </View>

          <View style={styles.landmarkCard}>
            <Text style={styles.landmarkTitle}>
              📌 Repère important
            </Text>

            <Text style={styles.landmarkDescription}>
              Destination à côté de la station-service,
              après le rond-point de l'ACI 2000.
            </Text>
          </View>

          {/* ITINERAIRE */}
          <TouchableOpacity style={styles.startButton} onPress={onStart}>
            <Text style={styles.startIcon}>🧭</Text>
            <Text style={styles.startText}>
              DÉMARRER L'ITINÉRAIRE
            </Text>
          </TouchableOpacity>

          {/* CONTACT */}
          <View style={styles.contactRow}>

            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactIcon}>☎️</Text>
              <Text style={styles.contactText}>
                Appeler le client
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactIcon}>💬</Text>
              <Text style={styles.contactText}>
                Message
              </Text>
            </TouchableOpacity>

          </View>

        </View>
      </ScrollView>

      {/* NAVIGATION */}
      <View style={styles.bottomNav}>

        <TouchableOpacity style={styles.navItem} onPress={onBack}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navText}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🗺️</Text>
          <Text style={styles.navActive}>Carte</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📦</Text>
          <Text style={styles.navText}>Livraisons</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Profil</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  header: {
    height: 78,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: "#6B7280",
  },

  notification: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  notificationIcon: {
    fontSize: 21,
  },

  map: {
    height: 390,
    margin: 12,
    borderRadius: 22,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
    position: "relative",
  },

  routeVertical: {
    position: "absolute",
    width: 7,
    height: 270,
    backgroundColor: "#16A34A",
    left: "48%",
    top: 60,
    transform: [{ rotate: "15deg" }],
    borderRadius: 10,
  },

  routeHorizontal: {
    position: "absolute",
    height: 7,
    width: 180,
    backgroundColor: "#16A34A",
    left: "25%",
    top: 220,
    transform: [{ rotate: "-12deg" }],
    borderRadius: 10,
  },

  marker: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    elevation: 5,
  },

  markerText: {
    fontSize: 24,
  },

  driverMarker: {
    left: 35,
    bottom: 70,
    borderWidth: 3,
    borderColor: "#2563EB",
  },

  sellerMarker: {
    left: 45,
    top: 70,
  },

  clientMarker: {
    right: 45,
    top: 95,
  },

  markerLabel: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: "700",
    elevation: 3,
  },

  driverLabel: {
    left: 22,
    bottom: 35,
  },

  sellerLabel: {
    left: 30,
    top: 120,
  },

  clientLabel: {
    right: 30,
    top: 145,
  },

  landmarkMarker: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },

  landmark1: {
    right: 80,
    top: 215,
  },

  landmark2: {
    left: 145,
    top: 155,
  },

  landmark3: {
    right: 125,
    bottom: 70,
  },

  landmarkText: {
    position: "absolute",
    fontSize: 9,
    fontWeight: "700",
    backgroundColor: "#FFFFFF",
    padding: 4,
    borderRadius: 5,
  },

  landmarkText1: {
    right: 25,
    top: 255,
  },

  landmarkText2: {
    left: 115,
    top: 195,
  },

  landmarkText3: {
    right: 75,
    bottom: 40,
  },

  directionBubble: {
    position: "absolute",
    left: 15,
    right: 15,
    top: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
  },

  directionIcon: {
    fontSize: 25,
    marginRight: 10,
  },

  directionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },

  directionSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: "#6B7280",
  },

  bottomContent: {
    flex: 1,
  },

  bottomInner: {
    padding: 12,
    paddingBottom: 120,
  },

  destinationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
  },

  destinationTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
  },

  destinationName: {
    marginTop: 7,
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  infoItem: {
    alignItems: "center",
    width: "31%",
    backgroundColor: "#F9FAFB",
    borderRadius: 13,
    padding: 10,
  },

  infoIcon: {
    fontSize: 19,
  },

  infoValue: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },

  infoLabel: {
    marginTop: 2,
    fontSize: 10,
    color: "#6B7280",
  },

  landmarkCard: {
    marginTop: 15,
    backgroundColor: "#FFF7ED",
    borderRadius: 14,
    padding: 13,
  },

  landmarkTitle: {
    color: "#9A3412",
    fontWeight: "800",
    fontSize: 13,
  },

  landmarkDescription: {
    marginTop: 5,
    color: "#7C2D12",
    fontSize: 12,
    lineHeight: 17,
  },

  startButton: {
    marginTop: 16,
    height: 56,
    borderRadius: 15,
    backgroundColor: "#16A34A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  startIcon: {
    fontSize: 20,
    marginRight: 8,
  },

  startText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  contactButton: {
    width: "48%",
    backgroundColor: "#F3F4F6",
    borderRadius: 13,
    paddingVertical: 13,
    alignItems: "center",
  },

  contactIcon: {
    fontSize: 19,
  },

  contactText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
  },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 82,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },

  navIcon: {
    fontSize: 22,
    marginBottom: 4,
  },

  navText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
  },

  navActive: {
    fontSize: 11,
    color: "#16A34A",
    fontWeight: "800",
  },
});