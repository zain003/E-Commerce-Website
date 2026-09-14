import { describe, it, expect, vi, beforeEach } from "vitest";
import { getWishlist, toggleWishlistItem } from "@/lib/services/wishlist";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    wishlistItem: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
    },
  },
}));

describe("Wishlist Service (Unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getWishlist", () => {
    it("returns wishlist items enriched with product and calculated inStock status (true when stock > 0)", async () => {
      const mockItems = [
        {
          id: "wish_1",
          userId: "usr_1",
          productId: "prod_1",
          createdAt: new Date("2026-03-01T10:00:00Z"),
          product: {
            id: "prod_1",
            name: "Classic Silk Shirt",
            slug: "classic-silk-shirt",
            description: "High quality silk",
            basePrice: 120.0,
            images: ["/silk.jpg"],
            isArchived: false,
            variants: [
              { id: "var_1", name: "S", stock: 5, priceDelta: 0 },
              { id: "var_2", name: "M", stock: 0, priceDelta: 0 },
            ],
          },
        },
        {
          id: "wish_2",
          userId: "usr_1",
          productId: "prod_2",
          createdAt: new Date("2026-03-02T10:00:00Z"),
          product: {
            id: "prod_2",
            name: "Sold Out Cap",
            slug: "sold-out-cap",
            description: "Limited edition cap",
            basePrice: 45.0,
            images: ["/cap.jpg"],
            isArchived: false,
            variants: [
              { id: "var_3", name: "One Size", stock: 0, priceDelta: 0 },
            ],
          },
        },
      ];

      vi.mocked(prisma.wishlistItem.findMany).mockResolvedValue(mockItems as any);

      const result = await getWishlist("usr_1");

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data![0].product.inStock).toBe(true);
      expect(result.data![1].product.inStock).toBe(false);
      expect(result.data![0].product.name).toBe("Classic Silk Shirt");
      expect(prisma.wishlistItem.findMany).toHaveBeenCalledWith({
        where: { userId: "usr_1" },
        include: {
          product: {
            include: {
              variants: true,
              category: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    });

    it("marks product as out of stock (inStock: false) if product is archived even with variant stock", async () => {
      const mockItems = [
        {
          id: "wish_archived",
          userId: "usr_1",
          productId: "prod_archived",
          createdAt: new Date(),
          product: {
            id: "prod_archived",
            name: "Archived Item",
            slug: "archived-item",
            description: "Discontinued",
            basePrice: 50.0,
            images: [],
            isArchived: true,
            variants: [{ id: "var_arch", name: "Default", stock: 10, priceDelta: 0 }],
          },
        },
      ];

      vi.mocked(prisma.wishlistItem.findMany).mockResolvedValue(mockItems as any);

      const result = await getWishlist("usr_1");
      expect(result.success).toBe(true);
      expect(result.data![0].product.inStock).toBe(false);
    });

    it("returns empty array when user has no wishlist items", async () => {
      vi.mocked(prisma.wishlistItem.findMany).mockResolvedValue([]);

      const result = await getWishlist("usr_empty");

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("handles database exceptions gracefully and returns INTERNAL_SERVER_ERROR", async () => {
      vi.mocked(prisma.wishlistItem.findMany).mockRejectedValue(new Error("Database offline"));

      const result = await getWishlist("usr_1");

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INTERNAL_SERVER_ERROR");
    });
  });

  describe("toggleWishlistItem", () => {
    it("returns NOT_FOUND if product does not exist", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);

      const result = await toggleWishlistItem("nonexistent_prod", "usr_1");

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("NOT_FOUND");
    });

    it("creates wishlist item if not already present", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue({ id: "prod_1" } as any);
      vi.mocked(prisma.wishlistItem.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.wishlistItem.create).mockResolvedValue({
        id: "wish_new",
        userId: "usr_1",
        productId: "prod_1",
        createdAt: new Date(),
      } as any);

      const result = await toggleWishlistItem("prod_1", "usr_1");

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        isWishlisted: true,
        productId: "prod_1",
      });
      expect(prisma.wishlistItem.create).toHaveBeenCalledWith({
        data: {
          userId: "usr_1",
          productId: "prod_1",
        },
      });
    });

    it("deletes wishlist item if already present", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue({ id: "prod_1" } as any);
      vi.mocked(prisma.wishlistItem.findUnique).mockResolvedValue({
        id: "wish_existing",
        userId: "usr_1",
        productId: "prod_1",
        createdAt: new Date(),
      } as any);
      vi.mocked(prisma.wishlistItem.delete).mockResolvedValue({
        id: "wish_existing",
      } as any);

      const result = await toggleWishlistItem("prod_1", "usr_1");

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        isWishlisted: false,
        productId: "prod_1",
      });
      expect(prisma.wishlistItem.delete).toHaveBeenCalledWith({
        where: {
          id: "wish_existing",
        },
      });
    });

    it("handles database exceptions during toggle gracefully", async () => {
      vi.mocked(prisma.product.findUnique).mockRejectedValue(new Error("DB Error"));

      const result = await toggleWishlistItem("prod_1", "usr_1");

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("INTERNAL_SERVER_ERROR");
    });
  });
});
