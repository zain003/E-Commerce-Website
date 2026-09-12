import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { Decimal } from "@prisma/client/runtime/library";
import { ProductDetail } from "@/types";
import { useCartStore } from "@/store/cart-store";

// Mock Next.js Image for jsdom compatibility
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    className,
    fill,
    sizes,
    priority,
    ...props
  }: {
    src: string;
    alt: string;
    className?: string;
    fill?: boolean;
    sizes?: string;
    priority?: boolean;
  }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} data-fill={fill ? "true" : undefined} {...props} />;
  },
}));

describe("ProductDetailView UI Component", () => {
  const mockProductDetail: ProductDetail = {
    id: "prod-1",
    name: "Performance Hoodie",
    slug: "performance-hoodie",
    description: "Breathable, thermal-regulating everyday performance hoodie.",
    basePrice: new Decimal("79.99"),
    categoryId: "cat-1",
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800",
    ],
    featured: true,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {
      id: "cat-1",
      name: "Outerwear",
      slug: "outerwear",
      description: "Jackets and hoodies",
      imageUrl: null,
      createdAt: new Date(),
    },
    variants: [
      {
        id: "var-1",
        productId: "prod-1",
        sku: "HOOD-GRY-M",
        name: "Medium / Heather Grey",
        priceDelta: new Decimal("0.00"),
        stock: 10,
      },
      {
        id: "var-2",
        productId: "prod-1",
        sku: "HOOD-GRY-L",
        name: "Large / Heather Grey",
        priceDelta: new Decimal("10.00"),
        stock: 0, // Out of stock
      },
    ],
  };

  it("renders product title in h1, category badge, and description", () => {
    render(<ProductDetailView product={mockProductDetail} />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("Performance Hoodie");
    expect(screen.getAllByText("Outerwear").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText("Breathable, thermal-regulating everyday performance hoodie.")
    ).toBeTruthy();
  });

  it("renders sticky mobile action bar at bottom of viewport", () => {
    render(<ProductDetailView product={mockProductDetail} />);

    const stickyBar = screen.getByTestId("sticky-mobile-bar");
    expect(stickyBar).toBeTruthy();
    // Verify it contains an Add to Cart button and price display
    expect(stickyBar.textContent).toContain("$79.99");
    expect(stickyBar.textContent).toContain("Add to Cart");
  });

  it("updates sticky mobile action bar price when a variant with price delta is selected", async () => {
    const productWithInStockVariants: ProductDetail = {
      ...mockProductDetail,
      variants: [
        {
          id: "var-1",
          productId: "prod-1",
          sku: "HOOD-GRY-M",
          name: "Medium / Heather Grey",
          priceDelta: new Decimal("0.00"),
          stock: 10,
        },
        {
          id: "var-2",
          productId: "prod-1",
          sku: "HOOD-GRY-XL",
          name: "XL / Heather Grey",
          priceDelta: new Decimal("15.00"),
          stock: 5,
        },
      ],
    };

    const user = userEvent.setup();
    render(<ProductDetailView product={productWithInStockVariants} />);

    // Initial sticky bar shows $79.99
    const stickyBar = screen.getByTestId("sticky-mobile-bar");
    expect(stickyBar.textContent).toContain("$79.99");

    // Click XL variant (+$15.00)
    const xlButton = screen.getByRole("button", { name: /xl \/ heather grey/i });
    await user.click(xlButton);

    // Both desktop and mobile action bar update to $94.99
    expect(stickyBar.textContent).toContain("$94.99");
  });

  it("disables add to cart buttons when selected variant is out of stock", () => {
    const outOfStockProduct: ProductDetail = {
      ...mockProductDetail,
      variants: [
        {
          id: "var-1",
          productId: "prod-1",
          sku: "HOOD-OOS",
          name: "One Size",
          priceDelta: new Decimal("0.00"),
          stock: 0,
        },
      ],
    };

    render(<ProductDetailView product={outOfStockProduct} />);

    const addButtons = screen.getAllByRole("button", { name: /out of stock/i });
    expect(addButtons.length).toBeGreaterThan(0);
    for (const btn of addButtons) {
      expect(btn.hasAttribute("disabled")).toBe(true);
    }
  });

  it("calls addItem with selected variant and quantity 1 when Add to Cart is clicked", async () => {
    const mockAddItem = vi.fn();
    const originalAddItem = useCartStore.getState().addItem;
    useCartStore.setState({ addItem: mockAddItem });

    const user = userEvent.setup();
    const { unmount } = render(<ProductDetailView product={mockProductDetail} />);

    const addButtons = screen.getAllByRole("button", { name: /add to cart/i });
    await user.click(addButtons[0]);

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith("var-1", 1);
    });

    unmount();
    useCartStore.setState({ addItem: originalAddItem });
  });
});
