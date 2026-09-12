import { describe, it, expect } from "vitest";
import {
  toNumeric,
  getVariantUnitPrice,
  getCartItemTotal,
  calculateCartTotals,
} from "@/lib/services/cart-calculator";
import { HydratedCartItem } from "@/types";
import { Decimal } from "@prisma/client/runtime/library";

describe("Cart Calculator (Unit)", () => {
  describe("toNumeric", () => {
    it("converts number directly", () => {
      expect(toNumeric(49.99)).toBe(49.99);
    });

    it("converts Prisma Decimal object", () => {
      const dec = new Decimal("29.95");
      expect(toNumeric(dec)).toBe(29.95);
    });

    it("converts string representation", () => {
      expect(toNumeric("15.50")).toBe(15.5);
    });

    it("handles null/undefined/invalid values safely", () => {
      expect(toNumeric(null)).toBe(0);
      expect(toNumeric(undefined)).toBe(0);
      expect(toNumeric("invalid")).toBe(0);
    });
  });

  describe("getVariantUnitPrice", () => {
    it("calculates unit price with zero priceDelta", () => {
      const variant = {
        id: "var_1",
        productId: "prod_1",
        sku: "SKU-1",
        name: "Standard",
        priceDelta: new Decimal("0.00"),
        stock: 10,
        product: {
          id: "prod_1",
          name: "Classic Tee",
          slug: "classic-tee",
          description: "Comfortable shirt",
          basePrice: new Decimal("25.00"),
          categoryId: "cat_1",
          images: [],
          featured: false,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      expect(getVariantUnitPrice(variant as any)).toBe(25.0);
    });

    it("calculates unit price with positive priceDelta", () => {
      const variant = {
        id: "var_2",
        productId: "prod_1",
        sku: "SKU-2",
        name: "Large",
        priceDelta: new Decimal("5.50"),
        stock: 5,
        product: {
          id: "prod_1",
          name: "Classic Tee",
          slug: "classic-tee",
          description: "Comfortable shirt",
          basePrice: new Decimal("25.00"),
          categoryId: "cat_1",
          images: [],
          featured: false,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      expect(getVariantUnitPrice(variant as any)).toBe(30.5);
    });

    it("calculates unit price with negative priceDelta (discounted variant)", () => {
      const variant = {
        id: "var_3",
        productId: "prod_1",
        sku: "SKU-3",
        name: "Small Clearance",
        priceDelta: new Decimal("-3.00"),
        stock: 2,
        product: {
          id: "prod_1",
          name: "Classic Tee",
          slug: "classic-tee",
          description: "Comfortable shirt",
          basePrice: new Decimal("25.00"),
          categoryId: "cat_1",
          images: [],
          featured: false,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      expect(getVariantUnitPrice(variant as any)).toBe(22.0);
    });
  });

  describe("getCartItemTotal", () => {
    it("multiplies unit price by quantity", () => {
      const item: HydratedCartItem = {
        id: "item_1",
        cartId: "cart_1",
        variantId: "var_1",
        quantity: 3,
        createdAt: new Date(),
        variant: {
          id: "var_1",
          productId: "prod_1",
          sku: "SKU-1",
          name: "Medium",
          priceDelta: new Decimal("2.00") as any,
          stock: 10,
          product: {
            id: "prod_1",
            name: "Hoodie",
            slug: "hoodie",
            description: "Warm hoodie",
            basePrice: new Decimal("50.00") as any,
            categoryId: "cat_1",
            images: [],
            featured: false,
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      };

      // Unit price is 50 + 2 = 52. Quantity is 3. Total = 156.
      expect(getCartItemTotal(item)).toBe(156.0);
    });
  });

  describe("calculateCartTotals", () => {
    it("returns 0 subtotal and 0 itemCount for empty items array", () => {
      const result = calculateCartTotals([]);
      expect(result).toEqual({
        subtotal: 0,
        itemCount: 0,
      });
    });

    it("correctly aggregates subtotal and itemCount across multiple items with proper decimal rounding", () => {
      const item1: HydratedCartItem = {
        id: "item_1",
        cartId: "cart_1",
        variantId: "var_1",
        quantity: 2,
        createdAt: new Date(),
        variant: {
          id: "var_1",
          productId: "prod_1",
          sku: "SKU-1",
          name: "Black / M",
          priceDelta: new Decimal("0.00") as any,
          stock: 10,
          product: {
            id: "prod_1",
            name: "T-Shirt",
            slug: "t-shirt",
            description: "Shirt",
            basePrice: new Decimal("19.99") as any,
            categoryId: "cat_1",
            images: [],
            featured: false,
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      };

      const item2: HydratedCartItem = {
        id: "item_2",
        cartId: "cart_1",
        variantId: "var_2",
        quantity: 1,
        createdAt: new Date(),
        variant: {
          id: "var_2",
          productId: "prod_2",
          sku: "SKU-2",
          name: "Blue / L",
          priceDelta: new Decimal("5.00") as any,
          stock: 5,
          product: {
            id: "prod_2",
            name: "Jeans",
            slug: "jeans",
            description: "Pants",
            basePrice: new Decimal("59.99") as any,
            categoryId: "cat_1",
            images: [],
            featured: false,
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      };

      // Item 1: 19.99 * 2 = 39.98
      // Item 2: (59.99 + 5.00) * 1 = 64.99
      // Subtotal = 39.98 + 64.99 = 104.97
      // ItemCount = 2 + 1 = 3
      const result = calculateCartTotals([item1, item2]);
      expect(result.subtotal).toBe(104.97);
      expect(result.itemCount).toBe(3);
    });
  });
});
