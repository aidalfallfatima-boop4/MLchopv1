export type Role = "client" | "seller" | "delivery" | "admin" | null;

export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  emoji: string;
  description?: string;
  stock?: number;
  sellerId?: string;
  /** Dénormalisé depuis users/{sellerId}.shopName au moment de la création :
   * évite au client d'avoir à lire la collection "users" (réservée admin) juste
   * pour afficher le nom de la boutique sur la fiche produit. */
  sellerName?: string;
  /** false = retiré de la vente par le vendeur (masqué côté client) */
  active?: boolean;
  popular?: boolean;
  trending?: boolean;
};

export type CartItem = Product & {
  quantity: number;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipping"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "orange_money" | "moov_money" | "wave" | "card" | "cash";

/** Statut du paiement associé à une commande — simulation locale, pas de vraie transaction. */
export type PaymentStatus = "pending" | "paid" | "failed";

export type OrderStatusEvent = {
  status: OrderStatus;
  at: string;
};

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  paymentReference?: string;
  createdAt: string;
  deliveryCode?: string;
  deliveryFee?: number;
  /** uid du client (Firebase Auth) — absent seulement pour les commandes seed locales pré-Firebase. */
  customerId?: string;
  /** uid(s) des vendeurs des produits de cette commande — sert aux Security Rules. */
  sellerIds?: string[];
  /** uid du livreur assigné, défini par acceptOrder(). */
  deliveryId?: string;
  /** Historique des changements de statut ("Une commande doit conserver... l'historique des changements"). */
  statusHistory?: OrderStatusEvent[];
};

export type ChatMessage = {
  id: string;
  sender: "user" | "bot";
  text: string;
  createdAt: string;
};

export type SellerProduct = Product & {
  sellerId: string;
};

export type DeliveryOrder = Order & {
  deliveryFee: number;
};

/** Sous-étapes de la livraison une fois la commande "en livraison" (status = "shipping"). */
export type MissionPhase = "assigned" | "pickup" | "enroute" | "arrived";

export type Vehicle = "Moto" | "Voiture" | "Tricycle";

/** Vendeur/Livreur : compte créé mais pas encore validé par l'Admin. */
export type ApprovalStatus = "pending_approval" | "active" | "rejected";

export type Account = {
  /** = uid Firebase Auth (et id du doc Firestore users/{id}). */
  id: string;
  role: Exclude<Role, null>;
  fullName: string;
  phone: string;
  shopName?: string;
  vehicle?: Vehicle;
  status: ApprovalStatus;
  createdAt: string;
};

export type Review = {
  id: string;
  productId: number;
  orderId?: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
};
