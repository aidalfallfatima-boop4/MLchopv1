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
  id: string;
  role: Exclude<Role, null>;
  fullName: string;
  phone: string;
  /** MVP local uniquement : jamais envoyé/affiché tel quel, remplacé par une vraie auth backend plus tard. */
  password: string;
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
