import React from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import {
  acceptAvailableOrder,
  useDeliveryOffer,
} from "../../store/deliveryStore";
import { formatPrice } from "../../utils/formatPrice";
import { paymentLabel } from "../../utils/orderLabels";

type Props = {
  onAccept?: () => void;
  onBack?: () => void;
};

export default function DeliveryNewOrder({ onAccept, onBack }: Props) {
  const order = useDeliveryOffer();

  function handleAccept() {
    const accepted = acceptAvailableOrder();

    if (!accepted) {
      Alert.alert(
        "Aucune mission",
        "Aucune commande n'est prête à être livrée."
      );
      return;
    }

    onAccept?.();
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Aucune livraison</Text>
          <Text style={styles.subtitle}>
            Les nouvelles missions apparaîtront ici.
          </Text>
          <TouchableOpacity style={styles.rejectButton} onPress={onBack}>
            <Text style={styles.rejectText}>← Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Nouvelle livraison 📦</Text>
            <Text style={styles.subtitle}>
              Une nouvelle mission est disponible
            </Text>
          </View>

          <View style={styles.notification}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </View>
        </View>

        {/* COMMANDE */}
        <View style={styles.orderCard}>
          <View style={styles.orderTop}>
            <View>
              <Text style={styles.orderLabel}>Commande</Text>
              <Text style={styles.orderNumber}>#{order.id}</Text>
            </View>

            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NOUVELLE</Text>
            </View>
          </View>

          {/* VENDEUR */}
          <View style={styles.locationSection}>
            <View style={styles.iconCircleGreen}>
              <Text style={styles.bigIcon}>🏪</Text>
            </View>

            <View style={styles.locationInfo}>
              <Text style={styles.smallLabel}>POINT DE DÉPART</Text>

              <Text style={styles.locationTitle}>
                Boutique ML CHOP
              </Text>

              <Text style={styles.address}>
                Hamdallaye ACI 2000
              </Text>

              <View style={styles.landmark}>
                <Text style={styles.landmarkIcon}>📍</Text>
                <Text style={styles.landmarkText}>
                  À côté de la station-service
                </Text>
              </View>
            </View>
          </View>

          {/* CONNECTEUR */}
          <View style={styles.connector}>
            <View style={styles.connectorLine} />
          </View>

          {/* CLIENT */}
          <View style={styles.locationSection}>
            <View style={styles.iconCircleRed}>
              <Text style={styles.bigIcon}>🏠</Text>
            </View>

            <View style={styles.locationInfo}>
              <Text style={styles.smallLabel}>DESTINATION</Text>

              <Text style={styles.locationTitle}>
                {order.customerName}
              </Text>

              <Text style={styles.address}>
                {order.deliveryAddress}
              </Text>

              <View style={styles.landmark}>
                <Text style={styles.landmarkIcon}>📍</Text>
                <Text style={styles.landmarkText}>
                  En face de la pharmacie
                </Text>
              </View>
            </View>
          </View>

          {/* INFORMATIONS */}
          <View style={styles.detailsContainer}>
            <DetailItem
              icon="📏"
              label="Distance"
              value="4,2 km"
            />

            <DetailItem
              icon="⏱️"
              label="Temps estimé"
              value="12 min"
            />

            <DetailItem
              icon="💰"
              label="Frais"
              value={formatPrice(order.deliveryFee ?? 2500)}
            />

            <DetailItem
              icon="💳"
              label="Paiement"
              value={paymentLabel(order.paymentMethod)}
            />
          </View>

          {/* REPÈRES */}
          <View style={styles.landmarksCard}>
            <Text style={styles.landmarksTitle}>
              🧭 Repères importants
            </Text>

            <LandmarkItem text="Station-service" />
            <LandmarkItem text="Rond-point de l'ACI" />
            <LandmarkItem text="Pharmacie" />
          </View>

          {/* ACTIONS */}
          <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
            <Text style={styles.acceptText}>
              ✅ ACCEPTER
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rejectButton} onPress={onBack}>
            <Text style={styles.rejectText}>
              ❌ REFUSER
            </Text>
          </TouchableOpacity>
        </View>

        {/* CHECK POT */}
        <View style={styles.checkPotCard}>
          <View style={styles.checkPotAvatar}>
            <Text style={styles.checkPotEmoji}>👨🏾‍💼</Text>
          </View>

          <View style={styles.checkPotContent}>
            <Text style={styles.checkPotName}>
              Check Pot
            </Text>

            <Text style={styles.checkPotMessage}>
              Cette livraison est à seulement 4,2 km.
              Je peux t'aider à trouver le chemin. 🧭
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* NAVIGATION */}
      <View style={styles.bottomNav}>
        <NavItem icon="🏠" label="Accueil" />
        <NavItem icon="🗺️" label="Carte" />
        <NavItem icon="📦" label="Livraisons" active />
        <NavItem icon="👤" label="Profil" />
      </View>
    </View>
  );
}

