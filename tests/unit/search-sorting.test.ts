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

describe("Search Service - Sorting (Unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProduct = {
    id: "prod_1",
    name: "Classic Cotton T-Shirt",
    slug: "classic-cotton-t-shirt",
    description: "Breathable everyday shirt",
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

  it("sorts by price_asc ordering by basePrice ascending", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[mockProduct], 1]);

    const result = await searchProducts({ sortBy: "price_asc" });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(result.items).toHaveLength(1);
  });

  it("sorts by price_desc ordering by basePrice descending", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[mockProduct], 1]);

    const result = await searchProducts({ sortBy: "price_desc" });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(result.items).toHaveLength(1);
  });

  it("sorts by newest ordering by createdAt descending", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[mockProduct], 1]);

    const result = await searchProducts({ sortBy: "newest" });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(result.items).toHaveLength(1);
  });

  it("sorts by featured ordering by featured desc then createdAt desc", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[mockProduct], 1]);

    const result = await searchProducts({ sortBy: "featured" });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(result.items).toHaveLength(1);
  });

  it("uses newest as default sorting order when sortBy is not specified", async () => {
    vi.mocked(prisma.$transaction).mockResolvedValue([[mockProduct], 1]);

    const result = await searchProducts({});

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(result.items).toHaveLength(1);
  });
});
