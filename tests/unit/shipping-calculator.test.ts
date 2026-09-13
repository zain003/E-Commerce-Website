import { describe, it, expect } from "vitest";
import {
  calculateShippingFee,
  getAvailableShippingMethods,
  STANDARD_SHIPPING_FEE,
  EXPRESS_SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
} from "@/lib/services/checkout";

describe("Shipping Calculator Service (Unit)", () => {
  describe("calculateShippingFee", () => {
    it("returns $0.00 (free) for Standard shipping when subtotal is exactly $100.00", () => {
      const fee = calculateShippingFee(100.0, "STANDARD");
      expect(fee).toBe(0.0);
    });

    it("returns $0.00 (free) for Standard shipping when subtotal is greater than $100.00", () => {
      const fee = calculateShippingFee(150.5, "STANDARD");
      expect(fee).toBe(0.0);
    });

    it("returns $5.00 for Standard shipping when subtotal is $99.99 (below $100 threshold)", () => {
      const fee = calculateShippingFee(99.99, "STANDARD");
      expect(fee).toBe(STANDARD_SHIPPING_FEE);
      expect(fee).toBe(5.0);
    });

    it("returns $5.00 for Standard shipping when subtotal is $0.00", () => {
      const fee = calculateShippingFee(0.0, "STANDARD");
      expect(fee).toBe(STANDARD_SHIPPING_FEE);
      expect(fee).toBe(5.0);
    });

    it("defaults to Standard shipping fee ($5.00) when method is omitted and subtotal < $100", () => {
      const fee = calculateShippingFee(49.99);
      expect(fee).toBe(5.0);
    });

    it("defaults to Standard shipping fee ($0.00) when method is omitted and subtotal >= $100", () => {
      const fee = calculateShippingFee(120.0);
      expect(fee).toBe(0.0);
    });

    it("returns exactly $15.00 for Express shipping regardless of subtotal", () => {
      expect(calculateShippingFee(50.0, "EXPRESS")).toBe(EXPRESS_SHIPPING_FEE);
      expect(calculateShippingFee(50.0, "EXPRESS")).toBe(15.0);

      expect(calculateShippingFee(100.0, "EXPRESS")).toBe(15.0);
      expect(calculateShippingFee(250.0, "EXPRESS")).toBe(15.0);
      expect(calculateShippingFee(0.0, "EXPRESS")).toBe(15.0);
    });
  });

  describe("getAvailableShippingMethods", () => {
    it("returns STANDARD and EXPRESS with live computed rates when subtotal < $100", () => {
      const methods = getAvailableShippingMethods(80.0);
      expect(methods).toHaveLength(2);

      const standard = methods.find((m) => m.id === "STANDARD");
      const express = methods.find((m) => m.id === "EXPRESS");

      expect(standard).toBeDefined();
      expect(standard?.price).toBe(5.0);
      expect(standard?.name).toContain("Standard");
      expect(standard?.estimatedDays).toBeDefined();

      expect(express).toBeDefined();
      expect(express?.price).toBe(15.0);
      expect(express?.name).toContain("Express");
      expect(express?.estimatedDays).toBeDefined();
    });

    it("returns STANDARD as $0.00 and EXPRESS as $15.00 when subtotal >= $100", () => {
      const methods = getAvailableShippingMethods(100.0);
      const standard = methods.find((m) => m.id === "STANDARD");
      const express = methods.find((m) => m.id === "EXPRESS");

      expect(standard?.price).toBe(0.0);
      expect(express?.price).toBe(15.0);
    });
  });
});
