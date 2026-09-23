export const APP_NAME = "ML CHOP";

export const DELIVERY_FEE = 2500;

/** Nombre max de produits DIFFÉRENTS par commande (aligné sur firestore.rules : items.size() <= 5). */
export const MAX_CART_ITEMS = 5;

/** Quantité max par produit dans une commande (aligné sur firestore.rules : 1..99). */
export const MAX_ITEM_QUANTITY = 99;

export const DEMO_DELIVERY_CODE = "1234";

/** Code OTP fixe pour la démo (inscription ET livraison) — aucune vraie API SMS branchée. */
export const DEMO_OTP_CODE = "1234";

export const SELLER_ID = "seller-1";

export const PAYMENT_METHODS = [
  { id: "orange_money" as const, label: "Orange Money", emoji: "🟠" },
  { id: "moov_money" as const, label: "Moov Money", emoji: "🟢" },
  { id: "wave" as const, label: "Wave", emoji: "🔵" },
  { id: "card" as const, label: "Carte bancaire", emoji: "💳" },
  { id: "cash" as const, label: "Paiement à la livraison", emoji: "💵" },
];

/**
 * Anciens numéros des comptes de démonstration (la connexion rapide démo a été
 * retirée) — conservé temporairement le temps que l'UI cesse de l'importer.
 */
export const DEMO_PHONES = {
  seller: "+223 65 11 22 33",
  delivery: "+223 77 00 11 22",
  client: "+223 70 12 34 56",
  admin: "+223 90 00 00 00",
} as const;
