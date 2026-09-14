import { describe, it, expect } from "vitest";
import { serializeData } from "@/lib/utils";
import { Decimal } from "@prisma/client/runtime/library";

describe("serializeData Utility (Unit)", () => {
  it("returns null or undefined as-is", () => {
    expect(serializeData(null)).toBeNull();
    expect(serializeData(undefined)).toBeUndefined();
  });

  it("returns primitive values unchanged", () => {
    expect(serializeData(42)).toBe(42);
    expect(serializeData("string")).toBe("string");
    expect(serializeData(true)).toBe(true);
    expect(serializeData(false)).toBe(false);
  });

  it("converts Prisma Decimal instances to standard JavaScript numbers", () => {
    const decimal = new Decimal("49.99");
    const result = serializeData(decimal);

    expect(typeof result).toBe("number");
    expect(result).toBe(49.99);
  });

  it("preserves JavaScript Date instances", () => {
    const now = new Date();
    const result = serializeData(now);

    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(now.getTime());
  });

  it("recursively converts array elements", () => {
    const arr = [new Decimal("10.50"), new Decimal("20.25"), "text", 123];
    const result = serializeData(arr);

    expect(result).toEqual([10.5, 20.25, "text", 123]);
    expect(typeof result[0]).toBe("number");
    expect(typeof result[1]).toBe("number");
  });

  it("recursively converts nested objects containing Decimals into plain objects", () => {
    const product = {
      id: "prod_1",
      name: "Classic Tee",
      basePrice: new Decimal("29.99"),
      createdAt: new Date("2026-01-01"),
      category: {
        id: "cat_1",
        name: "Apparel",
      },
      variants: [
        {
          id: "var_1",
          sku: "TEE-BLK-M",
          priceDelta: new Decimal("0.00"),
          stock: 50,
        },
        {
          id: "var_2",
          sku: "TEE-BLK-L",
          priceDelta: new Decimal("4.50"),
          stock: 20,
        },
      ],
    };

    const result = serializeData(product);

    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(typeof result.basePrice).toBe("number");
    expect(result.basePrice).toBe(29.99);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.variants[0].priceDelta).toBe(0);
    expect(result.variants[1].priceDelta).toBe(4.5);
    expect(typeof result.variants[1].priceDelta).toBe("number");
  });
});
