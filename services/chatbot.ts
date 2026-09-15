import { Order, Product } from "../types";
import { STATUS_META } from "../constants/theme";
import { formatPrice } from "../utils/formatPrice";
import { DELIVERY_FEE } from "../constants/config";

export type ChatbotContext = {
  cartCount: number;
  activeOrder: Order | null;
  products: Product[];
};

const EMPTY_CONTEXT: ChatbotContext = {
  cartCount: 0,
  activeOrder: null,
  products: [],
};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour ☀️";
  if (hour < 18) return "Bon après-midi 👋";
  return "Bonsoir 🌙";
}

function findProductMatch(text: string, products: Product[]): Product | undefined {
  return products.find((product) =>
    text.includes(product.name.toLowerCase())
  );
}

/** Moteur de réponses "façon assistant" : contextuel (panier, commande active, catalogue), sans appel réseau. */
export function getBotResponse(
  text: string,
  context: ChatbotContext = EMPTY_CONTEXT
): string {
  const value = text.toLowerCase().trim();

  if (!value) {
    return "Je n'ai pas bien saisi 🤔 Vous pouvez me demander un produit, votre commande, le paiement ou la livraison.";
  }

  if (/(bonjour|salut|hello|coucou|bsr|bjr)/.test(value)) {
    return `${greeting()} Bienvenue sur ML CHOP ! Je peux vous aider à trouver un produit, suivre une commande ou choisir un mode de paiement.`;
  }

  if (/merci/.test(value)) {
    return "Avec plaisir 😊 Autre chose pour vous ?";
  }

  const matchedProduct = findProductMatch(value, context.products);
  if (matchedProduct) {
    return `${matchedProduct.emoji} ${matchedProduct.name} — ${formatPrice(matchedProduct.price)}${
      matchedProduct.stock !== undefined ? ` (${matchedProduct.stock} en stock)` : ""
    }. Ajoutez-le au panier avec le bouton "+" sur sa fiche.`;
  }

  if (/(suivre|où en est|statut|tracking|ma commande)/.test(value)) {
    if (context.activeOrder) {
      const meta = STATUS_META[context.activeOrder.status];
      return `Votre commande ${context.activeOrder.id} est actuellement "${meta.label}" ${meta.icon}. Ouvrez l'onglet Commandes puis "Suivre ma commande" pour la carte en direct.`;
    }
    return "Vous n'avez pas de commande en cours. Ajoutez des produits au panier puis validez pour en démarrer une 🛒";
  }

  if (/(commande|command)/.test(value)) {
    return "Vos commandes sont dans l'onglet Commandes 📦. Chaque étape (confirmée, en préparation, en livraison, livrée) déclenche une notification.";
  }

  if (/(prix|coûte|combien|tarif)/.test(value)) {
    return "Parcourez le catalogue ou dites-moi le nom d'un produit, je vous donne son prix directement 🔎";
  }

  if (/(produit|catalogue|article)/.test(value)) {
    const categories = Array.from(new Set(context.products.map((p) => p.category)));
    return `Nous avons ${context.products.length} produits, dans ${categories.length} catégories : ${categories.join(", ")}. Utilisez les filtres en haut de l'accueil.`;
  }

  if (/(livraison|livrer|livreur|gps|carte|position)/.test(value)) {
    return `Livraison à Bamako, frais fixes de ${formatPrice(
      DELIVERY_FEE
    )}. Dès qu'un livreur accepte votre commande, sa position GPS s'affiche en direct sur l'écran de suivi, avec les repères du trajet (station-service, rond-point, pharmacie).`;
  }

  if (/(paiement|payer|orange|moov|carte bancaire|cash)/.test(value)) {
    return "4 moyens de paiement : Orange Money 🟠, Moov Money 🔵, carte bancaire 💳 ou paiement à la livraison 💵. Choisissez à l'étape Caisse.";
  }

  if (/(panier|acheter|ajouter)/.test(value)) {
    return context.cartCount > 0
      ? `Vous avez ${context.cartCount} article(s) dans le panier 🛒. Direction la Caisse quand vous êtes prêt.`
      : "Votre panier est vide pour le moment. Ajoutez des produits depuis le catalogue 🛒";
  }

  if (/(code|remise|1234)/.test(value)) {
    return "Le code de remise s'affiche sur votre commande une fois créée : donnez-le au livreur à l'arrivée pour confirmer la livraison.";
  }

  if (/(annuler|problème|aide|contact|réclamation)/.test(value)) {
    return "Désolé pour le désagrément 🙏 Utilisez les boutons Appeler / Message sur l'écran de suivi, ou contactez le vendeur depuis votre commande.";
  }

  return "Je suis l'assistant ML CHOP 🤖. Demandez-moi : un produit, le panier, une commande, le paiement ou la livraison.";
}

export function getQuickReplies(context: ChatbotContext = EMPTY_CONTEXT): string[] {
  if (context.activeOrder) {
    return ["Où en est ma commande ?", "Frais de livraison ?", "Moyens de paiement"];
  }
  if (context.cartCount > 0) {
    return ["Voir mon panier", "Frais de livraison ?", "Moyens de paiement"];
  }
  return ["Voir le catalogue", "Moyens de paiement", "Livraison à Bamako"];
}
