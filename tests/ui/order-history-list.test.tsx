import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderHistoryList } from "@/components/orders/order-history-list";
import { HydratedOrder } from "@/types";
import { Decimal } from "@prisma/client/runtime/library";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/account/orders",
  useSearchParams: () => new URLSearchParams(),
}));

describe("OrderHistoryList (UI)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDate1 = new Date("2026-09-12T10:00:00.000Z");
  const mockDate2 = new Date("2026-09-10T14:00:00.000Z");

  const mockOrders: HydratedOrder[] = [
    {
      id: "ord_hist_1",
      orderNumber: "ORD-HIST-001",
      userId: "usr_alice",
      guestEmail: null,
      status: "PROCESSING",
      paymentStatus: "PAID",
      stripePaymentId: "pi_hist_1",
      subtotal: new Decimal("120.00"),
      discountTotal: new Decimal("0.00"),
      shippingFee: new Decimal("0.00"),
      total: new Decimal("120.00"),
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
          id: "item_h1",
          orderId: "ord_hist_1",
          variantId: "var_h1",
          quantity: 1,
          unitPrice: new Decimal("120.00"),
          variant: {
            id: "var_h1",
            productId: "prod_h1",
            sku: "PROD-H1",
            name: "Default",
            priceDelta: new Decimal("0.00"),
            stock: 10,
            product: {
              id: "prod_h1",
              name: "Denim Jacket",
              slug: "denim-jacket",
              description: "Classic denim jacket",
              basePrice: new Decimal("120.00"),
              categoryId: "cat_apparel",
              images: ["/jacket.jpg"],
              featured: true,
              isArchived: false,
              createdAt: mockDate1,
              updatedAt: mockDate1,
            },
          },
        },
      ],
      createdAt: mockDate1,
      updatedAt: mockDate1,
    },
    {
      id: "ord_hist_2",
      orderNumber: "ORD-HIST-002",
      userId: "usr_alice",
      guestEmail: null,
      status: "DELIVERED",
      paymentStatus: "PAID",
      stripePaymentId: "pi_hist_2",
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
          id: "item_h2",
          orderId: "ord_hist_2",
          variantId: "var_h2",
          quantity: 1,
          unitPrice: new Decimal("45.00"),
          variant: {
            id: "var_h2",
            productId: "prod_h2",
            sku: "PROD-H2",
            name: "Small",
            priceDelta: new Decimal("0.00"),
            stock: 15,
            product: {
              id: "prod_h2",
              name: "Cotton T-Shirt",
              slug: "cotton-t-shirt",
              description: "Soft cotton tee",
              basePrice: new Decimal("45.00"),
              categoryId: "cat_apparel",
              images: ["/tee.jpg"],
              featured: false,
              isArchived: false,
              createdAt: mockDate2,
              updatedAt: mockDate2,
            },
          },
        },
      ],
      createdAt: mockDate2,
      updatedAt: mockDate2,
    },
  ];

  it("renders empty state with friendly message and Start Shopping CTA when orders list is empty", () => {
    render(<OrderHistoryList orders={[]} total={0} page={1} totalPages={1} />);

    expect(screen.getByText(/no orders yet/i)).toBeTruthy();
    expect(screen.getByText(/you haven't placed any orders yet/i)).toBeTruthy();

    const shoppingLink = screen.getByRole("link", { name: /start shopping/i });
    expect(shoppingLink).toBeTruthy();
    expect(shoppingLink.getAttribute("href")).toBe("/products");
  });

  it("renders list of past orders with order numbers, dates, status badges, and totals", () => {
    render(
      <OrderHistoryList orders={mockOrders} total={2} page={1} totalPages={1} />
    );

    expect(screen.getByText(/ORD-HIST-001/i)).toBeTruthy();
    expect(screen.getByText(/ORD-HIST-002/i)).toBeTruthy();
    expect(screen.getByText(/processing/i)).toBeTruthy();
    expect(screen.getByText(/delivered/i)).toBeTruthy();
    expect(screen.getByText(/\$120\.00/i)).toBeTruthy();
    expect(screen.getByText(/\$50\.00/i)).toBeTruthy();
  });

  it("toggles expandable details when clicking View Details / Hide Details button", async () => {
    const user = userEvent.setup();
    render(
      <OrderHistoryList orders={mockOrders} total={2} page={1} totalPages={1} />
    );

    const toggleButtons = screen.getAllByRole("button", { name: /view details/i });
    expect(toggleButtons.length).toBe(2);

    // Details are initially collapsed
    expect(screen.queryByText(/shipping destination/i)).toBeNull();

    // Click first order's toggle
    await user.click(toggleButtons[0]);

    // First order's line items and destination are now visible
    expect(screen.getByText(/shipping destination/i)).toBeTruthy();
    expect(screen.getByText("Denim Jacket")).toBeTruthy();

    // Button label changes to "Hide Details"
    const hideButton = screen.getByRole("button", { name: /hide details/i });
    expect(hideButton).toBeTruthy();

    // Click again to collapse
    await user.click(hideButton);
    expect(screen.queryByText(/shipping destination/i)).toBeNull();
  });

  it("renders pagination controls when totalPages > 1 and navigates correctly", async () => {
    const user = userEvent.setup();
    render(
      <OrderHistoryList orders={mockOrders} total={20} page={1} totalPages={2} />
    );

    expect(screen.getByText(/page 1 of 2/i)).toBeTruthy();

    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton).toBeTruthy();
    expect(nextButton.hasAttribute("disabled")).toBe(false);

    const prevButton = screen.getByRole("button", { name: /previous/i });
    expect(prevButton.hasAttribute("disabled")).toBe(true);

    await user.click(nextButton);
    expect(mockPush).toHaveBeenCalledWith("/account/orders?page=2");
  });
});
