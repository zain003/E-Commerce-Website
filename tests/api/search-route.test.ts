import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as searchRoute } from "@/app/api/search/route";
import * as searchService from "@/lib/services/search";
import { NextRequest } from "next/server";
import { Decimal } from "@prisma/client/runtime/library";

vi.mock("@/lib/services/search", () => ({
  searchProducts: vi.fn(),
}));

describe("GET /api/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProduct = {
    id: "prod_1",
    name: "Classic Cotton T-Shirt",
    slug: "classic-cotton-t-shirt",
    description: "Breathable everyday shirt made from organic cotton",
    basePrice: new Decimal("29.99"),
    categoryId: "cat_apparel",
    images: ["/shirt.jpg"],
    featured: true,
    isArchived: false,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    category: {
      id: "cat_apparel",
      name: "Apparel",
      slug: "apparel",
      description: null,
      imageUrl: null,
      createdAt: new Date("2026-01-01"),
    },
  };

  const mockSearchResult = {
    items: [mockProduct],
    total: 1,
    page: 1,
    limit: 12,
    totalPages: 1,
  };

  it("returns 200 with paginated results envelope for valid search query", async () => {
    vi.mocked(searchService.searchProducts).mockResolvedValue(mockSearchResult as any);

    const req = new NextRequest("http://localhost:3000/api/search?q=shirt");
    const res = await searchRoute(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.items).toHaveLength(1);
    expect(json.data.total).toBe(1);
    expect(json.data.page).toBe(1);
    expect(json.data.limit).toBe(12);
    expect(json.data.totalPages).toBe(1);
    expect(json.timestamp).toBeDefined();

    expect(searchService.searchProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        query: "shirt",
        page: 1,
        limit: 12,
      })
    );
  });

  it("handles multi-criteria filtering: category, minPrice, maxPrice, inStock, sort", async () => {
    vi.mocked(searchService.searchProducts).mockResolvedValue(mockSearchResult as any);

    const req = new NextRequest(
      "http://localhost:3000/api/search?category=apparel&minPrice=20&maxPrice=50&inStock=true&sort=price_asc&page=2&limit=24"
    );
    const res = await searchRoute(req);

    expect(res.status).toBe(200);
    expect(searchService.searchProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        categorySlug: "apparel",
        minPrice: 20,
        maxPrice: 50,
        inStockOnly: true,
        sortBy: "price_asc",
        page: 2,
        limit: 24,
      })
    );
  });

  it("falls back safely to page=1 and limit=12 when given invalid or negative numbers", async () => {
    vi.mocked(searchService.searchProducts).mockResolvedValue(mockSearchResult as any);

    const req = new NextRequest("http://localhost:3000/api/search?page=-3&limit=abc");
    const res = await searchRoute(req);

    expect(res.status).toBe(200);
    expect(searchService.searchProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 12,
      })
    );
  });

  it("returns 400 VALIDATION_ERROR when maxPrice is strictly less than minPrice", async () => {
    const req = new NextRequest("http://localhost:3000/api/search?minPrice=50&maxPrice=20");
    const res = await searchRoute(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
    expect(json.error.message).toContain("Invalid search parameters");
    expect(json.error.details).toBeDefined();
    expect(searchService.searchProducts).not.toHaveBeenCalled();
  });

  it("returns empty results gracefully when search query matches no products", async () => {
    vi.mocked(searchService.searchProducts).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
    } as any);

    const req = new NextRequest("http://localhost:3000/api/search?q=nonexistent12345");
    const res = await searchRoute(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.items).toEqual([]);
    expect(json.data.total).toBe(0);
    expect(json.data.totalPages).toBe(0);
  });

  it("returns 500 INTERNAL_SERVER_ERROR when searchService throws unexpected error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(searchService.searchProducts).mockRejectedValue(new Error("Database connection lost"));

    const req = new NextRequest("http://localhost:3000/api/search?q=shirt");
    const res = await searchRoute(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INTERNAL_SERVER_ERROR");
    expect(json.error.message).toContain("An error occurred");
  });
});
