import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { StripePaymentForm } from "@/components/checkout/stripe-payment-form";
import { CheckoutWizard } from "@/components/checkout/checkout-wizard";
import { CheckoutPreview } from "@/types";

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
      <input data-testid="mock-card-number" placeholder="Card number" readOnly />
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

const mockPreview: CheckoutPreview = {
  items: [
    {
      id: "item-1",
      cartId: "cart-1",
      variantId: "var-1",
      quantity: 1,
      createdAt: new Date(),
      variant: {
        id: "var-1",
        productId: "prod-1",
        sku: "TEST-SKU",
        name: "Standard",
        priceDelta: "0.00" as any,
        stock: 5,
        product: {
          id: "prod-1",
          name: "Test Shirt",
          slug: "test-shirt",
          description: "A test shirt",
          basePrice: "40.00" as any,
          categoryId: "cat-1",
          images: ["/shirt.jpg"],
          featured: true,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    },
  ],
  subtotal: 40.0,
  shippingFee: 5.0,
  discountTotal: 0.0,
  total: 45.0,
  availableShippingMethods: [
    {
      id: "STANDARD",
      name: "Standard Delivery",
      price: 5.0,
      estimatedDays: "3-5 Business Days",
    },
  ],
};

describe("Stripe Payment Error Display & State Preservation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("displays accessible error alert when card is declined and re-enables Pay button", async () => {
    const user = userEvent.setup();

    mockConfirmPayment.mockResolvedValue({
      error: {
        type: "card_error",
        code: "card_declined",
        message: "Your card was declined by your bank.",
      },
    });

    render(
      <StripePaymentForm
        amount={45.0}
        paymentIntentId="pi_declined"
      />
    );

    const payButton = screen.getByRole("button", { name: /pay \$45\.00/i });
    await user.click(payButton);

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeTruthy();
      expect(alert.textContent).toContain("Your card was declined by your bank.");
      // Pay button must be re-enabled for customer to retry
      expect(payButton.hasAttribute("disabled")).toBe(false);
      expect(screen.queryByText(/processing payment/i)).toBeNull();
    });
  });

  it("displays validation error alert on invalid expiration date or CVC", async () => {
    const user = userEvent.setup();

    mockConfirmPayment.mockResolvedValue({
      error: {
        type: "validation_error",
        code: "invalid_expiry_year",
        message: "Your card's expiration year is invalid.",
      },
    });

    render(
      <StripePaymentForm
        amount={45.0}
        paymentIntentId="pi_invalid_cvc"
      />
    );

    const payButton = screen.getByRole("button", { name: /pay \$45\.00/i });
    await user.click(payButton);

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeTruthy();
      expect(alert.textContent).toContain("Your card's expiration year is invalid.");
      expect(payButton.hasAttribute("disabled")).toBe(false);
    });
  });

  it("displays retry prompt upon network connection interruption", async () => {
    const user = userEvent.setup();

    mockConfirmPayment.mockResolvedValue({
      error: {
        type: "api_connection_error",
        message: "Network connection lost. Please verify your connection and try again.",
      },
    });

    render(
      <StripePaymentForm
        amount={45.0}
        paymentIntentId="pi_network_err"
      />
    );

    const payButton = screen.getByRole("button", { name: /pay \$45\.00/i });
    await user.click(payButton);

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeTruthy();
      expect(alert.textContent).toContain("Network connection lost");
      expect(payButton.hasAttribute("disabled")).toBe(false);
    });
  });

  it("preserves previously completed address steps when payment encounters decline in CheckoutWizard", async () => {
    const user = userEvent.setup();

    // Mock payment intent creation API
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/checkout/validate")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, data: { valid: true, preview: mockPreview } }),
        });
      }
      if (url.includes("/api/payments/create-intent")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: {
              clientSecret: "pi_test_secret_123",
              paymentIntentId: "pi_test_123",
              amount: 4500,
              currency: "usd",
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, data: mockPreview }),
      });
    });

    mockConfirmPayment.mockResolvedValue({
      error: {
        type: "card_error",
        message: "Insufficient funds in your account.",
      },
    });

    render(
      <CheckoutWizard
        isGuest={true}
        initialPreview={mockPreview}
      />
    );

    // Fill Step 1 Address
    await user.type(screen.getByLabelText(/email address/i), "john.doe@example.com");
    await user.type(screen.getByLabelText(/full name/i), "John Doe");
    await user.type(screen.getByLabelText(/street address/i), "742 Evergreen Terrace");
    await user.type(screen.getByLabelText(/city/i), "Springfield");
    await user.type(screen.getByLabelText(/state/i), "OR");
    await user.type(screen.getByLabelText(/postal/i), "97477");
    await user.type(screen.getByLabelText(/country/i), "USA");
    await user.type(screen.getByLabelText(/phone/i), "+15551234567");

    await user.click(screen.getByRole("button", { name: /continue to delivery/i }));

    // Step 2 Delivery
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /continue to review/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /continue to review/i }));

    // Step 3 Review -> Proceed to Payment
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /proceed to payment/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /proceed to payment/i }));

    // Stripe payment form appears
    await waitFor(() => {
      expect(screen.getByTestId("payment-element")).toBeTruthy();
    });

    const payBtn = screen.getByRole("button", { name: /pay \$45\.00/i });
    await user.click(payBtn);

    // Payment error alert appears
    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert.textContent).toContain("Insufficient funds in your account.");
    });

    // Verify previously filled shipping destination remains displayed
    expect(screen.getByText("John Doe")).toBeTruthy();
    expect(screen.getByText(/742 Evergreen Terrace/i)).toBeTruthy();
    expect(screen.getByText(/Springfield, OR 97477/i)).toBeTruthy();
    expect(screen.getByText(/Phone: \+15551234567/i)).toBeTruthy();
  });
});
