import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/auth/login-form";
import { useCartStore } from "@/store/cart-store";

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  useSearchParams: () => ({
    get: () => null,
  }),
}));

const mockSignIn = vi.fn();
vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

describe("Guest Cart Merge on Login (ISSUE-007)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.setState({
      cart: null,
      isLoading: false,
      isOpen: false,
    });
  });

  it("calls POST /api/cart/merge and updates cart store upon successful login", async () => {
    mockSignIn.mockResolvedValueOnce({ ok: true, error: null });

    const mergedCartData = {
      id: "cart_user_123",
      userId: "usr_123",
      guestToken: null,
      subtotal: 99.99,
      itemCount: 2,
      items: [
        {
          id: "item_merged_1",
          cartId: "cart_user_123",
          variantId: "var_1",
          quantity: 2,
          unitPrice: 49.995,
          totalPrice: 99.99,
          variant: {
            id: "var_1",
            productId: "prod_1",
            name: "Default",
            priceDelta: 0,
            stock: 10,
            product: {
              id: "prod_1",
              name: "Merged Product",
              slug: "merged-product",
              basePrice: 49.995,
              images: [],
              category: { id: "cat_1", name: "General", slug: "general" },
            },
          },
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mergedCartData,
        timestamp: new Date().toISOString(),
      }),
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "customer@example.com");
    await user.type(passwordInput, "SecurePassword123!");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        redirect: false,
        email: "customer@example.com",
        password: "SecurePassword123!",
      });
      expect(global.fetch).toHaveBeenCalledWith("/api/cart/merge", expect.objectContaining({
        method: "POST",
      }));
      expect(useCartStore.getState().cart?.id).toBe("cart_user_123");
      expect(useCartStore.getState().cart?.itemCount).toBe(2);
      expect(mockPush).toHaveBeenCalledWith("/account/profile");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
