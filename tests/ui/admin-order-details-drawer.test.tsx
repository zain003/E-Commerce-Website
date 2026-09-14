import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OrderDetailsDrawer } from "@/components/admin/order-details-drawer";
import type { AdminOrder } from "@/types";

describe("OrderDetailsDrawer Component (UI)", () => {
  const mockOrder: AdminOrder = {
    id: "ord_101",
    orderNumber: "ORD-2026-9999",
    userId: "usr_1",
    user: {
      id: "usr_1",
      name: "Emma Watson",
      email: "emma@example.com",
    },
    guestEmail: null,
    status: "PROCESSING",
    paymentStatus: "PAID",
    stripePaymentId: "pi_test_9999",
    subtotal: 199.98 as any,
    discountTotal: 20.0 as any,
    shippingFee: 5.0 as any,
    total: 184.98 as any,
    shippingAddress: {
      name: "Emma Watson",
      street: "742 Evergreen Terrace",
      city: "Springfield",
      state: "OR",
      postalCode: "97477",
      country: "US",
      phone: "+1-555-0199",
    },
    items: [
      {
        id: "item_101",
        orderId: "ord_101",
        variantId: "var_101",
        unitPrice: 99.99 as any,
        quantity: 2,
        variant: {
          id: "var_101",
          productId: "prod_101",
          sku: "SKU-KEY-BLUE",
          name: "Blue Switch",
          priceDelta: 0 as any,
          stock: 12,
          product: {
            id: "prod_101",
            name: "Mechanical Keyboard Pro",
            slug: "mechanical-keyboard-pro",
            description: "Pro mechanical keyboard",
            basePrice: 99.99 as any,
            categoryId: "cat_1",
            images: [],
            featured: true,
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      },
    ],
    createdAt: new Date("2026-09-14T12:00:00Z"),
    updatedAt: new Date("2026-09-14T12:00:00Z"),
  };

  it("does not render when isOpen is false or order is null", () => {
    const { container } = render(
      <OrderDetailsDrawer
        isOpen={false}
        order={null}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders order details, customer info, and shipping address when open", () => {
    render(
      <OrderDetailsDrawer
        isOpen={true}
        order={mockOrder}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );

    expect(screen.getByText("ORD-2026-9999")).toBeTruthy();
    expect(screen.getAllByText("Emma Watson").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("emma@example.com")).toBeTruthy();
    expect(screen.getByText("742 Evergreen Terrace")).toBeTruthy();
    expect(screen.getByText(/Springfield, OR 97477/i)).toBeTruthy();
    expect(screen.getByText("+1-555-0199")).toBeTruthy();
  });

  it("renders purchased line items with SKU, quantity, and unit price", () => {
    render(
      <OrderDetailsDrawer
        isOpen={true}
        order={mockOrder}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );

    expect(screen.getByText("Mechanical Keyboard Pro")).toBeTruthy();
    expect(screen.getByText(/SKU-KEY-BLUE/i)).toBeTruthy();
    expect(screen.getByText(/Qty:\s*2/i)).toBeTruthy();
  });

  it("renders monetary calculations (subtotal, shipping, discount, total)", () => {
    render(
      <OrderDetailsDrawer
        isOpen={true}
        order={mockOrder}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );

    expect(screen.getAllByText("$199.98").length).toBeGreaterThanOrEqual(1); // line total & subtotal
    expect(screen.getByText("$5.00")).toBeTruthy(); // shipping
    expect(screen.getByText("-$20.00")).toBeTruthy(); // discount
    expect(screen.getByText("$184.98")).toBeTruthy(); // total
  });

  it("calls onClose when close button is clicked", () => {
    const mockClose = vi.fn();
    render(
      <OrderDetailsDrawer
        isOpen={true}
        order={mockOrder}
        onClose={mockClose}
        onStatusChange={vi.fn()}
      />
    );

    const closeBtn = screen.getByRole("button", { name: /close order details/i });
    fireEvent.click(closeBtn);

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    const mockClose = vi.fn();
    render(
      <OrderDetailsDrawer
        isOpen={true}
        order={mockOrder}
        onClose={mockClose}
        onStatusChange={vi.fn()}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });

    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
