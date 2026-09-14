import { describe, it, expect } from "vitest";
import { calculateDiscount } from "@/lib/services/coupons";

describe("Coupon Discount Calculator (Unit)", () => {
  describe("PERCENTAGE Discounts", () => {
    it("calculates 10% discount on $100 subtotal accurately", () => {
      const result = calculateDiscount(100, "PERCENTAGE", 10);
      expect(result.discountAmount).toBe(10.0);
      expect(result.newTotal).toBe(90.0);
    });

    it("calculates 25% discount on $80 subtotal accurately", () => {
      const result = calculateDiscount(80, "PERCENTAGE", 25);
      expect(result.discountAmount).toBe(20.0);
      expect(result.newTotal).toBe(60.0);
    });

    it("rounds percentage discount amount to 2 decimal places", () => {
      // 15% of $33.33 = 4.9995 -> 5.00
      const result = calculateDiscount(33.33, "PERCENTAGE", 15);
      expect(result.discountAmount).toBe(5.0);
      expect(result.newTotal).toBe(28.33);
    });

    it("caps 100% discount at subtotal with newTotal 0", () => {
      const result = calculateDiscount(50, "PERCENTAGE", 100);
      expect(result.discountAmount).toBe(50.0);
      expect(result.newTotal).toBe(0);
    });

    it("caps discount amount if percentage exceeds 100%", () => {
      const result = calculateDiscount(50, "PERCENTAGE", 150);
      expect(result.discountAmount).toBe(50.0);
      expect(result.newTotal).toBe(0);
    });
  });

  describe("FIXED_AMOUNT Discounts", () => {
    it("deducts fixed $15.00 from $60.00 subtotal", () => {
      const result = calculateDiscount(60, "FIXED_AMOUNT", 15);
      expect(result.discountAmount).toBe(15.0);
      expect(result.newTotal).toBe(45.0);
    });

    it("clamps fixed discount at subtotal when discount exceeds subtotal (preventing negative totals)", () => {
      const result = calculateDiscount(20, "FIXED_AMOUNT", 50);
      expect(result.discountAmount).toBe(20.0);
      expect(result.newTotal).toBe(0);
    });

    it("handles zero subtotal gracefully", () => {
      const result = calculateDiscount(0, "FIXED_AMOUNT", 10);
      expect(result.discountAmount).toBe(0);
      expect(result.newTotal).toBe(0);
    });
  });
});
