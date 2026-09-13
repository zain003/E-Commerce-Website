import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/orders/[orderNumber]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { Decimal } from "@prisma/client/runtime/library";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
    },
  },
}));

describe("GET /api/orders/[orderNumber] (API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDate = new Date("2026-09-13T12:00:00Z");

  const mockProduct = {
    id: "prod_1",
    name: "Classic Crewneck",
    slug: "classic-crewneck",
    description: "Comfortable cotton crewneck",
    basePrice: new Decimal("45.00"),
    categoryId: "cat_apparel",
    images: ["/crewneck.jpg"],
    featured: true,
    isArchived: false,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockVariant = {
    id: "var_1",
    productId: "prod_1",
    sku: "CRW-BLK-M",
    name: "Medium / Black",
    priceDelta: new Decimal("0.00"),
    stock: 25,
    product: mockProduct,
  };

  const mockOrderItem = {
    id: "item_1",
    orderId: "ord_1",
    variantId: "var_1",
    unitPrice: new Decimal("45.00"),
    quantity: 2,
    variant: mockVariant,
  };

  const mockOrderUserA = {
    id: "ord_1",
    orderNumber: "ORD-USER-A",
    userId: "usr_a",
    guestEmail: null,
    status: "PROCESSING" as const,
    paymentStatus: "PAID" as const,
    stripePaymentId: "pi_user_a",
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
    items: [mockOrderItem],
    user: {
      id: "usr_a",
      email: "alice@example.com",
      name: "Alice",
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockOrderGuest = {
    id: "ord_2",
    orderNumber: "ORD-GUEST-1",
    userId: null,
    guestEmail: "guest@example.com",
    status: "PROCESSING" as const,
    paymentStatus: "PAID" as const,
    stripePaymentId: "pi_guest_1",
    subtotal: new Decimal("45.00"),
    discountTotal: new Decimal("0.00"),
    shippingFee: new Decimal("5.00"),
    total: new Decimal("50.00"),
    shippingAddress: {
      fullName: "Bob Guest",
      street: "456 Elm St",
      city: "Shelbyville",
      state: "IL",
      postalCode: "62702",
      country: "USA",
      phone: "555-0200",
    },
    items: [mockOrderItem],
    user: null,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  it("returns 200 with full order receipt when accessed by order owner", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usr_a", email: "alice@example.com", role: "CUSTOMER", name: "Alice" },
      expires: "9999-12-31",
    });
    vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrderUserA as any);

    const req = new NextRequest("http://localhost:3000/api/orders/ORD-USER-A");
    const res = await GET(req, {
      params: Promise.resolve({ orderNumber: "ORD-USER-A" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.orderNumber).toBe("ORD-USER-A");
    expect(body.data.items).toHaveLength(1);
    expect(body.data.items[0].variant.name).toBe("Medium / Black");
    expect(body.data.shippingAddress.fullName).toBe("Alice Smith");
  });

  it("returns 200 with receipt when guest accesses order with matching guestEmail query param", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrderGuest as any);

    const req = new NextRequest(
      "http://localhost:3000/api/orders/ORD-GUEST-1?guestEmail=guest@example.com"
    );
    const res = await GET(req, {
      params: Promise.resolve({ orderNumber: "ORD-GUEST-1" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.orderNumber).toBe("ORD-GUEST-1");
  });

  it("returns 403 FORBIDDEN when User B attempts to access User A's order without matching email", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "usr_b", email: "bob@example.com", role: "CUSTOMER", name: "Bob" },
      expires: "9999-12-31",
    });
    vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrderUserA as any);

    const req = new NextRequest("http://localhost:3000/api/orders/ORD-USER-A");
    const res = await GET(req, {
      params: Promise.resolve({ orderNumber: "ORD-USER-A" }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("FORBIDDEN");
  });

  it("returns 403 FORBIDDEN when guest accesses without matching guestEmail", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrderGuest as any);

    const req = new NextRequest(
      "http://localhost:3000/api/orders/ORD-GUEST-1?guestEmail=wrong@example.com"
    );
    const res = await GET(req, {
      params: Promise.resolve({ orderNumber: "ORD-GUEST-1" }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("FORBIDDEN");
  });

  it("returns 404 NOT_FOUND for nonexistent orderNumber", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/orders/ORD-NONEXISTENT");
    const res = await GET(req, {
      params: Promise.resolve({ orderNumber: "ORD-NONEXISTENT" }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("returns 400 BAD_REQUEST when guestEmail query param is malformed", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = new NextRequest(
      "http://localhost:3000/api/orders/ORD-GUEST-1?guestEmail=not-an-email"
    );
    const res = await GET(req, {
      params: Promise.resolve({ orderNumber: "ORD-GUEST-1" }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 BAD_REQUEST when orderNumber param is empty", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/orders/%20%20");
    const res = await GET(req, {
      params: Promise.resolve({ orderNumber: "  " }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
  });
});
