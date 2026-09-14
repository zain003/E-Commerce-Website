import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WishlistCard } from "@/components/wishlist/wishlist-card";
import { useCartStore } from "@/store/cart-store";
import { HydratedWishlistItem } from "@/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

describe("WishlistCard — Move to Cart Flow (UI)", () => {
  const inStockItem: HydratedWishlistItem = {
    id: "wish_1",
    userId: "usr_1",
    productId: "prod_1",
    createdAt: new Date(),
    product: {
      id: "prod_1",
      name: "Merino Wool Sweater",
      slug: "merino-wool-sweater",
      description: "Warm merino wool sweater",
      basePrice: 110.0 as any,
      categoryId: "cat_1",
      images: ["https://images.unsplash.com/merino"],
      featured: false,
      isArchived: false,
      inStock: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      variants: [
        {
          id: "var_1",
          productId: "prod_1",
          sku: "MERINO-M",
          name: "Medium",
          priceDelta: 0 as any,
          stock: 5,
        },
      ],
    },
  };

  const outOfStockItem: HydratedWishlistItem = {
    id: "wish_2",
    userId: "usr_1",
    productId: "prod_2",
    createdAt: new Date(),
    product: {
      id: "prod_2",
      name: "Cashmere Scarf",
      slug: "cashmere-scarf",
      description: "Soft cashmere scarf",
      basePrice: 80.0 as any,
      categoryId: "cat_1",
      images: [],
      featured: false,
      isArchived: false,
      inStock: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      variants: [
        {
          id: "var_2",
          productId: "prod_2",
          sku: "SCARF-ONE",
          name: "One Size",
          priceDelta: 0 as any,
          stock: 0,
        },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    useCartStore.setState({
      cart: null,
      isOpen: false,
      isLoading: false,
      isMutating: false,
      error: null,
    });
  });

  it("adds in-stock variant to cart and removes product from wishlist when clicking Move to Cart", async () => {
    const mockOnRemove = vi.fn();
    const addItemSpy = vi.spyOn(useCartStore.getState(), "addItem").mockImplementation(vi.fn());

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { isWishlisted: false, productId: "prod_1" },
      }),
    } as any);

    render(<WishlistCard item={inStockItem} onRemove={mockOnRemove} />);

    const moveBtn = screen.getByRole("button", { name: /move to cart/i });
    expect(moveBtn).toBeTruthy();
    expect(moveBtn.hasAttribute("disabled")).toBe(false);

    fireEvent.click(moveBtn);

    expect(addItemSpy).toHaveBeenCalledWith("var_1", 1);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/account/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "prod_1" }),
      });
      expect(mockOnRemove).toHaveBeenCalledWith("prod_1");
    });
  });

  it("disables button with 'Out of Stock' when product is out of stock", () => {
    const addItemSpy = vi.spyOn(useCartStore.getState(), "addItem");
    const mockOnRemove = vi.fn();

    render(<WishlistCard item={outOfStockItem} onRemove={mockOnRemove} />);

    const outBtn = screen.getByRole("button", { name: /out of stock/i });
    expect(outBtn).toBeTruthy();
    expect(outBtn.hasAttribute("disabled")).toBe(true);

    fireEvent.click(outBtn);
    expect(addItemSpy).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockOnRemove).not.toHaveBeenCalled();
  });
});
