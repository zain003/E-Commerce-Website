import { describe, it, expect } from "vitest";
import { parseSearchParams, searchQuerySchema } from "@/lib/validators/search";

describe("Search Validator (Unit)", () => {
  it("parses valid search parameters correctly", () => {
    const raw = {
      q: "  hoodie  ",
      category: "apparel",
      minPrice: "25.50",
      maxPrice: "99.99",
      inStock: "true",
      sort: "price_asc",
      page: "2",
      limit: "24",
    };

    const parsed = parseSearchParams(raw);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.query).toBe("hoodie");
      expect(parsed.data.categorySlug).toBe("apparel");
      expect(parsed.data.minPrice).toBe(25.5);
      expect(parsed.data.maxPrice).toBe(99.99);
      expect(parsed.data.inStockOnly).toBe(true);
      expect(parsed.data.sortBy).toBe("price_asc");
      expect(parsed.data.page).toBe(2);
      expect(parsed.data.limit).toBe(24);
    }
  });

  it("handles URLSearchParams instance cleanly", () => {
    const searchParams = new URLSearchParams(
      "q=sneakers&category=footwear&minPrice=50&sort=featured"
    );

    const parsed = parseSearchParams(searchParams);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.query).toBe("sneakers");
      expect(parsed.data.categorySlug).toBe("footwear");
      expect(parsed.data.minPrice).toBe(50);
      expect(parsed.data.sortBy).toBe("featured");
      expect(parsed.data.page).toBe(1);
      expect(parsed.data.limit).toBe(12);
    }
  });

  it("falls back safely to page=1 and limit=12 for invalid or negative numbers", () => {
    const raw = {
      page: "-5",
      limit: "-20",
    };

    const parsed = parseSearchParams(raw);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.page).toBe(1);
      expect(parsed.data.limit).toBe(12);
    }
  });

  it("falls back safely to page=1 and limit=12 for non-numeric strings", () => {
    const raw = {
      page: "abc",
      limit: "xyz",
    };

    const parsed = parseSearchParams(raw);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.page).toBe(1);
      expect(parsed.data.limit).toBe(12);
    }
  });

  it("rejects with validation error when maxPrice is strictly less than minPrice", () => {
    const raw = {
      minPrice: "100",
      maxPrice: "50",
    };

    const parsed = parseSearchParams(raw);

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toContain("maxPrice");
    }
  });

  it("allows minPrice equal to maxPrice", () => {
    const raw = {
      minPrice: "50",
      maxPrice: "50",
    };

    const parsed = parseSearchParams(raw);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.minPrice).toBe(50);
      expect(parsed.data.maxPrice).toBe(50);
    }
  });

  it("sanitizes empty string query to undefined", () => {
    const raw = {
      q: "   ",
    };

    const parsed = parseSearchParams(raw);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.query).toBeUndefined();
    }
  });

  it("parses boolean inStock variations accurately", () => {
    const res1 = parseSearchParams({ inStock: "1" });
    const res2 = parseSearchParams({ inStock: "true" });
    const res3 = parseSearchParams({ inStock: "0" });
    const res4 = parseSearchParams({ inStock: "false" });

    expect(res1.success).toBe(true);
    expect(res2.success).toBe(true);
    expect(res3.success).toBe(true);
    expect(res4.success).toBe(true);

    if (res1.success && res2.success && res3.success && res4.success) {
      expect(res1.data.inStockOnly).toBe(true);
      expect(res2.data.inStockOnly).toBe(true);
      expect(res3.data.inStockOnly).toBe(false);
      expect(res4.data.inStockOnly).toBe(false);
    }
  });
});
