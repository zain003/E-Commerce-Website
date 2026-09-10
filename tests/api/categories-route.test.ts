import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getCategoriesRoute } from "@/app/api/categories/route";
import * as productService from "@/lib/services/products";

vi.mock("@/lib/services/products", () => ({
  getCategories: vi.fn(),
}));

describe("GET /api/categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with categories array in ApiResponse envelope", async () => {
    const mockCategories = [
      {
        id: "cat_1",
        name: "Electronics",
        slug: "electronics",
        description: null,
        imageUrl: null,
        createdAt: new Date("2026-01-01"),
      },
    ];

    vi.mocked(productService.getCategories).mockResolvedValue(mockCategories);

    const res = await getCategoriesRoute();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].slug).toBe("electronics");
    expect(json.timestamp).toBeDefined();
  });

  it("returns 500 INTERNAL_SERVER_ERROR when service throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(productService.getCategories).mockRejectedValue(new Error("Database connection lost"));

    const res = await getCategoriesRoute();
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INTERNAL_SERVER_ERROR");
  });
});
