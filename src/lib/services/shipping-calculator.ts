import { ShippingMethod } from "@/types";

export const STANDARD_SHIPPING_FEE = 5.0;
export const EXPRESS_SHIPPING_FEE = 15.0;
export const FREE_SHIPPING_THRESHOLD = 100.0;

/**
 * Computes the shipping fee based on cart subtotal and selected method.
 * Standard shipping is free ($0.00) when subtotal reaches or exceeds $100.00.
 */
export function calculateShippingFee(
  subtotal: number,
  methodId: "STANDARD" | "EXPRESS" = "STANDARD"
): number {
  if (methodId === "EXPRESS") {
    return EXPRESS_SHIPPING_FEE;
  }
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0.0 : STANDARD_SHIPPING_FEE;
}

/**
 * Returns the list of available shipping tiers with dynamic pricing based on subtotal.
 */
export function getAvailableShippingMethods(subtotal: number): ShippingMethod[] {
  return [
    {
      id: "STANDARD",
      name: "Standard Delivery",
      price: subtotal >= FREE_SHIPPING_THRESHOLD ? 0.0 : STANDARD_SHIPPING_FEE,
      estimatedDays: "3-5 Business Days",
    },
    {
      id: "EXPRESS",
      name: "Express Delivery",
      price: EXPRESS_SHIPPING_FEE,
      estimatedDays: "1-2 Business Days",
    },
  ];
}
