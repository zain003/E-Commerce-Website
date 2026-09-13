import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { PATCH as updateVariantStock } from "@/app/api/admin/variants/[id]/stock/route";
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
    productVariant: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("Admin Variant Stock Adjustment (API)", () => {
  const adminSession = {
    user: {
      id: "usr_admin",
      email: "admin@example.com",
      name: "Admin User",
      role: "ADMIN" as const,
    },
    expires: "9999-12-31",
  };

  const mockVariant = {
    id: "var_100",
    productId: "prod_1",
    sku: "TSHIRT-L-RED",
    name: "Large / Red",
    priceDelta: new Decimal("0.00"),
    stock: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(adminSession);
  });

  it("updates variant stock immediately and triggers revalidateTag('products')", async () => {
    vi.mocked(prisma.productVariant.findUnique).mockResolvedValue(mockVariant as any);
    const updatedVariant = { ...mockVariant, stock: 42 };
    vi.mocked(prisma.productVariant.update).mockResolvedValue(updatedVariant as any);

    const req = new NextRequest("http://localhost:3000/api/admin/variants/var_100/stock", {
      method: "PATCH",
      body: JSON.stringify({ stock: 42 }),
    });

    const res = await updateVariantStock(req, { params: Promise.resolve({ id: "var_100" }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.stock).toBe(42);
    expect(prisma.productVariant.update).toHaveBeenCalledWith({
      where: { id: "var_100" },
      data: { stock: 42 },
    });
    expect(revalidateTag).toHaveBeenCalledWith("products", "hours");
  });

  it("returns 404 NOT_FOUND if variant does not exist", async () => {
    vi.mocked(prisma.productVariant.findUnique).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/admin/variants/var_missing/stock", {
      method: "PATCH",
      body: JSON.stringify({ stock: 10 }),
    });

    const res = await updateVariantStock(req, { params: Promise.resolve({ id: "var_missing" }) });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("NOT_FOUND");
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("returns 400 VALIDATION_ERROR when stock is negative", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/variants/var_100/stock", {
      method: "PATCH",
      body: JSON.stringify({ stock: -5 }),
    });

    const res = await updateVariantStock(req, { params: Promise.resolve({ id: "var_100" }) });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("returns 400 VALIDATION_ERROR when stock is not an integer", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/variants/var_100/stock", {
      method: "PATCH",
      body: JSON.stringify({ stock: 12.5 }),
    });

    const res = await updateVariantStock(req, { params: Promise.resolve({ id: "var_100" }) });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});
