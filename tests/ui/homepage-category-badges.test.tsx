import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/(shop)/page";
import * as productService from "@/lib/services/products";

vi.mock("@/lib/services/products", () => ({
  getFeaturedProducts: vi.fn(),
  getCategories: vi.fn(),
}));

describe("Homepage Category Badges (ISSUE-009)", () => {
  it("renders category badges linking to /products?category=slug rather than /#featured", async () => {
    vi.mocked(productService.getFeaturedProducts).mockResolvedValue([]);
    vi.mocked(productService.getCategories).mockResolvedValue([
      { id: "cat-1", name: "Apparel", slug: "apparel", description: null, imageUrl: null, createdAt: new Date() },
      { id: "cat-2", name: "Footwear", slug: "footwear", description: null, imageUrl: null, createdAt: new Date() },
    ]);

    const jsx = await HomePage();
    render(jsx);

    const apparelLink = screen.getByRole("link", { name: /apparel/i });
    expect(apparelLink).toBeTruthy();
    expect(apparelLink.getAttribute("href")).toBe("/products?category=apparel");

    const footwearLink = screen.getByRole("link", { name: /footwear/i });
    expect(footwearLink).toBeTruthy();
    expect(footwearLink.getAttribute("href")).toBe("/products?category=footwear");

    // Ensure none link to dead /#featured
    expect(apparelLink.getAttribute("href")).not.toBe("/#featured");
  });
});
