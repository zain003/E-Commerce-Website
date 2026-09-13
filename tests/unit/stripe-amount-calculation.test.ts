import { describe, it, expect } from "vitest";
import { calculateStripeAmount } from "@/lib/payments/stripe";

describe("Stripe Amount Calculation (Unit)", () => {
  it("converts simple dollar amounts accurately to integer cents", () => {
    // $49.99 subtotal + $5.00 shipping = $54.99 -> 5499 cents
    const amount = calculateStripeAmount(49.99, 5.0);
    expect(amount).toBe(5499);
    expect(Number.isInteger(amount)).toBe(true);
  });

  it("applies free shipping ($0.00) without modifying subtotal in cents", () => {
    // $100.00 subtotal + $0.00 shipping = $100.00 -> 10000 cents
    const amount = calculateStripeAmount(100.0, 0.0);
    expect(amount).toBe(10000);
    expect(Number.isInteger(amount)).toBe(true);
  });

  it("calculates express shipping accurately", () => {
    // $19.99 subtotal + $15.00 shipping = $34.99 -> 3499 cents
    const amount = calculateStripeAmount(19.99, 15.0);
    expect(amount).toBe(3499);
    expect(Number.isInteger(amount)).toBe(true);
  });

  it("handles notorious IEEE 754 floating point imprecision without drift", () => {
    // In JavaScript, 0.1 + 0.2 = 0.30000000000000004
    // $0.10 subtotal + $0.20 shipping = $0.30 -> exactly 30 cents
    const amount = calculateStripeAmount(0.1, 0.2);
    expect(amount).toBe(30);
    expect(Number.isInteger(amount)).toBe(true);

    // Another classic float issue: 19.99 * 100 = 1998.9999999999998
    const singleAmount = calculateStripeAmount(19.99, 0);
    expect(singleAmount).toBe(1999);
    expect(Number.isInteger(singleAmount)).toBe(true);
  });

  it("accurately handles discounts without floating point error", () => {
    // $50.00 subtotal + $5.00 shipping - $10.00 discount = $45.00 -> 4500 cents
    const amount = calculateStripeAmount(50.0, 5.0, 10.0);
    expect(amount).toBe(4500);
    expect(Number.isInteger(amount)).toBe(true);

    // $29.99 subtotal + $5.00 shipping - $5.50 discount = $29.49 -> 2949 cents
    const discounted = calculateStripeAmount(29.99, 5.0, 5.5);
    expect(discounted).toBe(2949);
    expect(Number.isInteger(discounted)).toBe(true);
  });

  it("handles complex decimal sums like $14.99 + $29.95 + $5.00", () => {
    const subtotal = 14.99 + 29.95; // 44.94
    const amount = calculateStripeAmount(subtotal, 5.0);
    expect(amount).toBe(4994);
    expect(Number.isInteger(amount)).toBe(true);
  });

  it("safely clamps negative amounts to 0", () => {
    // If discount exceeds total
    const amount = calculateStripeAmount(10.0, 5.0, 25.0);
    expect(amount).toBe(0);
    expect(Number.isInteger(amount)).toBe(true);
  });
});
