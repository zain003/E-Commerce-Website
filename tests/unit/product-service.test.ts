import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getProductBySlug,
  getFeaturedProducts,
  getProductsByCategory,
} from "@/lib/services/products";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
  },
}));

describe("Product Service (Unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProductBySlug", () => {
    const mockCategory = {
      id: "cat_1",
      name: "Apparel",
      slug: "apparel",
      description: "Clothing items",
      imageUrl: "/images/apparel.jpg",
      createdAt: new Date("2026-01-01"),
    };

    const mockVariants = [
      {
        id: "var_1",
        productId: "prod_1",
        sku: "TSHIRT-BLK-M",
        name: "Medium / Black",
        priceDelta: new Decimal("0.00"),
        stock: 25,
      },
      {
        id: "var_2",
        productId: "prod_1",
        sku: "TSHIRT-BLK-L",
        name: "Large / Black",
        priceDelta: new Decimal("2.50"),
        stock: 10,
      },
    ];

    const mockProduct = {
      id: "prod_1",
      name: "Classic Tee",
      slug: "classic-tee",
      description: "A comfortable organic cotton tee",
      basePrice: new Decimal("29.99"),
      categoryId: "cat_1",
      images: ["/images/tee-front.jpg", "/images/tee-back.jpg"],
      featured: true,
      isArchived: false,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
      category: mockCategory,
      variants: mockVariants,
    };

    it("returns complete product with category and variants for an existing active slug", async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValue(mockProduct);

      const result = await getProductBySlug("classic-tee");

      expect(prisma.product.findFirst).toHaveBeenCalledWith({
        where: {
          slug: "classic-tee",
          isArchived: false,
        },
        include: {
          category: true,
          variants: {
            orderBy: { name: "asc" },
          },
        },
      });

      expect(result).not.toBeNull();
      expect(result?.id).toBe("prod_1");
      expect(result?.name).toBe("Classic Tee");
      expect(result?.category.name).toBe("Apparel");
      expect(result?.variants).toHaveLength(2);
      expect(result?.variants[0].sku).toBe("TSHIRT-BLK-M");
    });

    it("returns null when product is not found", async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValue(null);

      const result = await getProductBySlug("non-existent-product");

      expect(prisma.product.findFirst).toHaveBeenCalledWith({
        where: {
          slug: "non-existent-product",
          isArchived: false,
        },
        include: {
          category: true,
          variants: {
            orderBy: { name: "asc" },
          },
        },
      });
      expect(result).toBeNull();
    });

    it("excludes archived products and returns null", async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValue(null);

      const result = await getProductBySlug("archived-product");

      expect(prisma.product.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            slug: "archived-product",
            isArchived: false,
          },
        })
      );
      expect(result).toBeNull();
    });

    it("handles product with 0 variants gracefully", async () => {
      const productNoVariants = {
        ...mockProduct,
        variants: [],
      };
      vi.mocked(prisma.product.findFirst).mockResolvedValue(productNoVariants);

      const result = await getProductBySlug("classic-tee");

      expect(result).not.toBeNull();
      expect(result?.variants).toEqual([]);
    });

    it("decodes URL-encoded slug characters safely", async () => {
      vi.mocked(prisma.product.findFirst).mockResolvedValue(mockProduct);

      await getProductBySlug("special%20tee%26jeans");

      expect(prisma.product.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            slug: "special tee&jeans",
            isArchived: false,
          },
        })
      );
    });
  });

  describe("getFeaturedProducts", () => {
    it("returns featured products excluding archived ones", async () => {
      const mockFeatured = [
        {
          id: "prod_1",
          name: "Featured One",
          slug: "featured-one",
          description: "Desc",
          basePrice: new Decimal("49.99"),
          categoryId: "cat_1",
          images: ["/img1.jpg"],
          featured: true,
          isArchived: false,
          createdAt: new Date("2026-01-02"),
          updatedAt: new Date("2026-01-02"),
        },
      ];

      vi.mocked(prisma.product.findMany).mockResolvedValue(mockFeatured);

      const result = await getFeaturedProducts();

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: {
          featured: true,
          isArchived: false,
        },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Featured One");
    });
  });

  describe("getProductsByCategory", () => {
    it("returns products matching category slug excluding archived ones", async () => {
      const mockCategoryProducts = [
        {
          id: "prod_2",
          name: "Running Shoes",
          slug: "running-shoes",
          description: "Comfortable running shoes",
          basePrice: new Decimal("89.99"),
          categoryId: "cat_shoes",
          images: ["/shoes.jpg"],
          featured: false,
          isArchived: false,
          createdAt: new Date("2026-01-01"),
          updatedAt: new Date("2026-01-01"),
        },
      ];

      vi.mocked(prisma.product.findMany).mockResolvedValue(mockCategoryProducts);

      const result = await getProductsByCategory("footwear%20active");

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: {
          category: { slug: "footwear active" },
          isArchived: false,
        },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Running Shoes");
    });
  });
});
