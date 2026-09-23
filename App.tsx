import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import AuthNavigator from "./screens/auth/AuthNavigator";
import HomeScreen from "./screens/client/HomeScreen";
import CartScreen from "./screens/client/CartScreen";
import CheckoutScreen from "./screens/client/CheckoutScreen";
import OrdersScreen from "./screens/client/OrdersScreen";
import ProfileScreen from "./screens/client/ProfileScreen";
import OrderTrackingScreen from "./screens/client/OrderTrackingScreen";
import CategoriesScreen from "./screens/client/CategoriesScreen";
import FavoritesScreen from "./screens/client/FavoritesScreen";
import ProductDetailScreen from "./screens/client/ProductDetailScreen";
import NotificationToast from "./components/NotificationToast";
import BottomNavigation from "./components/BottomNavigation";
import FeedbackButton from "./components/FeedbackButton";
import { getRoleTheme } from "./constants/roleTheme";
import { getCartCount, useCartStore } from "./store/cartStore";
import SellerDashboard from "./screens/seller/SellerDashboard";
import SellerProducts from "./screens/seller/SellerProducts";
import SellerOrders from "./screens/seller/SellerOrders";
import SellerRevenue from "./screens/seller/SellerRevenue";
import SellerProfile from "./screens/seller/SellerProfile";
import DeliveryDashboard from "./screens/delivery/DeliveryDashboard";
import DeliveryAvailable from "./screens/delivery/DeliveryAvailable";
import DeliveryActive from "./screens/delivery/DeliveryActive";
import DeliveryEarnings from "./screens/delivery/DeliveryEarnings";
import DeliveryHistory from "./screens/delivery/DeliveryHistory";
import DeliveryProfile from "./screens/delivery/DeliveryProfile";
import AdminDashboard from "./screens/admin/AdminDashboard";
import AdminApprovals from "./screens/admin/AdminApprovals";
import AdminUsers from "./screens/admin/AdminUsers";
import AdminProducts from "./screens/admin/AdminProducts";
import AdminOrders from "./screens/admin/AdminOrders";
import AdminFeedback from "./screens/admin/AdminFeedback";
import { useUserStore } from "./store/userStore";
import { hydrateAuthStore } from "./store/authStore";
import { hydrateCartStore } from "./store/cartStore";
import { hydrateOrderStore } from "./store/orderStore";
import { hydrateProductStore } from "./store/productStore";
import { hydrateNotificationStore } from "./store/notificationStore";
import { hydrateReviewStore } from "./store/reviewStore";
import { hydrateFavoriteStore } from "./store/favoriteStore";
import { useFeedbackList } from "./store/feedbackStore";

type ClientView =
  | "home"
  | "categories"
  | "cart"
  | "checkout"
  | "orders"
  | "profile"
  | "tracking"
  | "favorites"
  | "product-detail";

const CLIENT_TABS: ClientView[] = ["home", "categories", "cart", "orders", "profile"];
type SellerView = "dashboard" | "products" | "orders" | "revenue" | "profile";

const SELLER_TABS: SellerView[] = ["dashboard", "products", "orders", "revenue", "profile"];
type DeliveryView = "dashboard" | "available" | "active" | "earnings" | "history" | "profile";

const DELIVERY_TABS: DeliveryView[] = ["dashboard", "available", "active", "history", "profile"];
type AdminView = "dashboard" | "approvals" | "users" | "products" | "orders" | "feedback";

const ADMIN_TABS: AdminView[] = ["dashboard", "approvals", "orders", "feedback", "users"];

