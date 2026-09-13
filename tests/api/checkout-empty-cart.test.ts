import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as checkoutPreviewRoute } from "@/app/api/checkout/preview/route";
import { POST as checkoutValidateRoute } from "@/app/api/checkout/validate/route";
import * as cartService from "@/lib/services/cart";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/services/cart", () => ({
  getCart: vi.fn(),
}));

vi.mock("@/lib/cookies/cart-cookie", () => ({
  CART_COOKIE_NAME: "guest_cart_token",
  getGuestCartToken: vi.fn().mockResolvedValue("guest-token-123"),
}));

describe("Checkout Empty Cart (API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const emptyCart = {
    id: "cart_empty",
    userId: null,
    guestToken: "guest-token-123",
    items: [],
    subtotal: 0,
    itemCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("GET /api/checkout/preview returns HTTP 400 CART_EMPTY when cart has 0 items", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      data: emptyCart,
      timestamp: new Date().toISOString(),
    });

    const req = new NextRequest("http://localhost:3000/api/checkout/preview?method=STANDARD");
    const res = await checkoutPreviewRoute(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error?.code).toBe("CART_EMPTY");
    expect(json.error?.message).toMatch(/empty/i);
  });

  it("POST /api/checkout/validate returns HTTP 400 CART_EMPTY when cart has 0 items", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    vi.mocked(cartService.getCart).mockResolvedValue({
      success: true,
      data: emptyCart,
      timestamp: new Date().toISOString(),
    });

    const payload = {
      shippingAddress: {
        fullName: "Guest User",
        street: "123 Elm St",
        city: "Austin",
        state: "TX",
        postalCode: "78701",
        country: "United States",
        phone: "+1 512 555 0199",
      },
      shippingMethodId: "STANDARD",
      guestEmail: "guest@example.com",
    };

    const req = new NextRequest("http://localhost:3000/api/checkout/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await checkoutValidateRoute(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error?.code).toBe("CART_EMPTY");
  });
});
