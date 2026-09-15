import { OrderStatus } from "../types";

/**
 * Palette étendue pour l'interface CLIENT : chaque statut de commande et
 * chaque catégorie de produit a sa propre couleur, pour un rendu plus
 * moderne et plus lisible que le "tout orange" d'origine.
 * Les interfaces vendeur / livreur ne sont pas concernées par ce fichier.
 */

export type StatusMeta = {
  label: string;
  color: string;
  background: string;
  icon: string;
};

export const STATUS_META: Record<OrderStatus, StatusMeta> = {
  pending: {
    label: "En attente",
    color: "#B45309",
    background: "#FEF3C7",
    icon: "🕓",
  },
  confirmed: {
    label: "Confirmée",
    color: "#1D4ED8",
    background: "#DBEAFE",
    icon: "✅",
  },
  preparing: {
    label: "En préparation",
    color: "#7E22CE",
    background: "#F3E8FF",
    icon: "👨‍🍳",
  },
  shipping: {
    label: "En livraison",
    color: "#C2410C",
    background: "#FFEDD5",
    icon: "🛵",
  },
  delivered: {
    label: "Livrée",
    color: "#15803D",
    background: "#DCFCE7",
    icon: "🎉",
  },
  cancelled: {
    label: "Annulée",
    color: "#B91C1C",
    background: "#FEE2E2",
    icon: "✕",
  },
};

/** Ordre logique du parcours d'une commande, pour la timeline de suivi. */
export const STATUS_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "shipping",
  "delivered",
];

const CATEGORY_PALETTE: Record<string, string> = {
  Tout: "#6B7280",
  Alimentation: "#16A34A",
  Mode: "#DB2777",
  Téléphones: "#2563EB",
  Maison: "#D97706",
  Beauté: "#9333EA",
};

const FALLBACK_COLORS = [
  "#0EA5E9",
  "#F59E0B",
  "#10B981",
  "#8B5CF6",
  "#EF4444",
  "#14B8A6",
];

/** Couleur stable pour une catégorie : connue → palette fixe, sinon hash. */
export function getCategoryColor(category: string): string {
  if (CATEGORY_PALETTE[category]) {
    return CATEGORY_PALETTE[category];
  }

  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  }

  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}

export function getCategoryTint(category: string): string {
  return `${getCategoryColor(category)}1A`; // ~10% opacity en hex (alpha suffix)
}

export type NotificationType = "info" | "success" | "warning" | "error";

export const NOTIFICATION_META: Record<
  NotificationType,
  { color: string; background: string; icon: string }
> = {
  info: { color: "#1D4ED8", background: "#DBEAFE", icon: "ℹ️" },
  success: { color: "#15803D", background: "#DCFCE7", icon: "✅" },
  warning: { color: "#B45309", background: "#FEF3C7", icon: "⚠️" },
  error: { color: "#B91C1C", background: "#FEE2E2", icon: "🚨" },
};
