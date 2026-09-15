import { Role } from "../types";

/**
 * Identité visuelle par rôle : même marque ML CHOP, mais chaque interface a
 * sa propre couleur dominante pour qu'on distingue immédiatement dans quel
 * espace on se trouve (client = achat/confiance, vendeur = business/gestion,
 * livreur = mobilité, admin = supervision).
 */
export type RoleTheme = {
  primary: string;
  primaryDark: string;
  light: string;
  label: string;
  emoji: string;
};

export const ROLE_THEME: Record<Exclude<Role, null>, RoleTheme> = {
  client: {
    primary: "#F28C28",
    primaryDark: "#C96A12",
    light: "#FFF3E7",
    label: "Client",
    emoji: "🛒",
  },
  seller: {
    primary: "#4F46E5",
    primaryDark: "#3730A3",
    light: "#EEF2FF",
    label: "Vendeur",
    emoji: "🏪",
  },
  delivery: {
    primary: "#16A34A",
    primaryDark: "#0F7A38",
    light: "#E8F8EE",
    label: "Livreur",
    emoji: "🛵",
  },
  admin: {
    primary: "#0F172A",
    primaryDark: "#020617",
    light: "#E2E8F0",
    label: "Admin",
    emoji: "👨‍💼",
  },
};

export function getRoleTheme(role: Role): RoleTheme {
  return ROLE_THEME[role ?? "client"];
}
