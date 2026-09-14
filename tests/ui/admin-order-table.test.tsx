import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OrderTable } from "@/components/admin/order-table";
import type { AdminOrder, OrderStatus } from "@/types";

describe("OrderTable Component (UI)", () => {
  const mockOrders: AdminOrder[] = [
    {
      id: "ord_1",
      orderNumber: "ORD-2026-0001",
      userId: "usr_1",
      user: {
        id: "usr_1",
        name: "Alice Johnson",
        email: "alice@example.com",
      },
      guestEmail: null,
      status: "PROCESSING",
      paymentStatus: "PAID",
      stripePaymentId: "pi_12345",
      subtotal: 120 as any,
      discountTotal: 0 as any,
      shippingFee: 5 as any,
      total: 125 as any,
      shippingAddress: {
        name: "Alice Johnson",
        street: "123 Main St",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "US",
        phone: "555-123-4567",
      },
      items: [
        {
          id: "item_1",
          orderId: "ord_1",
          variantId: "var_1",
          unitPrice: 60 as any,
          quantity: 2,
          variant: {
            id: "var_1",
            productId: "prod_1",
            sku: "SKU-PROD-1",
            name: "Default",
            priceDelta: 0 as any,
            stock: 10,
            product: {
              id: "prod_1",
              name: "Wireless Headphones",
              slug: "wireless-headphones",
              description: "Noise cancelling",
              basePrice: 60 as any,
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
      createdAt: new Date("2026-09-14T10:00:00Z"),
      updatedAt: new Date("2026-09-14T10:00:00Z"),
    },
    {
      id: "ord_2",
      orderNumber: "ORD-2026-0002",
      userId: null,
      user: null,
      guestEmail: "guest@example.com",
      status: "DELIVERED",
      paymentStatus: "PAID",
      stripePaymentId: "pi_67890",
      subtotal: 80 as any,
      discountTotal: 0 as any,
      shippingFee: 0 as any,
      total: 80 as any,
      shippingAddress: {
        name: "Bob Smith",
        street: "456 Oak Ave",
        city: "San Francisco",
        state: "CA",
        postalCode: "94101",
        country: "US",
      },
      items: [
        {
          id: "item_2",
          orderId: "ord_2",
          variantId: "var_2",
          unitPrice: 80 as any,
          quantity: 1,
          variant: {
            id: "var_2",
            productId: "prod_2",
            sku: "SKU-PROD-2",
            name: "Black",
            priceDelta: 0 as any,
            stock: 5,
            product: {
              id: "prod_2",
              name: "Mechanical Keyboard",
              slug: "mechanical-keyboard",
              description: "RGB Backlit",
              basePrice: 80 as any,
              categoryId: "cat_1",
              images: [],
              featured: false,
              isArchived: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        },
      ],
      createdAt: new Date("2026-09-13T15:30:00Z"),
      updatedAt: new Date("2026-09-13T15:30:00Z"),
    },
  ];

  it("renders order table headers and rows correctly", () => {
    render(
      <OrderTable
        orders={mockOrders}
        onSelectOrder={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );

    expect(screen.getByText("ORD-2026-0001")).toBeTruthy();
    expect(screen.getByText("Alice Johnson")).toBeTruthy();
    expect(screen.getByText("alice@example.com")).toBeTruthy();
    expect(screen.getByText("ORD-2026-0002")).toBeTruthy();
    expect(screen.getByText("guest@example.com")).toBeTruthy();
  });

  it("renders status filter tabs and triggers onStatusFilterChange", () => {
    const mockFilterChange = vi.fn();
    render(
      <OrderTable
        orders={mockOrders}
        selectedStatus="ALL"
        onStatusFilterChange={mockFilterChange}
        onSelectOrder={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );

    const processingTab = screen.getByRole("button", { name: /^processing/i });
    fireEvent.click(processingTab);

    expect(mockFilterChange).toHaveBeenCalledWith("PROCESSING");
  });

  it("calls onSelectOrder when an order row or view button is clicked", () => {
    const mockSelectOrder = vi.fn();
    render(
      <OrderTable
        orders={mockOrders}
        onSelectOrder={mockSelectOrder}
        onStatusChange={vi.fn()}
      />
    );

    const viewButton = screen.getByRole("button", {
      name: /view details for ord-2026-0001/i,
    });
    fireEvent.click(viewButton);

    expect(mockSelectOrder).toHaveBeenCalledWith(mockOrders[0]);
  });

  it("renders empty state when no orders are provided", () => {
    render(
      <OrderTable
        orders={[]}
        onSelectOrder={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );

    expect(screen.getByText(/No orders found/i)).toBeTruthy();
  });

  it("renders pagination controls and triggers onPageChange", () => {
    const mockPageChange = vi.fn();
    render(
      <OrderTable
        orders={mockOrders}
        total={25}
        page={1}
        limit={10}
        totalPages={3}
        onPageChange={mockPageChange}
        onSelectOrder={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );

    expect(screen.getByText(/Page 1 of 3/i)).toBeTruthy();
    const nextButton = screen.getByRole("button", { name: /next page/i });
    fireEvent.click(nextButton);

    expect(mockPageChange).toHaveBeenCalledWith(2);
  });
});
