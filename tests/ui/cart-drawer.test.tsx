import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { HeaderCartButton } from "@/components/layout/header-cart-button";
import { useCartStore } from "@/store/cart-store";
import { HydratedCart } from "@/types";
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

const mockCart: HydratedCart = {
  id: "cart-1",
  userId: "user-1",
  guestToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  subtotal: 159.98,
  itemCount: 2,
  items: [
    {
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
        stock: 10,
        product: {
          id: "prod-1",
          name: "Performance Hoodie",
          slug: "performance-hoodie",
          description: "Thermal hoodie",
          basePrice: new Decimal("79.99"),
          categoryId: "cat-1",
          images: ["https://images.unsplash.com/photo-1556905055-8f358a7a47b2"],
          featured: true,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    },
  ],
};

describe("CartDrawer UI Component", () => {
  beforeEach(() => {
    // Reset Zustand store state
    useCartStore.setState({
      cart: mockCart,
      isOpen: false,
      isLoading: false,
      isMutating: false,
      error: null,
    });
  });

  it("does not render drawer contents when isOpen is false", () => {
    render(<CartDrawer />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders slide-out dialog with accessible attributes when isOpen is true", () => {
    useCartStore.setState({ isOpen: true });
    render(<CartDrawer />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(screen.getByText(/shopping cart/i)).toBeTruthy();
    expect(screen.getByText("Performance Hoodie")).toBeTruthy();
    expect(screen.getByText("Medium / Heather Grey")).toBeTruthy();
  });

  it("opens drawer when HeaderCartButton is clicked", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <HeaderCartButton />
        <CartDrawer />
      </div>
    );

    const triggerButton = screen.getByRole("button", { name: /shopping cart/i });
    expect(screen.queryByRole("dialog")).toBeNull();

    await user.click(triggerButton);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("closes drawer when close (X) button is clicked", async () => {
    const user = userEvent.setup();
    useCartStore.setState({ isOpen: true });
    render(<CartDrawer />);

    expect(screen.getByRole("dialog")).toBeTruthy();
    const closeBtn = screen.getByRole("button", { name: /close cart/i });
    await user.click(closeBtn);

    expect(useCartStore.getState().isOpen).toBe(false);
  });

  it("closes drawer when clicking backdrop overlay", async () => {
    const user = userEvent.setup();
    useCartStore.setState({ isOpen: true });
    render(<CartDrawer />);

    const backdrop = screen.getByTestId("cart-backdrop");
    await user.click(backdrop);

    expect(useCartStore.getState().isOpen).toBe(false);
  });

  it("closes drawer when pressing Escape key", async () => {
    const user = userEvent.setup();
    useCartStore.setState({ isOpen: true });
    render(<CartDrawer />);

    expect(screen.getByRole("dialog")).toBeTruthy();
    await user.keyboard("{Escape}");

    expect(useCartStore.getState().isOpen).toBe(false);
  });
});
