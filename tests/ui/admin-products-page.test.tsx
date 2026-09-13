import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminProductsPage from "@/app/admin/products/page";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getAdminProducts } from "@/lib/services/admin-products";
import { getCategories } from "@/lib/services/products";
import { Decimal } from "@prisma/client/runtime/library";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin/products",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/services/admin-products", () => ({
  getAdminProducts: vi.fn(),
}));

vi.mock("@/lib/services/products", () => ({
  getCategories: vi.fn(),
}));

describe("AdminProductsPage (Server Component)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated user to /login?callbackUrl=/admin/products", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    try {
      await AdminProductsPage({
        searchParams: Promise.resolve({}),
      });
    } catch {
      // redirect throws in Next.js
    }

    expect(redirect).toHaveBeenCalledWith("/login?callbackUrl=/admin/products");
  });

  it("redirects non-admin authenticated user to /unauthorized", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: "user_customer", email: "customer@example.com", role: "CUSTOMER" },
    });

    try {
      await AdminProductsPage({
        searchParams: Promise.resolve({}),
      });
    } catch {
      // redirect throws in Next.js
    }

    expect(redirect).toHaveBeenCalledWith("/unauthorized");
  });

  it("renders admin page with products and categories when authenticated as ADMIN", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: "user_admin", email: "admin@example.com", role: "ADMIN" },
    });

    vi.mocked(getCategories).mockResolvedValueOnce([
      {
        id: "cat_1",
        name: "Electronics",
        slug: "electronics",
        description: null,
        imageUrl: null,
        createdAt: new Date(),
      },
    ]);

    vi.mocked(getAdminProducts).mockResolvedValueOnce({
      success: true,
      data: {
        items: [
          {
            id: "prod_mock_1",
            name: "Mechanical Keyboard",
            slug: "mechanical-keyboard",
            description: "RGB Mechanical Keyboard",
            basePrice: new Decimal("99.99"),
            categoryId: "cat_1",
            images: [],
            featured: true,
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            category: {
              id: "cat_1",
              name: "Electronics",
              slug: "electronics",
              description: null,
              imageUrl: null,
              createdAt: new Date(),
            },
            variants: [
              {
                id: "var_kb_1",
                productId: "prod_mock_1",
                sku: "KB-RGB-RED",
                name: "Red Switch",
                priceDelta: new Decimal("0.00"),
                stock: 25,
              },
            ],
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
      timestamp: new Date().toISOString(),
    });

    const pageComponent = await AdminProductsPage({
      searchParams: Promise.resolve({}),
    });

    render(pageComponent);

    expect(screen.getByRole("heading", { name: /products/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /add product/i })).toBeTruthy();
    expect(screen.getByText("Mechanical Keyboard")).toBeTruthy();
  });
});
