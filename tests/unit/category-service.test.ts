import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCategories } from "@/lib/services/products";
import { prisma } from "@/lib/prisma";

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    category: {
      findMany: vi.fn(),
    },
  },
}));

describe("Category Service (Unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCategories", () => {
    it("returns categories list ordered by name ascending", async () => {
      const mockCategories = [
        {
          id: "cat_1",
          name: "Accessories",
          slug: "accessories",
          description: "Belts, hats, and bags",
          imageUrl: "/images/accessories.jpg",
          createdAt: new Date("2026-01-01"),
        },
        {
          id: "cat_2",
          name: "Footwear",
          slug: "footwear",
          description: "Shoes and boots",
          imageUrl: "/images/footwear.jpg",
          createdAt: new Date("2026-01-02"),
        },
      ];

      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories);

      const result = await getCategories();

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { name: "asc" },
      });
      expect(result).toEqual(mockCategories);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Accessories");
    });

    it("returns empty array when no categories are present", async () => {
      vi.mocked(prisma.category.findMany).mockResolvedValue([]);

      const result = await getCategories();

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { name: "asc" },
      });
      expect(result).toEqual([]);
    });
  });
});
