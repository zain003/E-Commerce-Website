import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getProductRoute } from "@/app/api/products/[slug]/route";
import * as productService from "@/lib/services/products";
import { NextRequest } from "next/server";
import { Decimal } from "@prisma/client/runtime/library";

vi.mock("@/lib/services/products", () => ({
  getProductBySlug: vi.fn(),
}));

describe("GET /api/products/[slug]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProductDetail = {
    id: "prod_1",
    name: "Classic Tee",
    slug: "classic-tee",
    description: "Organic cotton tee",
    basePrice: new Decimal("29.99"),
    categoryId: "cat_1",
    images: ["/tee.jpg"],
    featured: true,
    isArchived: false,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    category: {
      id: "cat_1",
      name: "Apparel",
      slug: "apparel",
      description: "Apparel desc",
      imageUrl: null,
      createdAt: new Date("2026-01-01"),
    },
    variants: [
      {
        id: "var_1",
        productId: "prod_1",
        sku: "TEE-BLK-S",
        name: "Small / Black",
        priceDelta: new Decimal("0.00"),
        stock: 15,
      },
    ],
  };

  it("returns 200 with complete product detail payload when slug exists", async () => {
    vi.mocked(productService.getProductBySlug).mockResolvedValue(mockProductDetail as any);

    const req = new NextRequest("http://localhost:3000/api/products/classic-tee");
    const res = await getProductRoute(req, {
      params: Promise.resolve({ slug: "classic-tee" }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.id).toBe("prod_1");
    expect(json.data.slug).toBe("classic-tee");
    expect(json.data.category.name).toBe("Apparel");
    expect(json.data.variants).toHaveLength(1);
    expect(json.timestamp).toBeDefined();
  });

  it("returns 404 NOT_FOUND when product slug does not exist", async () => {
    vi.mocked(productService.getProductBySlug).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/products/unknown-item");
    const res = await getProductRoute(req, {
      params: Promise.resolve({ slug: "unknown-item" }),
    });

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("NOT_FOUND");
    expect(json.error.message).toContain("not found");
    expect(json.timestamp).toBeDefined();
  });

  it("returns 404 NOT_FOUND when product is archived", async () => {
    vi.mocked(productService.getProductBySlug).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/products/archived-tee");
    const res = await getProductRoute(req, {
      params: Promise.resolve({ slug: "archived-tee" }),
    });

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("NOT_FOUND");
  });

  it("returns 400 BAD_REQUEST when slug parameter is empty", async () => {
    const req = new NextRequest("http://localhost:3000/api/products/");
    const res = await getProductRoute(req, {
      params: Promise.resolve({ slug: "" }),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("BAD_REQUEST");
  });

  it("returns 500 INTERNAL_SERVER_ERROR when product service throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(productService.getProductBySlug).mockRejectedValue(new Error("Unexpected DB crash"));

    const req = new NextRequest("http://localhost:3000/api/products/error-item");
    const res = await getProductRoute(req, {
      params: Promise.resolve({ slug: "error-item" }),
    });

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INTERNAL_SERVER_ERROR");
  });
});
