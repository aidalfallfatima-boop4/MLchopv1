export const APP_NAME = "ML CHOP";

export const DELIVERY_FEE = 2500;

export const DEMO_DELIVERY_CODE = "1234";

/** Code OTP fixe pour la démo (inscription ET livraison) — aucune vraie API SMS branchée. */
export const DEMO_OTP_CODE = "1234";

/**
 * Mot de passe Firebase Auth partagé des 4 comptes de démo. Ces comptes sont
 * auto-créés (self-healing) au premier tap sur "Connexion rapide (démo)" —
 * voir loginDemo() dans store/authStore.ts — donc rien à faire côté Firebase
 * Console avant de tester.
 */
export const DEMO_PASSWORD = "MLChopDemo2026!";

export const SELLER_ID = "seller-1";

export const PAYMENT_METHODS = [
  { id: "orange_money" as const, label: "Orange Money", emoji: "🟠" },
  { id: "moov_money" as const, label: "Moov Money", emoji: "🟢" },
  { id: "wave" as const, label: "Wave", emoji: "🔵" },
  { id: "card" as const, label: "Carte bancaire", emoji: "💳" },
  { id: "cash" as const, label: "Paiement à la livraison", emoji: "💵" },
];

/**
 * Comptes de démonstration — connexion immédiate depuis l'écran de connexion,
 * sans passer par inscription/OTP. Mots de passe non requis pour ces numéros.
 */
export const DEMO_PHONES = {
  seller: "+223 65 11 22 33",
  delivery: "+223 77 00 11 22",
  client: "+223 70 12 34 56",
  admin: "+223 90 00 00 00",
} as const;