/* =========================
   DETAIL ITEM
========================= */

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailIcon}>{icon}</Text>

      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

/* =========================
   LANDMARK ITEM
========================= */

function LandmarkItem({
  text,
}: {
  text: string;
}) {
  return (
    <View style={styles.landmarkItem}>
      <View style={styles.landmarkDot} />

      <Text style={styles.landmarkItemText}>
        {text}
      </Text>
    </View>
  );
}

/* =========================
   NAVIGATION
========================= */

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.navItem}>
      <Text
        style={[
          styles.navIcon,
          active && styles.activeIcon,
        ]}
      >
        {icon}
      </Text>

      <Text
        style={[
          styles.navLabel,
          active && styles.activeLabel,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  content: {
    padding: 20,
    paddingBottom: 110,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    color: "#6B7280",
  },

  notification: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },

  notificationIcon: {
    fontSize: 22,
  },

  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    elevation: 3,
  },

  orderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  orderLabel: {
    fontSize: 11,
    color: "#6B7280",
    textTransform: "uppercase",
  },

  orderNumber: {
    marginTop: 3,
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
  },

  newBadge: {
    backgroundColor: "#E8F8EE",
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  newBadgeText: {
    color: "#16A34A",
    fontSize: 10,
    fontWeight: "900",
  },

  locationSection: {
    flexDirection: "row",
    marginTop: 20,
  },

  iconCircleGreen: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F8EE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  iconCircleRed: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEECEC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  bigIcon: {
    fontSize: 23,
  },

  locationInfo: {
    flex: 1,
  },

  smallLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6B7280",
    marginBottom: 4,
  },

  locationTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  address: {
    marginTop: 3,
    fontSize: 13,
    color: "#4B5563",
  },

  landmark: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E7",
    borderRadius: 9,
    padding: 8,
    marginTop: 9,
  },

  landmarkIcon: {
    fontSize: 15,
    marginRight: 6,
  },

  landmarkText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    color: "#92400E",
  },

  connector: {
    height: 24,
    marginLeft: 23,
  },

  connectorLine: {
    height: "100%",
    width: 2,
    backgroundColor: "#D1D5DB",
  },

  detailsContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    marginTop: 22,
    padding: 13,
  },

  detailItem: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  detailIcon: {
    width: 30,
    fontSize: 18,
  },

  detailLabel: {
    flex: 1,
    fontSize: 13,
    color: "#6B7280",
  },

  detailValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },

  landmarksCard: {
    marginTop: 15,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 15,
  },

  landmarksTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },

  landmarkItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  landmarkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F59E0B",
    marginRight: 10,
  },

  landmarkItemText: {
    fontSize: 13,
    color: "#4B5563",
  },

  acceptButton: {
    backgroundColor: "#16A34A",
    borderRadius: 15,
    paddingVertical: 17,
    alignItems: "center",
    marginTop: 20,
  },

  acceptText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  rejectButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },

  rejectText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "800",
  },

  checkPotCard: {
    marginTop: 18,
    backgroundColor: "#FFF8E7",
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  checkPotAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  checkPotEmoji: {
    fontSize: 27,
  },

  checkPotContent: {
    flex: 1,
  },

  checkPotName: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
  },

  checkPotMessage: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#4B5563",
  },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 78,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  navItem: {
    width: "25%",
    alignItems: "center",
  },

  navIcon: {
    fontSize: 22,
    marginBottom: 4,
  },

  navLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },

  activeIcon: {
    transform: [{ scale: 1.08 }],
  },

  activeLabel: {
    color: "#16A34A",
    fontWeight: "800",
  },
});