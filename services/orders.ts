import { CartItem, Order } from "../types";
import { createOrder, updateOrderStatus } from "../store/orderStore";
import { DELIVERY_FEE, MAX_CART_ITEMS, MAX_ITEM_QUANTITY } from "../constants/config";

/**
 * Ligne de commande telle qu'attendue par firestore.rules : `id`, `price`
 * (entier, égal au prix du doc produit) et `quantity` (entier 1..99) sont
 * obligatoires ; le reste est dénormalisé pour l'affichage.
 */
function toOrderItem(item: CartItem): CartItem {
  return {
    id: item.id,
    name: item.name,
    price: Math.round(item.price),
    quantity: Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.round(item.quantity))),
    category: item.category,
    emoji: item.emoji,
    sellerId: item.sellerId,
    sellerName: item.sellerName,
  };
}

function placeOrderErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | null)?.code ?? "";
  switch (code) {
    case "permission-denied":
      return "Commande refusée : le panier n'est plus à jour (prix ou quantités). Rechargez-le et réessayez.";
    case "unavailable":
    case "deadline-exceeded":
      return "Pas de connexion — la commande n'a pas été enregistrée. Réessayez.";
    default:
      return "La commande n'a pas pu être enregistrée. Réessayez dans un instant.";
  }
}

/**
 * Crée la commande dans Firestore et la renvoie une fois l'écriture confirmée.
 * Le total est TOUJOURS recalculé ici (sous-total entier + DELIVERY_FEE) pour
 * coller aux règles serveur ; `subtotal` n'est gardé que pour compatibilité.
 * Rejette avec un Error au message français (rien n'est laissé en local).
 */
export async function placeOrder(input: {
  items: CartItem[];
  subtotal: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethod: Order["paymentMethod"];
}): Promise<Order> {
  if (input.items.length === 0) {
    throw new Error("Votre panier est vide.");
  }
  if (input.items.length > MAX_CART_ITEMS) {
    throw new Error(`Maximum ${MAX_CART_ITEMS} produits différents par commande.`);
  }

  const items = input.items.map(toOrderItem);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  try {
    return await createOrder({
      items,
      total: subtotal + DELIVERY_FEE,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      deliveryAddress: input.deliveryAddress,
      paymentMethod: input.paymentMethod,
      deliveryFee: DELIVERY_FEE,
    });
  } catch (error) {
    throw new Error(placeOrderErrorMessage(error));
  }
}

export function setOrderStatus(
  id: string,
  status: Order["status"]
) {
  updateOrderStatus(id, status);
}