export default function App() {
  const [ready, setReady] = useState(false);
  const user = useUserStore();
  const [clientView, setClientView] = useState<ClientView>("home");
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const cart = useCartStore();
  const [sellerView, setSellerView] = useState<SellerView>("dashboard");
  const [deliveryView, setDeliveryView] = useState<DeliveryView>("dashboard");
  const [adminView, setAdminView] = useState<AdminView>("dashboard");
  // Vide pour tout rôle non admin (l'abonnement Firestore n'est ouvert que pour l'admin).
  const feedbackList = useFeedbackList();

  useEffect(() => {
    Promise.all([
      hydrateAuthStore(),
      hydrateCartStore(),
      hydrateOrderStore(),
      hydrateProductStore(),
      hydrateNotificationStore(),
      hydrateReviewStore(),
      hydrateFavoriteStore(),
    ]).finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLogo}>ML CHOP</Text>
        <Text style={styles.splashHint}>Chargement...</Text>
      </View>
    );
  }

  let content: React.ReactNode;
  /** Vue courante (ex : "client:cart") jointe aux retours testeurs ; null = écrans d'auth. */
  let feedbackScreen: string | null = null;
  let hasTabs = false;

  if (!user.role) {
    content = <AuthNavigator />;
  } else if (user.role === "client") {
    const showTabs = CLIENT_TABS.includes(clientView);
    feedbackScreen = `client:${clientView}`;
    hasTabs = showTabs;
    content = (
      <>
        <View style={{ flex: 1 }}>
          <ClientNavigator
            currentView={clientView}
            onChangeView={setClientView}
            trackedOrderId={trackedOrderId}
            selectedProductId={selectedProductId}
            selectedCategory={selectedCategory}
            onTrackOrder={(orderId) => {
              setTrackedOrderId(orderId);
              setClientView("tracking");
            }}
            onOpenProduct={(productId) => {
              setSelectedProductId(productId);
              setClientView("product-detail");
            }}
            onSelectCategory={(category) => {
              setSelectedCategory(category);
              setClientView("home");
            }}
          />
          {showTabs ? (
            <BottomNavigation
              accentColor={getRoleTheme("client").primary}
              active={clientView}
              onChange={(key) => setClientView(key as ClientView)}
              tabs={[
                { key: "home", icon: "🏠", label: "Accueil" },
                { key: "categories", icon: "🗂️", label: "Catégories" },
                { key: "cart", icon: "🛒", label: "Panier", badge: getCartCount(cart) },
                { key: "orders", icon: "📦", label: "Commandes" },
                { key: "profile", icon: "👤", label: "Profil" },
              ]}
            />
          ) : null}
        </View>
        <NotificationToast />
      </>
    );
  } else if (user.role === "seller") {
    feedbackScreen = `seller:${sellerView}`;
    hasTabs = SELLER_TABS.includes(sellerView);
    content = (
      <View style={{ flex: 1 }}>
        <SellerNavigator currentView={sellerView} onChangeView={setSellerView} />
        {SELLER_TABS.includes(sellerView) ? (
          <BottomNavigation
            accentColor={getRoleTheme("seller").primary}
            active={sellerView}
            onChange={(key) => setSellerView(key as SellerView)}
            tabs={[
              { key: "dashboard", icon: "🏠", label: "Accueil" },
              { key: "products", icon: "🛍️", label: "Produits" },
              { key: "orders", icon: "📦", label: "Commandes" },
              { key: "revenue", icon: "💰", label: "Revenus" },
              { key: "profile", icon: "👤", label: "Profil" },
            ]}
          />
        ) : null}
      </View>
    );
  } else if (user.role === "delivery") {
    feedbackScreen = `delivery:${deliveryView}`;
    hasTabs = DELIVERY_TABS.includes(deliveryView);
    content = (
      <View style={{ flex: 1 }}>
        <DeliveryNavigator currentView={deliveryView} onChangeView={setDeliveryView} />
        {DELIVERY_TABS.includes(deliveryView) ? (
          <BottomNavigation
            accentColor={getRoleTheme("delivery").primary}
            active={deliveryView}
            onChange={(key) => setDeliveryView(key as DeliveryView)}
            tabs={[
              { key: "dashboard", icon: "🏠", label: "Accueil" },
              { key: "available", icon: "📭", label: "Disponibles" },
              { key: "active", icon: "🛵", label: "En cours" },
              { key: "history", icon: "🕘", label: "Historique" },
              { key: "profile", icon: "👤", label: "Profil" },
            ]}
          />
        ) : null}
      </View>
    );
  } else {
    feedbackScreen = `admin:${adminView}`;
    hasTabs = ADMIN_TABS.includes(adminView);
    content = (
      <View style={{ flex: 1 }}>
        <AdminNavigator currentView={adminView} onChangeView={setAdminView} />
        {hasTabs ? (
          <BottomNavigation
            accentColor={getRoleTheme("admin").primary}
            active={adminView}
            onChange={(key) => setAdminView(key as AdminView)}
            tabs={[
              { key: "dashboard", icon: "🏠", label: "Accueil" },
              { key: "approvals", icon: "✅", label: "Validations" },
              { key: "orders", icon: "📦", label: "Commandes" },
              {
                key: "feedback",
                icon: "🐞",
                label: "Retours",
                badge: feedbackList.filter((item) => item.status === "new").length,
              },
              { key: "users", icon: "👥", label: "Comptes" },
            ]}
          />
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.frame}>
        {content}
        {feedbackScreen ? <FeedbackButton screen={feedbackScreen} aboveTabs={hasTabs} /> : null}
      </View>
    </View>
  );
}

function ClientNavigator({
  currentView,
  onChangeView,
  trackedOrderId,
  selectedProductId,
  selectedCategory,
  onTrackOrder,
  onOpenProduct,
  onSelectCategory,
}: {
  currentView: ClientView;
  onChangeView: (view: ClientView) => void;
  trackedOrderId: string | null;
  selectedProductId: number | null;
  selectedCategory: string | null;
  onTrackOrder: (orderId: string) => void;
  onOpenProduct: (productId: number) => void;
  onSelectCategory: (category: string) => void;
}) {
  switch (currentView) {
    case "categories":
      return <CategoriesScreen onSelectCategory={onSelectCategory} />;
    case "cart":
      return (
        <CartScreen
          onCheckout={() => onChangeView("checkout")}
          onBack={() => onChangeView("home")}
        />
      );
    case "checkout":
      return (
        <CheckoutScreen
          onBack={() => onChangeView("cart")}
          onSuccess={() => onChangeView("orders")}
        />
      );
    case "orders":
      return <OrdersScreen onTrackOrder={onTrackOrder} />;
    case "tracking":
      return (
        <OrderTrackingScreen
          orderId={trackedOrderId}
          onBack={() => onChangeView("orders")}
        />
      );
    case "favorites":
      return (
        <FavoritesScreen
          onBack={() => onChangeView("profile")}
          onOpenProduct={onOpenProduct}
        />
      );
    case "product-detail":
      return selectedProductId ? (
        <ProductDetailScreen
          productId={selectedProductId}
          onBack={() => onChangeView("home")}
          onOpenCart={() => onChangeView("cart")}
        />
      ) : (
        <HomeScreen onOpenCart={() => onChangeView("cart")} onTrackOrder={onTrackOrder} onOpenProduct={onOpenProduct} />
      );
    case "profile":
      return <ProfileScreen onFavorites={() => onChangeView("favorites")} />;
    default:
      return (
        <HomeScreen
          onOpenCart={() => onChangeView("cart")}
          onTrackOrder={onTrackOrder}
          onOpenProduct={onOpenProduct}
          initialCategory={selectedCategory}
        />
      );
  }
}

function SellerNavigator({
  currentView,
  onChangeView,
}: {
  currentView: SellerView;
  onChangeView: (view: SellerView) => void;
}) {
  switch (currentView) {
    case "products":
      return <SellerProducts onBack={() => onChangeView("dashboard")} />;
    case "orders":
      return <SellerOrders onBack={() => onChangeView("dashboard")} />;
    case "revenue":
      return <SellerRevenue onBack={() => onChangeView("dashboard")} />;
    case "profile":
      return <SellerProfile onBack={() => onChangeView("dashboard")} />;
    default:
      return (
        <SellerDashboard
          onProducts={() => onChangeView("products")}
          onOrders={() => onChangeView("orders")}
          onRevenue={() => onChangeView("revenue")}
          onProfile={() => onChangeView("profile")}
        />
      );
  }
}

function DeliveryNavigator({
  currentView,
  onChangeView,
}: {
  currentView: DeliveryView;
  onChangeView: (view: DeliveryView) => void;
}) {
  switch (currentView) {
    case "available":
      return <DeliveryAvailable onAccepted={() => onChangeView("active")} />;
    case "active":
      return (
        <DeliveryActive
          onGoToAvailable={() => onChangeView("available")}
          onGoHome={() => onChangeView("dashboard")}
          onGoHistory={() => onChangeView("history")}
        />
      );
    case "earnings":
      return (
        <DeliveryEarnings
          onBack={() => onChangeView("dashboard")}
          onHistory={() => onChangeView("history")}
        />
      );
    case "history":
      return <DeliveryHistory onBack={() => onChangeView("dashboard")} />;
    case "profile":
      return <DeliveryProfile onBack={() => onChangeView("dashboard")} />;
    default:
      return (
        <DeliveryDashboard
          onNewOrder={() => onChangeView("available")}
          onActive={() => onChangeView("active")}
          onEarnings={() => onChangeView("earnings")}
          onHistory={() => onChangeView("history")}
          onProfile={() => onChangeView("profile")}
        />
      );
  }
}

function AdminNavigator({
  currentView,
  onChangeView,
}: {
  currentView: AdminView;
  onChangeView: (view: AdminView) => void;
}) {
  switch (currentView) {
    case "approvals":
      return <AdminApprovals onBack={() => onChangeView("dashboard")} />;
    case "users":
      return <AdminUsers onBack={() => onChangeView("dashboard")} />;
    case "products":
      return <AdminProducts onBack={() => onChangeView("dashboard")} />;
    case "orders":
      return <AdminOrders onBack={() => onChangeView("dashboard")} />;
    case "feedback":
      return <AdminFeedback onBack={() => onChangeView("dashboard")} />;
    default:
      return (
        <AdminDashboard
          onApprovals={() => onChangeView("approvals")}
          onUsers={() => onChangeView("users")}
          onProducts={() => onChangeView("products")}
          onOrders={() => onChangeView("orders")}
          onFeedback={() => onChangeView("feedback")}
        />
      );
  }
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F8FA",
  },
  splashLogo: { fontSize: 30, fontWeight: "900", color: "#F28C28" },
  splashHint: { marginTop: 8, fontSize: 12, color: "#9CA3AF" },
  root: {
    flex: 1,
    backgroundColor: Platform.OS === "web" ? "#E5E7EB" : "transparent",
    alignItems: "center",
  },
  // Sur grand écran (PC), on garde une largeur "smartphone" centrée plutôt
  // que d'étirer l'app sur toute la largeur du navigateur.
  frame: {
    flex: 1,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 480 : undefined,
    backgroundColor: "#F7F8FA",
  },
});
