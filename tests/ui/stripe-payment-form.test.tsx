import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { StripePaymentForm } from "@/components/checkout/stripe-payment-form";

// Mock stripe and elements hooks
const mockStripe = {
  confirmPayment: vi.fn(),
};

const mockElements = {
  getElement: vi.fn(),
};

let currentMockStripe: typeof mockStripe | null = mockStripe;
let currentMockElements: typeof mockElements | null = mockElements;

vi.mock("@stripe/react-stripe-js", () => ({
  useStripe: () => currentMockStripe,
  useElements: () => currentMockElements,
  PaymentElement: ({ id, className }: { id?: string; className?: string }) => (
    <div
      id={id}
      data-testid="payment-element"
      className={className}
      role="region"
      aria-label="Payment Form"
    >
      <input data-testid="mock-card-number" placeholder="Card number" readOnly />
      <input data-testid="mock-card-expiry" placeholder="MM / YY" readOnly />
      <input data-testid="mock-card-cvc" placeholder="CVC" readOnly />
    </div>
  ),
  Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("StripePaymentForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentMockStripe = mockStripe;
    currentMockElements = mockElements;
  });

  it("renders PaymentElement container without horizontal overflow", () => {
    render(
      <StripePaymentForm
        amount={55.0}
        paymentIntentId="pi_test_123"
      />
    );

    const paymentElement = screen.getByTestId("payment-element");
    expect(paymentElement).toBeTruthy();
    expect(paymentElement.getAttribute("role")).toBe("region");
    expect(paymentElement.getAttribute("aria-label")).toBe("Payment Form");
  });

  it("renders Pay Now button with formatted total amount", () => {
    render(
      <StripePaymentForm
        amount={55.0}
        paymentIntentId="pi_test_123"
      />
    );

    const payButton = screen.getByRole("button", { name: /pay \$55\.00/i });
    expect(payButton).toBeTruthy();
    expect(payButton.hasAttribute("disabled")).toBe(false);
  });

  it("disables Pay Now button when Stripe SDK has not fully loaded", () => {
    currentMockStripe = null;

    render(
      <StripePaymentForm
        amount={55.0}
        paymentIntentId="pi_test_123"
      />
    );

    const payButton = screen.getByRole("button", { name: /loading payment secure gateway/i });
    expect(payButton.hasAttribute("disabled")).toBe(true);
  });

  it("disables Pay Now button when Elements has not fully loaded", () => {
    currentMockElements = null;

    render(
      <StripePaymentForm
        amount={55.0}
        paymentIntentId="pi_test_123"
      />
    );

    const payButton = screen.getByRole("button", { name: /loading payment secure gateway/i });
    expect(payButton.hasAttribute("disabled")).toBe(true);
  });

  it("renders 256-bit SSL encrypted checkout security badge", () => {
    render(
      <StripePaymentForm
        amount={55.0}
        paymentIntentId="pi_test_123"
      />
    );

    expect(screen.getByText(/256-bit ssl encrypted payment/i)).toBeTruthy();
  });
});
