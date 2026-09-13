import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheckoutWizard } from "@/components/checkout/checkout-wizard";
import { CheckoutPreview } from "@/types";

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
      quantity: 2,
      createdAt: new Date(),
      variant: {
        id: "var-1",
        productId: "prod-1",
        sku: "PROD-M-BLK",
        name: "Medium / Black",
        priceDelta: "0.00" as any,
        stock: 10,
        product: {
          id: "prod-1",
          name: "Classic Tee",
          slug: "classic-tee",
          description: "Comfortable cotton tee",
          basePrice: "25.00" as any,
          categoryId: "cat-1",
          images: ["/test-image.jpg"],
          featured: true,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    },
  ],
  subtotal: 50.0,
  shippingFee: 5.0,
  discountTotal: 0.0,
  total: 55.0,
  availableShippingMethods: [
    {
      id: "STANDARD",
      name: "Standard Delivery",
      price: 5.0,
      estimatedDays: "3-5 Business Days",
    },
    {
      id: "EXPRESS",
      name: "Express Delivery",
      price: 15.0,
      estimatedDays: "1-2 Business Days",
    },
  ],
};

describe("Checkout Navigation & Wizard Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    // Default fetch mock returning successful validation
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/checkout/validate")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            data: { valid: true, preview: mockPreview },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ success: true, data: mockPreview }),
      });
    });
  });

  it("renders multi-step progress indicator and security badges", () => {
    render(
      <CheckoutWizard
        isGuest={true}
        initialPreview={mockPreview}
      />
    );

    expect(screen.getByText(/1. Address/i)).toBeTruthy();
    expect(screen.getByText(/2. Delivery/i)).toBeTruthy();
    expect(screen.getByText(/3. Review/i)).toBeTruthy();

    expect(screen.getByText(/256-bit Encrypted Checkout/i)).toBeTruthy();
  });

  it("prevents proceeding to Step 2 without completing required address fields", async () => {
    const user = userEvent.setup();

    render(
      <CheckoutWizard
        isGuest={true}
        initialPreview={mockPreview}
      />
    );

    const continueBtn = screen.getByRole("button", { name: /continue to delivery/i });
    await user.click(continueBtn);

    // Should stay on step 1 and show validation error
    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeTruthy();
    });

    // Delivery options should not be visible yet
    expect(screen.queryByText(/express delivery/i)).toBeNull();
  });

  it("advances from Step 1 to Step 2 upon valid address submission", async () => {
    const user = userEvent.setup();

    render(
      <CheckoutWizard
        isGuest={true}
        initialPreview={mockPreview}
      />
    );

    await user.type(screen.getByLabelText(/email address/i), "buyer@example.com");
    await user.type(screen.getByLabelText(/full name/i), "Sarah Connor");
    await user.type(screen.getByLabelText(/street address/i), "100 Cyber Way");
    await user.type(screen.getByLabelText(/city/i), "Los Angeles");
    await user.type(screen.getByLabelText(/state/i), "CA");
    await user.type(screen.getByLabelText(/postal/i), "90001");
    await user.type(screen.getByLabelText(/country/i), "USA");
    await user.type(screen.getByLabelText(/phone/i), "+1 (213) 555-0199");

    const continueBtn = screen.getByRole("button", { name: /continue to delivery/i });
    await user.click(continueBtn);

    // Should transition to step 2
    await waitFor(() => {
      expect(screen.getByText(/standard delivery/i)).toBeTruthy();
      expect(screen.getByText(/express delivery/i)).toBeTruthy();
    });
  });

  it("updates order summary total dynamically when selecting Express Delivery", async () => {
    const user = userEvent.setup();

    render(
      <CheckoutWizard
        isGuest={true}
        initialPreview={mockPreview}
      />
    );

    // Fill address to reach step 2
    await user.type(screen.getByLabelText(/email address/i), "buyer@example.com");
    await user.type(screen.getByLabelText(/full name/i), "Sarah Connor");
    await user.type(screen.getByLabelText(/street address/i), "100 Cyber Way");
    await user.type(screen.getByLabelText(/city/i), "Los Angeles");
    await user.type(screen.getByLabelText(/state/i), "CA");
    await user.type(screen.getByLabelText(/postal/i), "90001");
    await user.type(screen.getByLabelText(/country/i), "USA");
    await user.type(screen.getByLabelText(/phone/i), "+12135550199");

    await user.click(screen.getByRole("button", { name: /continue to delivery/i }));

    // Verify initial total ($50 subtotal + $5 standard shipping = $55.00)
    await waitFor(() => {
      expect(screen.getByTestId("checkout-total").textContent).toContain("$55.00");
    });

    // Select Express Delivery ($15.00)
    const expressRadio = screen.getByLabelText(/express delivery/i);
    await user.click(expressRadio);

    // Total should immediately update to $65.00 ($50 subtotal + $15 express shipping)
    await waitFor(() => {
      expect(screen.getByTestId("checkout-total").textContent).toContain("$65.00");
    });
  });

  it("preserves previously entered address data when navigating back from Step 2", async () => {
    const user = userEvent.setup();

    render(
      <CheckoutWizard
        isGuest={true}
        initialPreview={mockPreview}
      />
    );

    await user.type(screen.getByLabelText(/email address/i), "buyer@example.com");
    await user.type(screen.getByLabelText(/full name/i), "Sarah Connor");
    await user.type(screen.getByLabelText(/street address/i), "100 Cyber Way");
    await user.type(screen.getByLabelText(/city/i), "Los Angeles");
    await user.type(screen.getByLabelText(/state/i), "CA");
    await user.type(screen.getByLabelText(/postal/i), "90001");
    await user.type(screen.getByLabelText(/country/i), "USA");
    await user.type(screen.getByLabelText(/phone/i), "+12135550199");

    await user.click(screen.getByRole("button", { name: /continue to delivery/i }));

    // Step 2 is active
    await waitFor(() => {
      expect(screen.getByText(/standard delivery/i)).toBeTruthy();
    });

    // Click "Back to Address"
    const backBtn = screen.getByRole("button", { name: /back to address/i });
    await user.click(backBtn);

    // Step 1 should be active again with preserved values
    await waitFor(() => {
      expect((screen.getByLabelText(/full name/i) as HTMLInputElement).value).toBe(
        "Sarah Connor"
      );
      expect(
        (screen.getByLabelText(/street address/i) as HTMLInputElement).value
      ).toBe("100 Cyber Way");
      expect((screen.getByLabelText(/email address/i) as HTMLInputElement).value).toBe(
        "buyer@example.com"
      );
    });
  });

  it("navigates to Step 3 (Review) and executes session validation on Proceed to Payment", async () => {
    const user = userEvent.setup();

    render(
      <CheckoutWizard
        isGuest={true}
        initialPreview={mockPreview}
      />
    );

    // Fill Step 1
    await user.type(screen.getByLabelText(/email address/i), "buyer@example.com");
    await user.type(screen.getByLabelText(/full name/i), "Sarah Connor");
    await user.type(screen.getByLabelText(/street address/i), "100 Cyber Way");
    await user.type(screen.getByLabelText(/city/i), "Los Angeles");
    await user.type(screen.getByLabelText(/state/i), "CA");
    await user.type(screen.getByLabelText(/postal/i), "90001");
    await user.type(screen.getByLabelText(/country/i), "USA");
    await user.type(screen.getByLabelText(/phone/i), "+12135550199");

    await user.click(screen.getByRole("button", { name: /continue to delivery/i }));

    // Step 2: Click "Continue to Review"
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /continue to review/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /continue to review/i }));

    // Step 3 (Review)
    await waitFor(() => {
      expect(screen.getByText(/order review/i)).toBeTruthy();
      expect(screen.getByText("Sarah Connor")).toBeTruthy();
      expect(screen.getByText(/100 Cyber Way/i)).toBeTruthy();
    });

    // Click "Proceed to Payment"
    const payBtn = screen.getByRole("button", { name: /proceed to payment/i });
    await user.click(payBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/checkout/validate",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });

  it("redirects to /cart if the cart is empty", () => {
    const emptyPreview: CheckoutPreview = {
      items: [],
      subtotal: 0,
      shippingFee: 0,
      discountTotal: 0,
      total: 0,
      availableShippingMethods: [],
    };

    render(
      <CheckoutWizard
        isGuest={true}
        initialPreview={emptyPreview}
      />
    );

    expect(mockPush).toHaveBeenCalledWith("/cart");
  });
});
