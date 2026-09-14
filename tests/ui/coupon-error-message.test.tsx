import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CouponInput } from "@/components/cart/coupon-input";
import { useCartStore } from "@/store/cart-store";

describe("Coupon Input Error Messages (UI)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    useCartStore.setState({
      cart: {
        id: "cart_1",
        userId: "usr_1",
        guestToken: null,
        items: [],
        subtotal: 50.0,
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

  it("displays inline error alert when API returns COUPON_EXPIRED", async () => {
    const user = userEvent.setup();

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        error: {
          code: "COUPON_EXPIRED",
          message: "This coupon has expired",
        },
      }),
    } as any);

    render(<CouponInput />);

    const input = screen.getByRole("textbox", { name: /promo code/i });
    await user.type(input, "EXPIRED10");

    const button = screen.getByRole("button", { name: /apply/i });
    await user.click(button);

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeTruthy();
      expect(alert.textContent).toContain("This coupon has expired");
    });

    expect(useCartStore.getState().appliedCoupon).toBeNull();
    expect(useCartStore.getState().discountTotal).toBe(0);
  });

  it("displays inline error alert when API returns MINIMUM_SPEND_NOT_MET", async () => {
    const user = userEvent.setup();

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        error: {
          code: "MINIMUM_SPEND_NOT_MET",
          message: "Minimum spend of $100.00 required for this coupon",
        },
      }),
    } as any);

    render(<CouponInput />);

    const input = screen.getByRole("textbox", { name: /promo code/i });
    await user.type(input, "BIGDEAL");

    const button = screen.getByRole("button", { name: /apply/i });
    await user.click(button);

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeTruthy();
      expect(alert.textContent).toContain("Minimum spend of $100.00 required");
    });
  });

  it("displays inline error alert when API returns COUPON_NOT_FOUND", async () => {
    const user = userEvent.setup();

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        error: {
          code: "COUPON_NOT_FOUND",
          message: 'Coupon code "FAKECODE" not found',
        },
      }),
    } as any);

    render(<CouponInput />);

    const input = screen.getByRole("textbox", { name: /promo code/i });
    await user.type(input, "FAKECODE");

    const button = screen.getByRole("button", { name: /apply/i });
    await user.click(button);

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeTruthy();
      expect(alert.textContent).toContain('Coupon code "FAKECODE" not found');
    });
  });
});
