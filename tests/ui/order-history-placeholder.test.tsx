import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderHistoryCard } from "@/components/orders/order-history-card";
import { HydratedOrder } from "@/types";
import { Decimal } from "@prisma/client/runtime/library";

describe("OrderHistoryCard Placeholder Fallback (UI)", () => {
  const mockDate = new Date("2026-09-13T14:30:00.000Z");

  const mockOrder: HydratedOrder = {
    id: "ord_hist_1",
    orderNumber: "ORD-HIST-001",
    userId: "usr_alice",
    guestEmail: null,
    status: "PROCESSING",
    paymentStatus: "PAID",
    stripePaymentId: "pi_hist_1",
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
        id: "item_hist_1",
        orderId: "ord_hist_1",
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
            slug: "classic-crewneck",
            description: "A timeless crewneck sweatshirt.",
            basePrice: new Decimal("45.00"),
            categoryId: "cat_sweatshirts",
            images: [], // No images provided
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

  it("renders clean fallback placeholder in compact thumbnails when images are missing", () => {
    render(<OrderHistoryCard order={mockOrder} />);
    expect(screen.getByTestId("order-item-placeholder-compact")).toBeTruthy();
  });

  it("renders clean fallback placeholder in expanded item breakdown when images are missing", async () => {
    const user = userEvent.setup();
    render(<OrderHistoryCard order={mockOrder} />);

    // Click to expand card details
    const expandButton = screen.getByRole("button", { name: /view details/i });
    await user.click(expandButton);

    expect(screen.getByTestId("order-item-placeholder-breakdown")).toBeTruthy();
  });

  it("links compact thumbnail to PDP when slug exists", () => {
    render(<OrderHistoryCard order={mockOrder} />);
    const link = screen.getByTitle(/classic crewneck/i);
    expect(link.tagName.toLowerCase()).toBe("a");
    expect(link.getAttribute("href")).toBe("/products/classic-crewneck");
  });

  it("links item title and thumbnail in expanded breakdown to PDP", async () => {
    const user = userEvent.setup();
    render(<OrderHistoryCard order={mockOrder} />);

    const expandButton = screen.getByRole("button", { name: /view details/i });
    await user.click(expandButton);

    const titleLinks = screen.getAllByRole("link", { name: /classic crewneck/i });
    expect(titleLinks.length).toBeGreaterThanOrEqual(1);
    expect(titleLinks.every((l) => l.getAttribute("href") === "/products/classic-crewneck")).toBe(true);
  });

  it("gracefully falls back to non-clickable element when product slug is missing", () => {
    const orderWithoutSlug: HydratedOrder = {
      ...mockOrder,
      items: [
        {
          ...mockOrder.items[0],
          variant: {
            ...mockOrder.items[0].variant,
            product: {
              ...mockOrder.items[0].variant.product,
              slug: "",
            },
          },
        },
      ],
    };

    render(<OrderHistoryCard order={orderWithoutSlug} />);
    const thumb = screen.getByTitle(/classic crewneck/i);
    expect(thumb.tagName.toLowerCase()).toBe("div");
  });
});
