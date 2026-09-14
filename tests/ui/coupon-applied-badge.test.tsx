import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CouponInput } from "@/components/cart/coupon-input";
import { CartSummary } from "@/components/cart/cart-summary";
import { useCartStore } from "@/store/cart-store";

describe("Applied Coupon Badge & Cart Summary Deduction (UI)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.setState({
      cart: {
        id: "cart_1",
        userId: "usr_1",
        guestToken: null,
        items: [],
        subtotal: 100.0,
        itemCount: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      appliedCoupon: {
        valid: true,
        code: "SAVE20",
        discountType: "PERCENTAGE",
        discountValue: 20,
        discountAmount: 20.0,
        newTotal: 80.0,
        minSpend: null,
      },
      discountTotal: 20.0,
      couponError: null,
      isApplyingCoupon: false,
    });
  });

  it("renders applied coupon badge with code, discount details, and remove button", () => {
    render(<CouponInput />);

    expect(screen.getByText("SAVE20")).toBeTruthy();
    expect(screen.getByText(/20% off/i)).toBeTruthy();

    const removeBtn = screen.getByRole("button", { name: /remove coupon/i });
    expect(removeBtn).toBeTruthy();
  });

  it("removes applied coupon from store and resets discount when clicking remove button", () => {
    render(<CouponInput />);

    const removeBtn = screen.getByRole("button", { name: /remove coupon/i });
    fireEvent.click(removeBtn);

    expect(useCartStore.getState().appliedCoupon).toBeNull();
    expect(useCartStore.getState().discountTotal).toBe(0);
  });

  it("renders green discount deduction line item in CartSummary and adjusts estimated total", () => {
    render(<CartSummary subtotal={100.0} itemCount={2} />);

    // Subtotal: $100.00
    expect(screen.getByTestId("cart-subtotal").textContent).toBe("$100.00");

    // Discount: -$20.00
    const discountEl = screen.getByTestId("discount-amount");
    expect(discountEl).toBeTruthy();
    expect(discountEl.textContent).toBe("-$20.00");

    // Estimated Total: $80.00
    expect(screen.getByTestId("cart-estimated-total").textContent).toBe("$80.00");
  });
});
