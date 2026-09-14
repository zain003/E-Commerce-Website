import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderHistoryCard } from "@/components/orders/order-history-card";
import { HydratedOrder } from "@/types";
import { Decimal } from "@prisma/client/runtime/library";

describe("OrderHistoryCard Write Review CTA (UI)", () => {
  const mockDate = new Date("2026-09-13T14:30:00.000Z");

  const createMockOrder = (status: any, slug: string = "classic-crewneck"): HydratedOrder => ({
    id: "ord_rev_1",
    orderNumber: "ORD-REV-001",
    userId: "usr_alice",
    guestEmail: null,
    status,
    paymentStatus: "PAID",
    stripePaymentId: "pi_rev_1",
    subtotal: new Decimal("45.00"),
    discountTotal: new Decimal("0.00"),
    shippingFee: new Decimal("5.00"),
    total: new Decimal("50.00"),
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
        id: "item_rev_1",
        orderId: "ord_rev_1",
        variantId: "var_1",
        quantity: 1,
        unitPrice: new Decimal("45.00"),
        variant: {
          id: "var_1",
          productId: "prod_1",
          sku: "SKU-1",
          name: "Medium / Black",
          priceDelta: new Decimal("0.00"),
          stock: 10,
          product: {
            id: "prod_1",
            name: "Classic Crewneck",
            slug,
            description: "A timeless crewneck sweatshirt.",
            basePrice: new Decimal("45.00"),
            categoryId: "cat_sweatshirts",
            images: ["/test.png"],
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
  });

  it("renders 'Write Review' CTA linking to /products/[slug]#reviews when order is DELIVERED", async () => {
    const user = userEvent.setup();
    const deliveredOrder = createMockOrder("DELIVERED");
    render(<OrderHistoryCard order={deliveredOrder} />);

    // Expand details
    const expandButton = screen.getByRole("button", { name: /view details/i });
    await user.click(expandButton);

    const reviewCta = screen.getByRole("link", { name: /write review/i });
    expect(reviewCta).toBeTruthy();
    expect(reviewCta.getAttribute("href")).toBe("/products/classic-crewneck#reviews");
  });

  it("does NOT render 'Write Review' CTA when order status is PROCESSING or pending", async () => {
    const user = userEvent.setup();
    const processingOrder = createMockOrder("PROCESSING");
    render(<OrderHistoryCard order={processingOrder} />);

    const expandButton = screen.getByRole("button", { name: /view details/i });
    await user.click(expandButton);

    expect(screen.queryByRole("link", { name: /write review/i })).toBeNull();
  });

  it("does NOT render 'Write Review' CTA when order status is CANCELLED", async () => {
    const user = userEvent.setup();
    const cancelledOrder = createMockOrder("CANCELLED");
    render(<OrderHistoryCard order={cancelledOrder} />);

    const expandButton = screen.getByRole("button", { name: /view details/i });
    await user.click(expandButton);

    expect(screen.queryByRole("link", { name: /write review/i })).toBeNull();
  });

  it("does NOT render 'Write Review' CTA when product slug is missing", async () => {
    const user = userEvent.setup();
    const deliveredWithoutSlug = createMockOrder("DELIVERED", "");
    render(<OrderHistoryCard order={deliveredWithoutSlug} />);

    const expandButton = screen.getByRole("button", { name: /view details/i });
    await user.click(expandButton);

    expect(screen.queryByRole("link", { name: /write review/i })).toBeNull();
  });
});
