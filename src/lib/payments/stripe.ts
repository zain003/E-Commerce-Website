import Stripe from "stripe";

const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_for_tests";

/**
 * Singleton Stripe SDK client configured with server-side secret key.
 */
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-01-27.acacia" as any,
  typescript: true,
});

/**
 * Ensures Stripe secret key is present in environment before initiating calls.
 */
export function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured in environment variables");
  }
  return stripe;
}

/**
 * Pure monetary utility to convert subtotal, shipping fee, and discount into integer cents.
 * Computes amounts strictly in integer cents to eliminate IEEE 754 floating point drift.
 */
export function calculateStripeAmount(
  subtotal: number,
  shippingFee: number,
  discountTotal: number = 0
): number {
  const subtotalCents = Math.round(subtotal * 100);
  const shippingFeeCents = Math.round(shippingFee * 100);
  const discountCents = Math.round(discountTotal * 100);

  const totalCents = subtotalCents + shippingFeeCents - discountCents;
  return Math.max(0, totalCents);
}
