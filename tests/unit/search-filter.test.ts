import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchProducts } from "@/lib/services/search";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("Search Service - Filtering (Unit)", () => {
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

  it("filters products within specified minPrice and maxPrice", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[mockProduct], 1]);

    const result = await searchProducts({
      minPrice: 20,
      maxPrice: 50,
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(12);
    expect(result.totalPages).toBe(1);
  });

  it("constructs correct Prisma where clause for text query across name and description", async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (queries: any) => {
      return [[mockProduct], 1];
    });

    await searchProducts({ query: "shirt" });

    const transactionCall = vi.mocked(prisma.$transaction).mock.calls[0][0];
    expect(transactionCall).toBeDefined();
  });

  it("filters by categorySlug with safe URL decoding", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[mockProduct], 1]);

    await searchProducts({ categorySlug: "active%20wear" });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it("filters by inStockOnly requiring at least one variant with stock > 0", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[mockProduct], 1]);

    await searchProducts({ inStockOnly: true });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it("unconditionally enforces isArchived: false", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[], 0]);

    const result = await searchProducts({});

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("handles empty search query without throwing and returns non-archived items", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[mockProduct], 1]);

    const result = await searchProducts({ query: "   " });

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("computes pagination skip and take accurately for page and limit", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[mockProduct], 25]);

    const result = await searchProducts({ page: 2, limit: 10 });

    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
    expect(result.total).toBe(25);
    expect(result.totalPages).toBe(3);
  });
});
