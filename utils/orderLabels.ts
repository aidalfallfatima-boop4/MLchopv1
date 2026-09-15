import { Order } from "../types";

const PAYMENT_LABEL: Record<Order["paymentMethod"], string> = {
  orange_money: "Orange Money",
  moov_money: "Moov Money",
  wave: "Wave",
  card: "Carte bancaire",
  cash: "À la livraison",
};

export function paymentLabel(method: Order["paymentMethod"]): string {
  return PAYMENT_LABEL[method];
}

export const AVAILABLE_DELIVERY_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "shipping",
] as const;
