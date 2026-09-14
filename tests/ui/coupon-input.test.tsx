import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CouponInput } from "@/components/cart/coupon-input";
import { useCartStore } from "@/store/cart-store";

describe("CouponInput Component (UI)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    useCartStore.setState({
      cart: {
        id: "cart_1",
        userId: "usr_1",
        guestToken: null,
        items: [],
        subtotal: 100.0,
        itemCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      appliedCoupon: null,
      discountTotal: 0,
      couponError: null,
      isApplyingCoupon: false,
    });
  });

  it("renders promo code input and Apply button with accessible labels", () => {
    render(<CouponInput />);

    const input = screen.getByRole("textbox", { name: /promo code/i });
    expect(input).toBeTruthy();
    expect(input.getAttribute("placeholder")).toMatch(/enter promo code/i);

    const button = screen.getByRole("button", { name: /apply/i });
    expect(button).toBeTruthy();
  });

  it("calls validation API when typing code and clicking Apply button", async () => {
    const user = userEvent.setup();

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          valid: true,
          code: "SUMMER20",
          discountType: "PERCENTAGE",
          discountValue: 20,
          discountAmount: 20,
          newTotal: 80,
          minSpend: null,
        },
      }),
    } as any);

    render(<CouponInput />);

    const input = screen.getByRole("textbox", { name: /promo code/i });
    await user.type(input, "summer20");

    const button = screen.getByRole("button", { name: /apply/i });
    await user.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "SUMMER20",
          cartSubtotal: 100,
        }),
      });
    });

    // Store updated with applied coupon
    expect(useCartStore.getState().appliedCoupon?.code).toBe("SUMMER20");
    expect(useCartStore.getState().discountTotal).toBe(20);
  });

  it("disables Apply button when input is empty or contains only whitespace", async () => {
    render(<CouponInput />);

    const button = screen.getByRole("button", { name: /apply/i });
    expect(button.hasAttribute("disabled")).toBe(true);

    const input = screen.getByRole("textbox", { name: /promo code/i });
    fireEvent.change(input, { target: { value: "   " } });
    expect(button.hasAttribute("disabled")).toBe(true);
  });
});
