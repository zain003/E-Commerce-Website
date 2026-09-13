import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { GET as getProducts, POST as createProduct } from "@/app/api/admin/products/route";
import { PATCH as updateProduct, DELETE as deleteProduct } from "@/app/api/admin/products/[id]/route";
import { PATCH as updateVariantStock } from "@/app/api/admin/variants/[id]/stock/route";
import { prisma } from "@/lib/prisma";

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
      update: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("Admin Authentication & Role Guards (API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Unauthenticated Access (No Session)", () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(null);
    });

    it("GET /api/admin/products returns 401 UNAUTHORIZED", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/products");
      const res = await getProducts(req);

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHORIZED");
    });

    it("POST /api/admin/products returns 401 UNAUTHORIZED", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/products", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const res = await createProduct(req);

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHORIZED");
    });

    it("PATCH /api/admin/products/:id returns 401 UNAUTHORIZED", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/products/prod_123", {
        method: "PATCH",
        body: JSON.stringify({ name: "Updated" }),
      });
      const res = await updateProduct(req, { params: Promise.resolve({ id: "prod_123" }) });

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHORIZED");
    });

    it("DELETE /api/admin/products/:id returns 401 UNAUTHORIZED", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/products/prod_123", {
        method: "DELETE",
      });
      const res = await deleteProduct(req, { params: Promise.resolve({ id: "prod_123" }) });

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHORIZED");
    });

    it("PATCH /api/admin/variants/:id/stock returns 401 UNAUTHORIZED", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/variants/var_123/stock", {
        method: "PATCH",
        body: JSON.stringify({ stock: 50 }),
      });
      const res = await updateVariantStock(req, { params: Promise.resolve({ id: "var_123" }) });

      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("Non-Admin Customer Session (role: CUSTOMER)", () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: {
          id: "usr_customer",
          email: "customer@example.com",
          name: "Customer User",
          role: "CUSTOMER",
        },
        expires: "9999-12-31",
      });
    });

    it("GET /api/admin/products returns 403 FORBIDDEN", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/products");
      const res = await getProducts(req);

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("FORBIDDEN");
    });

    it("POST /api/admin/products returns 403 FORBIDDEN", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/products", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const res = await createProduct(req);

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("FORBIDDEN");
    });

    it("PATCH /api/admin/products/:id returns 403 FORBIDDEN", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/products/prod_123", {
        method: "PATCH",
        body: JSON.stringify({ name: "Updated" }),
      });
      const res = await updateProduct(req, { params: Promise.resolve({ id: "prod_123" }) });

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("FORBIDDEN");
    });

    it("DELETE /api/admin/products/:id returns 403 FORBIDDEN", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/products/prod_123", {
        method: "DELETE",
      });
      const res = await deleteProduct(req, { params: Promise.resolve({ id: "prod_123" }) });

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("FORBIDDEN");
    });

    it("PATCH /api/admin/variants/:id/stock returns 403 FORBIDDEN", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/variants/var_123/stock", {
        method: "PATCH",
        body: JSON.stringify({ stock: 50 }),
      });
      const res = await updateVariantStock(req, { params: Promise.resolve({ id: "var_123" }) });

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("FORBIDDEN");
    });
  });
});
