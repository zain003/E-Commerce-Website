import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderReceipt } from "@/components/orders/order-receipt";
import { HydratedOrder } from "@/types";
import { Decimal } from "@prisma/client/runtime/library";
import { useCartStore } from "@/store/cart-store";

const mockClearCart = vi.fn();

vi.mock("@/store/cart-store", () => ({
  useCartStore: Object.assign(
    vi.fn(() => ({
      clearCart: mockClearCart,
    })),
    {
      getState: () => ({
        clearCart: mockClearCart,
      }),
    }
  ),
}));

describe("OrderReceipt (UI)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.print = vi.fn();
  });

  const mockDate = new Date("2026-09-13T14:30:00.000Z");

  const mockOrder: HydratedOrder = {
    id: "ord_rec_123",
    orderNumber: "ORD-LZB3K1-A4F2",
    userId: "usr_alice",
    guestEmail: null,
    status: "PROCESSING",
    paymentStatus: "PAID",
    stripePaymentId: "pi_mock_123",
    subtotal: new Decimal("90.00"),
    discountTotal: new Decimal("0.00"),
    shippingFee: new Decimal("5.00"),
    total: new Decimal("95.00"),
    shippingAddress: {
      fullName: "Alice Smith",
      street: "123 Main St",
      city: "Springfield",
      state: "IL",
      postalCode: "62701",
      country: "USA",
      phone: "555-0100",
    },
    items: [
      {
        id: "item_rec_1",
        orderId: "ord_rec_123",
        variantId: "var_crew_black_m",
        quantity: 2,
        unitPrice: new Decimal("45.00"),
        variant: {
          id: "var_crew_black_m",
          productId: "prod_crewneck",
          sku: "CRW-BLK-M",
          name: "Medium / Black",
          priceDelta: new Decimal("0.00"),
          stock: 20,
          product: {
            id: "prod_crewneck",
            name: "Classic Crewneck",
            slug: "classic-crewneck",
            description: "Cotton crewneck sweatshirt",
            basePrice: new Decimal("45.00"),
            categoryId: "cat_apparel",
            images: ["/images/crewneck.jpg"],
            featured: true,
            isArchived: false,
            createdAt: mockDate,
            updatedAt: mockDate,
          },
        },
      },
    ],
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  it("renders order confirmation heading, order number, and status badge", () => {
    render(<OrderReceipt order={mockOrder} />);

    expect(screen.getByText(/thank you for your order/i)).toBeTruthy();
    expect(screen.getByText(/ORD-LZB3K1-A4F2/i)).toBeTruthy();
    expect(screen.getAllByText(/processing/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders itemized line items with quantities, variant names, unit prices, and totals", () => {
    render(<OrderReceipt order={mockOrder} />);

    expect(screen.getByText("Classic Crewneck")).toBeTruthy();
    expect(screen.getByText(/medium \/ black/i)).toBeTruthy();
    expect(screen.getByText(/qty:?\s*2/i)).toBeTruthy();
    expect(screen.getAllByText(/\$45\.00/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/\$90\.00/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders recipient delivery address details", () => {
    render(<OrderReceipt order={mockOrder} />);

    expect(screen.getByText("Alice Smith")).toBeTruthy();
    expect(screen.getByText(/123 Main St/i)).toBeTruthy();
    expect(screen.getByText(/Springfield,?\s*IL\s*62701/i)).toBeTruthy();
    expect(screen.getByText(/555-0100/i)).toBeTruthy();
  });

  it("renders financial summary totals (subtotal, shipping, discount, grand total)", () => {
    render(<OrderReceipt order={mockOrder} />);

    expect(screen.getAllByText(/\$90\.00/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/\$5\.00/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/\$95\.00/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders order status progress tracker steps", () => {
    render(<OrderReceipt order={mockOrder} />);

    expect(screen.getByText(/confirmed/i)).toBeTruthy();
    expect(screen.getAllByText(/processing/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/shipped/i)).toBeTruthy();
    expect(screen.getAllByText(/delivered/i).length).toBeGreaterThanOrEqual(1);
  });

  it("calls window.print when clicking Print Receipt button", async () => {
    const user = userEvent.setup();
    render(<OrderReceipt order={mockOrder} />);

    const printButton = screen.getByRole("button", { name: /print receipt/i });
    expect(printButton).toBeTruthy();
    await user.click(printButton);

    expect(window.print).toHaveBeenCalledTimes(1);
  });

  it("renders Continue Shopping link pointing to /products", () => {
    render(<OrderReceipt order={mockOrder} />);

    const continueLink = screen.getByRole("link", { name: /continue shopping/i });
    expect(continueLink).toBeTruthy();
    expect(continueLink.getAttribute("href")).toBe("/products");
  });

  it("clears the client shopping cart on order confirmation view", () => {
    render(<OrderReceipt order={mockOrder} />);
    expect(mockClearCart).toHaveBeenCalled();
  });

  it("renders fallback placeholder icon when product has no image", () => {
    const orderWithoutImage: HydratedOrder = {
      ...mockOrder,
      items: [
        {
          ...mockOrder.items[0],
          variant: {
            ...mockOrder.items[0].variant,
            product: {
              ...mockOrder.items[0].variant.product,
              images: [],
            },
          },
        },
      ],
    };

    render(<OrderReceipt order={orderWithoutImage} />);
    expect(screen.getByTestId("order-item-placeholder")).toBeTruthy();
  });
});
