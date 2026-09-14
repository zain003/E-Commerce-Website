import type { DiscountType } from "@/types";

/**
 * Pure calculation helper to compute discount deduction and new cart total.
 * Free of server/database imports so it is completely safe for client-side bundle usage.
 */
export function calculateDiscount(
  cartSubtotal: number,
  discountType: DiscountType,
  discountValue: number
): { discountAmount: number; newTotal: number } {
  if (cartSubtotal <= 0) {
    return { discountAmount: 0, newTotal: 0 };
  }

  let rawDiscount = 0;

  if (discountType === "PERCENTAGE") {
    rawDiscount = (cartSubtotal * discountValue) / 100;
  } else {
    rawDiscount = discountValue;
  }

  // Discount cannot exceed subtotal and cannot be negative
  const clampedDiscount = Math.min(cartSubtotal, Math.max(0, rawDiscount));
  const discountAmount = Math.round(clampedDiscount * 100) / 100;
  const newTotal = Math.round(Math.max(0, cartSubtotal - discountAmount) * 100) / 100;

  return { discountAmount, newTotal };
}
