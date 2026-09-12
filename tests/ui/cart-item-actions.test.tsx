import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartItemRow } from "@/components/cart/cart-item";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useCartStore } from "@/store/cart-store";
import { HydratedCart, HydratedCartItem } from "@/types";
import { Decimal } from "@prisma/client/runtime/library";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    className,
    fill,
    ...props
  }: {
    src: string;
    alt: string;
    className?: string;
    fill?: boolean;
    [key: string]: any;
  }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} data-fill={fill ? "true" : undefined} {...props} />;
  },
}));

const mockItem: HydratedCartItem = {
  id: "item-1",
  cartId: "cart-1",
  variantId: "var-1",
  quantity: 2,
  createdAt: new Date(),
  variant: {
    id: "var-1",
    productId: "prod-1",
    sku: "HOOD-GRY-M",
    name: "Medium / Heather Grey",
    priceDelta: new Decimal("0.00"),
    stock: 5,
    product: {
      id: "prod-1",
      name: "Performance Hoodie",
      slug: "performance-hoodie",
      description: "Thermal hoodie",
      basePrice: new Decimal("50.00"),
      categoryId: "cat-1",
      images: ["https://images.unsplash.com/photo-1556905055-8f358a7a47b2"],
      featured: true,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
};

const mockCart: HydratedCart = {
  id: "cart-1",
  userId: "user-1",
  guestToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  subtotal: 100.0,
  itemCount: 2,
  items: [mockItem],
};

describe("CartItem Actions & Optimistic Updates", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useCartStore.setState({
      cart: JSON.parse(JSON.stringify(mockCart)),
      isOpen: true,
      isLoading: false,
      isMutating: false,
      error: null,
    });
  });

  it("renders item name, variant label, price, and current quantity", () => {
    render(<CartItemRow item={mockItem} />);

    expect(screen.getByText("Performance Hoodie")).toBeTruthy();
    expect(screen.getByText("Medium / Heather Grey")).toBeTruthy();
    expect(screen.getByText("$50.00")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
  });

  it("disables decrement button when item quantity is 1", () => {
    const singleQtyItem: HydratedCartItem = {
      ...mockItem,
      quantity: 1,
    };
    render(<CartItemRow item={singleQtyItem} />);

    const decBtn = screen.getByRole("button", { name: /decrease quantity/i });
    expect(decBtn.hasAttribute("disabled")).toBe(true);
  });

  it("disables increment button when item quantity reaches available stock", () => {
    const maxStockItem: HydratedCartItem = {
      ...mockItem,
      quantity: 5,
      variant: {
        ...mockItem.variant,
        stock: 5,
      },
    };
    render(<CartItemRow item={maxStockItem} />);

    const incBtn = screen.getByRole("button", { name: /increase quantity/i });
    expect(incBtn.hasAttribute("disabled")).toBe(true);
  });

  it("optimistically increments quantity and updates subtotal text instantly", async () => {
    // Mock global fetch for API sync
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          ...mockCart,
          subtotal: 150.0,
          itemCount: 3,
          items: [{ ...mockItem, quantity: 3 }],
        },
      }),
    });

    const user = userEvent.setup();
    render(<CartDrawer />);

    // Initial subtotal $100.00
    expect(screen.getByTestId("cart-subtotal").textContent).toContain("$100.00");
    expect(screen.getByTestId("item-quantity").textContent).toBe("2");

    const incBtn = screen.getByRole("button", { name: /increase quantity/i });
    await user.click(incBtn);

    // Quantity should be immediately updated to 3
    expect(screen.getByTestId("item-quantity").textContent).toBe("3");
    // Subtotal should immediately reflect 3 * $50 = $150.00
    expect(screen.getByTestId("cart-subtotal").textContent).toContain("$150.00");
  });

  it("optimistically decrements quantity and updates subtotal text instantly", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          ...mockCart,
          subtotal: 50.0,
          itemCount: 1,
          items: [{ ...mockItem, quantity: 1 }],
        },
      }),
    });

    const user = userEvent.setup();
    render(<CartDrawer />);

    const decBtn = screen.getByRole("button", { name: /decrease quantity/i });
    await user.click(decBtn);

    expect(screen.getByTestId("item-quantity").textContent).toBe("1");
    expect(screen.getByTestId("cart-subtotal").textContent).toContain("$50.00");
  });

  it("removes item from cart when clicking delete button", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          ...mockCart,
          subtotal: 0,
          itemCount: 0,
          items: [],
        },
      }),
    });

    const user = userEvent.setup();
    render(<CartDrawer />);

    const removeBtn = screen.getByRole("button", { name: /remove item/i });
    await user.click(removeBtn);

    // Item should be removed and empty state shown
    expect(screen.queryByText("Performance Hoodie")).toBeNull();
    expect(screen.getByText(/your cart is empty/i)).toBeTruthy();
  });

  it("rolls back quantity and displays error message if update API fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        error: {
          code: "INSUFFICIENT_STOCK",
          message: "Only 2 items left in stock",
        },
      }),
    });

    const user = userEvent.setup();
    render(<CartDrawer />);

    const incBtn = screen.getByRole("button", { name: /increase quantity/i });
    await user.click(incBtn);

    // Initial optimistic change to 3
    // Then rollback to 2 upon API error
    await waitFor(() => {
      expect(screen.getByTestId("item-quantity").textContent).toBe("2");
      expect(screen.getByText(/only 2 items left in stock/i)).toBeTruthy();
    });
  });
});
