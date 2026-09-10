import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getFeaturedProductsRoute } from "@/app/api/products/featured/route";
import * as productService from "@/lib/services/products";
import { Decimal } from "@prisma/client/runtime/library";

vi.mock("@/lib/services/products", () => ({
  getFeaturedProducts: vi.fn(),
}));

describe("GET /api/products/featured", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with featured products array in ApiResponse envelope", async () => {
    const mockProducts = [
      {
        id: "prod_1",
        name: "Premium Denim",
        slug: "premium-denim",
        description: "Classic denim jeans",
        basePrice: new Decimal("79.99"),
        categoryId: "cat_apparel",
        images: ["/denim.jpg"],
        featured: true,
        isArchived: false,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
      },
    ];

    vi.mocked(productService.getFeaturedProducts).mockResolvedValue(mockProducts);

    const res = await getFeaturedProductsRoute();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].name).toBe("Premium Denim");
    expect(json.timestamp).toBeDefined();
  });

  it("returns 500 INTERNAL_SERVER_ERROR when service throws an error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(productService.getFeaturedProducts).mockRejectedValue(new Error("Query timeout"));

    const res = await getFeaturedProductsRoute();
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INTERNAL_SERVER_ERROR");
  });
});
