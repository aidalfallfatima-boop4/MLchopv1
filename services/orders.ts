import { CartItem, Order } from "../types";
import { createOrder, updateOrderStatus } from "../store/orderStore";
import { DELIVERY_FEE } from "../constants/config";

export function placeOrder(input: {
  items: CartItem[];
  subtotal: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethod: Order["paymentMethod"];
}) {
  return createOrder({
    items: input.items,
    total: input.subtotal + DELIVERY_FEE,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    deliveryAddress: input.deliveryAddress,
    paymentMethod: input.paymentMethod,
    deliveryFee: DELIVERY_FEE,
  });
}

export function setOrderStatus(
  id: string,
  status: Order["status"]
) {
  updateOrderStatus(id, status);
}
