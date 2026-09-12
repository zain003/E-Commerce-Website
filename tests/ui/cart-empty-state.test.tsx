import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartDrawer } from "@/components/cart/cart-drawer";
import CartPage from "@/app/(shop)/cart/page";
import { useCartStore } from "@/store/cart-store";
import { HydratedCart } from "@/types";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/cart",
}));

const emptyCart: HydratedCart = {
  id: "cart-empty",
  userId: "user-1",
  guestToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  subtotal: 0,
  itemCount: 0,
  items: [],
};

describe("Cart Empty State UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.setState({
      cart: emptyCart,
      isOpen: true,
      isLoading: false,
      isMutating: false,
      error: null,
    });
  });

  it("renders empty cart illustration, clean message, and Start Shopping button in drawer", () => {
    render(<CartDrawer />);

    expect(screen.getByRole("heading", { name: /your cart is empty/i })).toBeTruthy();
    expect(
      screen.getByText(/looks like you haven't added anything to your cart yet/i)
    ).toBeTruthy();

    const startShoppingBtn = screen.getByRole("button", { name: /start shopping/i });
    expect(startShoppingBtn).toBeTruthy();
  });

  it("navigates to /products and closes drawer when clicking Start Shopping button", async () => {
    const user = userEvent.setup();
    render(<CartDrawer />);

    const startShoppingBtn = screen.getByRole("button", { name: /start shopping/i });
    await user.click(startShoppingBtn);

    expect(mockPush).toHaveBeenCalledWith("/products");
    expect(useCartStore.getState().isOpen).toBe(false);
  });

  it("renders dedicated empty cart state on the full /cart page", () => {
    render(<CartPage />);

    expect(screen.getByRole("heading", { name: /your cart is empty/i })).toBeTruthy();
    const shoppingLink = screen.getByRole("link", { name: /start shopping/i });
    expect(shoppingLink).toBeTruthy();
    expect(shoppingLink.getAttribute("href")).toBe("/products");
  });
});
