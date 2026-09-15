import { Product } from "../types";
import { getProductById } from "../store/productStore";

export function findProduct(id: number): Product | undefined {
  return getProductById(id);
}

export { getProductById };
