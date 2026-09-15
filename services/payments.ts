import { Order, PaymentMethod, PaymentStatus } from "../types";

export type PaymentResult = {
  status: PaymentStatus;
  reference: string;
  method: PaymentMethod;
  amount: number;
  orderId: string;
  /** Toujours true tant qu'aucune vraie API Orange/Moov/Wave/carte n'est branchée. */
  simulated: true;
};

/**
 * Simulation de paiement — clairement identifiée comme telle (`simulated: true`).
 * Le paiement est toujours rattaché à une commande déjà créée (orderId réel),
 * jamais à un identifiant provisoire. À remplacer par un vrai appel API
 * (Orange Money / Moov Money / Wave / passerelle carte) : la signature de
 * cette fonction (orderId, method, amount) → PaymentResult peut rester la
 * même, seule l'implémentation change.
 */
export async function processPayment(
  orderId: string,
  method: PaymentMethod,
  amount: number
): Promise<PaymentResult> {
  // Le paiement à la livraison n'a rien à autoriser maintenant : il est
  // "payé" symboliquement, l'argent change de main au moment de la remise.
  // Seul un montant invalide fait échouer la simulation (garde-fou réel, pas
  // un tirage au sort) — une vraie API pourra refuser pour bien d'autres
  // raisons (solde, réseau...) sans changer cette signature.
  const status: PaymentStatus = amount > 0 ? "paid" : "failed";

  return {
    status,
    reference: `SIM-${method.toUpperCase()}-${Date.now()}`,
    method,
    amount,
    orderId,
    simulated: true,
  };
}

export function paymentStatusLabel(status: PaymentStatus | undefined): string {
  switch (status) {
    case "paid":
      return "Payé";
    case "failed":
      return "Échec du paiement";
    default:
      return "En attente";
  }
}

export type { Order };
