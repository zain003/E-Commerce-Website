import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WishlistPage from "@/app/account/wishlist/page";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => "/account/wishlist"),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

describe("Wishlist Page (UI)", () => {
  const mockPush = vi.fn();

  const mockWishlistItems = [
    {
      id: "wish_1",
      userId: "usr_1",
      productId: "prod_1",
      createdAt: "2026-03-01T10:00:00Z",
      product: {
        id: "prod_1",
        name: "Linen Blazer",
        slug: "linen-blazer",
        description: "Tailored linen blazer",
        basePrice: 150,
        images: ["https://images.unsplash.com/photo-linen"],
        isArchived: false,
        inStock: true,
        category: { id: "cat_1", name: "Suits", slug: "suits" },
        variants: [{ id: "var_1", name: "M", stock: 10, priceDelta: 0 }],
      },
    },
    {
      id: "wish_2",
      userId: "usr_1",
      productId: "prod_2",
      createdAt: "2026-03-02T10:00:00Z",
      product: {
        id: "prod_2",
        name: "Vintage Fedora",
        slug: "vintage-fedora",
        description: "Classic felt fedora",
        basePrice: 75,
        images: [],
        isArchived: false,
        inStock: false,
        category: { id: "cat_2", name: "Hats", slug: "hats" },
        variants: [{ id: "var_2", name: "Standard", stock: 0, priceDelta: 0 }],
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    } as any);

    global.fetch = vi.fn();
  });

  it("redirects unauthenticated user to /login", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: "unauthenticated",
    } as any);

    render(<WishlistPage />);

    expect(mockPush).toHaveBeenCalledWith("/login?callbackUrl=%2Faccount%2Fwishlist");
  });

  it("renders wishlist items with name, price, category, and stock indicators", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: "usr_1" } },
      status: "authenticated",
    } as any);

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockWishlistItems,
      }),
    } as any);

    render(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByText("Linen Blazer")).toBeTruthy();
      expect(screen.getByText("$150.00")).toBeTruthy();
      expect(screen.getByText("Suits")).toBeTruthy();

      expect(screen.getByText("Vintage Fedora")).toBeTruthy();
      expect(screen.getByText("$75.00")).toBeTruthy();
      expect(screen.getAllByText("Out of Stock").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("renders friendly empty state with 'Browse Products' button when user has 0 items", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: "usr_1" } },
      status: "authenticated",
    } as any);

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
      }),
    } as any);

    render(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByText(/your wishlist is empty/i)).toBeTruthy();
      const browseLink = screen.getByRole("link", { name: /browse products/i });
      expect(browseLink).toBeTruthy();
      expect(browseLink.getAttribute("href")).toBe("/products");
    });
  });

  it("removes an item from the view when the remove button is clicked", async () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: "usr_1" } },
      status: "authenticated",
    } as any);

    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockWishlistItems,
        }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { isWishlisted: false, productId: "prod_1" },
        }),
      } as any);

    render(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByText("Linen Blazer")).toBeTruthy();
    });

    const removeButtons = screen.getAllByRole("button", { name: /remove from wishlist/i });
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText("Linen Blazer")).toBeNull();
      expect(screen.getByText("Vintage Fedora")).toBeTruthy();
    });
  });
});
