import { HydratedCartItem, Product, ProductVariant } from "@/types";

/**
 * Safely converts Decimal, string, or number values to a JavaScript float.
 */
export function toNumeric(value: unknown): number {
  if (typeof value === "number") return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toNumber" in value &&
    typeof (value as { toNumber: () => number }).toNumber === "function"
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }
  const parsed = parseFloat(String(value ?? 0));
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calculates the unit price for a variant by combining product base price and variant price delta.
 */
export function getVariantUnitPrice(
  variant: ProductVariant & { product: Product }
): number {
  const base = toNumeric(variant.product.basePrice);
  const delta = toNumeric(variant.priceDelta);
  return Math.round((base + delta) * 100) / 100;
}

/**
 * Calculates the line total for a single hydrated cart item (unit price * quantity).
 */
export function getCartItemTotal(item: HydratedCartItem): number {
  const unitPrice = getVariantUnitPrice(item.variant);
  return Math.round(unitPrice * item.quantity * 100) / 100;
}

/**
 * Computes subtotal and total item count for a list of hydrated cart items.
 */
export function calculateCartTotals(items: HydratedCartItem[]): {
  subtotal: number;
  itemCount: number;
} {
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const rawSubtotal = items.reduce((acc, item) => acc + getCartItemTotal(item), 0);
  const subtotal = Math.round(rawSubtotal * 100) / 100;

  return {
    subtotal,
    itemCount,
  };
}
