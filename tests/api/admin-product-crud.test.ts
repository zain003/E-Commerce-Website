import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { GET as getProducts, POST as createProduct } from "@/app/api/admin/products/route";
import { PATCH as updateProduct, DELETE as deleteProduct } from "@/app/api/admin/products/[id]/route";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  cacheLife: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
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

describe("Admin Product CRUD & Revalidation (API)", () => {
  const adminSession = {
    user: {
      id: "usr_admin",
      email: "admin@example.com",
      name: "Admin User",
      role: "ADMIN" as const,
    },
    expires: "9999-12-31",
  };

  const mockDate = new Date("2026-09-13T10:00:00Z");

  const mockProduct = {
    id: "prod_1",
    name: "Classic Denim Jacket",
    slug: "classic-denim-jacket",
    description: "Durable denim jacket with classic cut.",
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
    vi.mocked(getServerSession).mockResolvedValue(adminSession);
  });

  describe("GET /api/admin/products", () => {
    it("returns paginated list of products for admin", async () => {
      vi.mocked(prisma.$transaction).mockResolvedValue([[mockProduct], 1] as any);

      const req = new NextRequest("http://localhost:3000/api/admin/products?page=1&limit=10");
      const res = await getProducts(req);

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.items).toHaveLength(1);
      expect(body.data.items[0].slug).toBe("classic-denim-jacket");
      expect(body.data.total).toBe(1);
      expect(body.data.page).toBe(1);
      expect(body.data.limit).toBe(10);
      expect(body.data.totalPages).toBe(1);
    });

    it("returns 400 for invalid query parameters", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/products?page=-1");
      const res = await getProducts(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/admin/products", () => {
    const validCreatePayload = {
      name: "Classic Denim Jacket",
      slug: "classic-denim-jacket",
      description: "Durable denim jacket with classic cut.",
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

    it("creates a product with nested variants in single transaction and triggers revalidateTag('products')", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.productVariant.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.category.findUnique).mockResolvedValue({
        id: "cat_apparel",
        name: "Apparel",
        slug: "apparel",
        description: null,
        imageUrl: null,
        createdAt: mockDate,
      });

      vi.mocked(prisma.product.create).mockResolvedValue(mockProduct as any);

      const req = new NextRequest("http://localhost:3000/api/admin/products", {
        method: "POST",
        body: JSON.stringify(validCreatePayload),
      });

      const res = await createProduct(req);

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.name).toBe("Classic Denim Jacket");
      expect(prisma.product.create).toHaveBeenCalledTimes(1);
      expect(revalidateTag).toHaveBeenCalledWith("products");
    });

    it("returns 409 CONFLICT if product with slug already exists", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as any);

      const req = new NextRequest("http://localhost:3000/api/admin/products", {
        method: "POST",
        body: JSON.stringify(validCreatePayload),
      });

      const res = await createProduct(req);

      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("CONFLICT");
      expect(revalidateTag).not.toHaveBeenCalled();
    });

    it("returns 409 CONFLICT if variant SKU already exists", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: "cat_apparel" } as any);
      vi.mocked(prisma.productVariant.findUnique).mockResolvedValue({
        id: "existing_var",
        sku: "JKT-DEN-M",
      } as any);

      const req = new NextRequest("http://localhost:3000/api/admin/products", {
        method: "POST",
        body: JSON.stringify(validCreatePayload),
      });

      const res = await createProduct(req);

      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("CONFLICT");
      expect(revalidateTag).not.toHaveBeenCalled();
    });

    it("returns 400 BAD_REQUEST if category does not exist", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.productVariant.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.category.findUnique).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/admin/products", {
        method: "POST",
        body: JSON.stringify(validCreatePayload),
      });

      const res = await createProduct(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("CATEGORY_NOT_FOUND");
    });

    it("returns 400 VALIDATION_ERROR when payload has negative price", async () => {
      const invalidPayload = {
        ...validCreatePayload,
        basePrice: -10,
      };

      const req = new NextRequest("http://localhost:3000/api/admin/products", {
        method: "POST",
        body: JSON.stringify(invalidPayload),
      });

      const res = await createProduct(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("PATCH /api/admin/products/:id", () => {
    it("updates product details and triggers revalidateTag('products')", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as any);
      const updatedProduct = {
        ...mockProduct,
        name: "Vintage Denim Jacket",
        basePrice: new Decimal("99.99"),
      };
      vi.mocked(prisma.product.update).mockResolvedValue(updatedProduct as any);

      const req = new NextRequest("http://localhost:3000/api/admin/products/prod_1", {
        method: "PATCH",
        body: JSON.stringify({
          name: "Vintage Denim Jacket",
          basePrice: 99.99,
        }),
      });

      const res = await updateProduct(req, { params: Promise.resolve({ id: "prod_1" }) });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.name).toBe("Vintage Denim Jacket");
      expect(revalidateTag).toHaveBeenCalledWith("products");
    });

    it("returns 404 NOT_FOUND if product does not exist", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/admin/products/prod_missing", {
        method: "PATCH",
        body: JSON.stringify({ name: "Vintage Denim Jacket" }),
      });

      const res = await updateProduct(req, { params: Promise.resolve({ id: "prod_missing" }) });

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("NOT_FOUND");
    });

    it("returns 409 CONFLICT if updating to a slug taken by another product", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as any);
      vi.mocked(prisma.product.findFirst).mockResolvedValue({
        id: "prod_different",
        slug: "taken-slug",
      } as any);

      const req = new NextRequest("http://localhost:3000/api/admin/products/prod_1", {
        method: "PATCH",
        body: JSON.stringify({ slug: "taken-slug" }),
      });

      const res = await updateProduct(req, { params: Promise.resolve({ id: "prod_1" }) });

      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("CONFLICT");
      expect(revalidateTag).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /api/admin/products/:id", () => {
    it("archives product setting isArchived: true without deleting historical records, and triggers revalidateTag('products')", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as any);
      const archivedProduct = {
        ...mockProduct,
        isArchived: true,
      };
      vi.mocked(prisma.product.update).mockResolvedValue(archivedProduct as any);

      const req = new NextRequest("http://localhost:3000/api/admin/products/prod_1", {
        method: "DELETE",
      });

      const res = await deleteProduct(req, { params: Promise.resolve({ id: "prod_1" }) });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.isArchived).toBe(true);
      expect(prisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "prod_1" },
          data: expect.objectContaining({ isArchived: true }),
        })
      );
      expect(revalidateTag).toHaveBeenCalledWith("products");
    });
  });
});
