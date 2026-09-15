import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { StripePaymentForm } from "@/components/checkout/stripe-payment-form";

const mockConfirmPayment = vi.fn();
const mockElements = {
  getElement: vi.fn(),
};

const mockStripe = {
  confirmPayment: mockConfirmPayment,
};

vi.mock("@stripe/react-stripe-js", () => ({
  useStripe: () => mockStripe,
  useElements: () => mockElements,
  PaymentElement: ({ id, className }: { id?: string; className?: string }) => (
    <div id={id} data-testid="payment-element" className={className}>
      <input data-testid="mock-card" placeholder="Card details" readOnly />
    </div>
  ),
  Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("Stripe Payment Processing State", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("disables Pay button and displays loading spinner while submitting payment", async () => {
    const user = userEvent.setup();

    // Create a pending promise to simulate in-flight payment confirmation
    let resolvePayment: (val: any) => void;
    mockConfirmPayment.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePayment = resolve;
        })
    );

    render(
      <StripePaymentForm
        amount={75.0}
        paymentIntentId="pi_test_processing"
      />
    );

    const payButton = screen.getByRole("button", { name: /pay \$75\.00/i });
    expect(payButton.hasAttribute("disabled")).toBe(false);
    expect(screen.queryByText(/processing payment/i)).toBeNull();
    expect(screen.queryByText(/loading payment/i)).toBeNull();
    expect(document.querySelector(".animate-spin")).toBeNull();

    // Submit payment
    await user.click(payButton);

    // Verify button is now disabled and displays processing indicator
    await waitFor(() => {
      expect(payButton.hasAttribute("disabled")).toBe(true);
      expect(payButton.getAttribute("aria-busy")).toBe("true");
      expect(screen.getByText(/processing payment\.\.\./i)).toBeTruthy();
      expect(document.querySelector(".animate-spin")).toBeTruthy();
    });

    // Resolve payment
    resolvePayment!({
      paymentIntent: {
        id: "pi_test_processing",
        status: "succeeded",
      },
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("/order-confirmation?orderNumber=pi_test_processing")
      );
    });
  });

  it("invokes stripe.confirmPayment with correct elements, confirmParams, and redirect mode", async () => {
    const user = userEvent.setup();

    mockConfirmPayment.mockResolvedValue({
      paymentIntent: {
        id: "pi_test_456",
        status: "succeeded",
      },
    });

    render(
      <StripePaymentForm
        amount={99.99}
        paymentIntentId="pi_test_456"
      />
    );

    const payButton = screen.getByRole("button", { name: /pay \$99\.99/i });
    await user.click(payButton);

    await waitFor(() => {
      expect(mockConfirmPayment).toHaveBeenCalledTimes(1);
      expect(mockConfirmPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          elements: mockElements,
          redirect: "if_required",
          confirmParams: expect.objectContaining({
            return_url: expect.stringContaining("/order-confirmation"),
          }),
        })
      );
    });
  });

  it("prevents double-submission when user rapidly clicks Pay button", async () => {
    const user = userEvent.setup();

    let resolvePayment: (val: any) => void;
    mockConfirmPayment.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePayment = resolve;
        })
    );

    render(
      <StripePaymentForm
        amount={50.0}
        paymentIntentId="pi_test_double_click"
      />
    );

    const payButton = screen.getByRole("button", { name: /pay \$50\.00/i });

    // Click twice rapidly
    await user.click(payButton);
    await user.click(payButton);

    expect(mockConfirmPayment).toHaveBeenCalledTimes(1);

    resolvePayment!({
      paymentIntent: {
        id: "pi_test_double_click",
        status: "succeeded",
      },
    });
  });
});
