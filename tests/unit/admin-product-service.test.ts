import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  updateVariantStock,
} from "@/lib/services/admin-products";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  cacheLife: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    productVariant: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("Admin Products Service (Unit)", () => {
  const mockDate = new Date("2026-09-13T10:00:00Z");

  const mockProduct = {
    id: "prod_1",
    name: "Classic Denim Jacket",
    slug: "classic-denim-jacket",
    description: "Durable denim jacket.",
    basePrice: new Decimal("89.99"),
    categoryId: "cat_apparel",
    images: ["https://example.com/jacket.jpg"],
    featured: true,
    isArchived: false,
    category: {
      id: "cat_apparel",
      name: "Apparel",
      slug: "apparel",
      description: null,
      imageUrl: null,
      createdAt: mockDate,
    },
    variants: [
      {
        id: "var_1",
        productId: "prod_1",
        sku: "JKT-DEN-M",
        name: "Medium",
        priceDelta: new Decimal("0.00"),
        stock: 20,
      },
    ],
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAdminProducts", () => {
    it("returns paginated products including archived products", async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([[mockProduct], 1] as any);

      const res = await getAdminProducts(1, 10);

      expect(res.success).toBe(true);
      expect(res.data?.items).toHaveLength(1);
      expect(res.data?.total).toBe(1);
      expect(res.data?.page).toBe(1);
      expect(res.data?.totalPages).toBe(1);
    });

    it("handles database errors gracefully", async () => {
      vi.mocked(prisma.$transaction).mockRejectedValue(new Error("DB Connection Error"));

      const res = await getAdminProducts(1, 10);

      expect(res.success).toBe(false);
      expect(res.error?.code).toBe("INTERNAL_SERVER_ERROR");
    });
  });

  describe("createAdminProduct", () => {
    const validDto = {
      name: "Classic Denim Jacket",
      slug: "classic-denim-jacket",
      description: "Durable denim jacket.",
      basePrice: 89.99,
      categoryId: "cat_apparel",
      images: ["https://example.com/jacket.jpg"],
      featured: true,
      variants: [
        {
          sku: "JKT-DEN-M",
          name: "Medium",
          priceDelta: 0,
          stock: 20,
        },
      ],
    };

    it("creates product and variants, and triggers revalidateTag", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.productVariant.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: "cat_apparel" } as any);
      vi.mocked(prisma.product.create).mockResolvedValue(mockProduct as any);

      const res = await createAdminProduct(validDto);

      expect(res.success).toBe(true);
      expect(res.data?.slug).toBe("classic-denim-jacket");
      expect(revalidateTag).toHaveBeenCalledWith("products");
    });

    it("fails with CONFLICT when slug already exists", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as any);

      const res = await createAdminProduct(validDto);

      expect(res.success).toBe(false);
      expect(res.error?.code).toBe("CONFLICT");
      expect(revalidateTag).not.toHaveBeenCalled();
    });

    it("fails with CATEGORY_NOT_FOUND when category does not exist", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.productVariant.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.category.findUnique).mockResolvedValue(null);

      const res = await createAdminProduct(validDto);

      expect(res.success).toBe(false);
      expect(res.error?.code).toBe("CATEGORY_NOT_FOUND");
    });
  });

  describe("updateAdminProduct", () => {
    it("updates product details and triggers revalidateTag", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as any);
      const updated = { ...mockProduct, name: "Updated Jacket" };
      vi.mocked(prisma.product.update).mockResolvedValue(updated as any);

      const res = await updateAdminProduct("prod_1", { name: "Updated Jacket" });

      expect(res.success).toBe(true);
      expect(res.data?.name).toBe("Updated Jacket");
      expect(revalidateTag).toHaveBeenCalledWith("products");
    });

    it("returns NOT_FOUND if product does not exist", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);

      const res = await updateAdminProduct("prod_missing", { name: "Updated Jacket" });

      expect(res.success).toBe(false);
      expect(res.error?.code).toBe("NOT_FOUND");
    });

    it("returns CONFLICT if target slug is already taken by another product", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as any);
      vi.mocked(prisma.product.findFirst).mockResolvedValue({
        id: "prod_other",
        slug: "taken-slug",
      } as any);

      const res = await updateAdminProduct("prod_1", { slug: "taken-slug" });

      expect(res.success).toBe(false);
      expect(res.error?.code).toBe("CONFLICT");
    });
  });

  describe("updateVariantStock", () => {
    const mockVariant = {
      id: "var_1",
      productId: "prod_1",
      sku: "JKT-DEN-M",
      name: "Medium",
      priceDelta: new Decimal("0.00"),
      stock: 20,
    };

    it("updates stock and triggers revalidateTag", async () => {
      vi.mocked(prisma.productVariant.findUnique).mockResolvedValue(mockVariant as any);
      vi.mocked(prisma.productVariant.update).mockResolvedValue({
        ...mockVariant,
        stock: 35,
      } as any);

      const res = await updateVariantStock("var_1", 35);

      expect(res.success).toBe(true);
      expect(res.data?.stock).toBe(35);
      expect(revalidateTag).toHaveBeenCalledWith("products");
    });

    it("returns NOT_FOUND if variant does not exist", async () => {
      vi.mocked(prisma.productVariant.findUnique).mockResolvedValue(null);

      const res = await updateVariantStock("var_missing", 10);

      expect(res.success).toBe(false);
      expect(res.error?.code).toBe("NOT_FOUND");
    });
  });
});
