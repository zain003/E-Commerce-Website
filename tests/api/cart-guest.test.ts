import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as addToCartRoute } from "@/app/api/cart/items/route";
import { GET as getCartRoute } from "@/app/api/cart/route";
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
    productVariant: {
      findUnique: vi.fn(),
    },
    cart: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    cartItem: {
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

describe("Guest Cart Session & Cookies (API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(null);
  });

  const mockProduct = {
    id: "prod_1",
    name: "Minimalist Sneaker",
    slug: "minimalist-sneaker",
    description: "Comfortable leather sneakers",
    basePrice: new Decimal("89.99"),
    categoryId: "cat_shoes",
    images: ["/sneaker.jpg"],
    featured: true,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockVariant = {
    id: "var_1",
    productId: "prod_1",
    sku: "SNK-42",
    name: "Size 42 / White",
    priceDelta: new Decimal("0.00"),
    stock: 15,
    product: mockProduct,
  };

  it("generates an HTTP-only guest_cart_token cookie on first cart addition for guest", async () => {
    vi.mocked(prisma.productVariant.findUnique).mockResolvedValue(mockVariant as any);

    // Mock cart creation
    const createdCart = {
      id: "cart_guest_1",
      userId: null,
      guestToken: "mock-generated-token",
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    };
    vi.mocked(prisma.cart.findFirst).mockResolvedValueOnce(null); // No cart initially
    vi.mocked(prisma.cart.create).mockResolvedValueOnce(createdCart as any);

    // Mock item creation
    vi.mocked(prisma.cartItem.create).mockResolvedValueOnce({
      id: "item_1",
      cartId: "cart_guest_1",
      variantId: "var_1",
      quantity: 1,
      createdAt: new Date(),
    } as any);

    // After adding, getCart re-fetches
    vi.mocked(prisma.cart.findFirst).mockResolvedValueOnce({
      ...createdCart,
      items: [
        {
          id: "item_1",
          cartId: "cart_guest_1",
          variantId: "var_1",
          quantity: 1,
          createdAt: new Date(),
          variant: mockVariant,
        },
      ],
    } as any);

    const req = new NextRequest("http://localhost:3000/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        variantId: "var_1",
        quantity: 1,
      }),
    });

    const res = await addToCartRoute(req);
    expect(res.status).toBe(201);

    // Verify HTTP-only cookie
    const cookie = res.cookies.get("guest_cart_token");
    expect(cookie).toBeDefined();
    expect(cookie?.value).toBeTruthy();
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.path).toBe("/");

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.items).toHaveLength(1);
    expect(json.data.subtotal).toBe(89.99);
    expect(json.data.itemCount).toBe(1);
  });

  it("reuses existing guest_cart_token cookie without generating a new cookie", async () => {
    vi.mocked(prisma.productVariant.findUnique).mockResolvedValue(mockVariant as any);

    const existingGuestToken = "existing-guest-token-12345";
    const existingCart = {
      id: "cart_existing",
      userId: null,
      guestToken: existingGuestToken,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    };

    vi.mocked(prisma.cart.findFirst).mockResolvedValueOnce(existingCart as any);

    vi.mocked(prisma.cartItem.create).mockResolvedValueOnce({
      id: "item_2",
      cartId: "cart_existing",
      variantId: "var_1",
      quantity: 2,
      createdAt: new Date(),
    } as any);

    vi.mocked(prisma.cart.findFirst).mockResolvedValueOnce({
      ...existingCart,
      items: [
        {
          id: "item_2",
          cartId: "cart_existing",
          variantId: "var_1",
          quantity: 2,
          createdAt: new Date(),
          variant: mockVariant,
        },
      ],
    } as any);

    const req = new NextRequest("http://localhost:3000/api/cart/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `guest_cart_token=${existingGuestToken}`,
      },
      body: JSON.stringify({
        variantId: "var_1",
        quantity: 2,
      }),
    });

    const res = await addToCartRoute(req);
    expect(res.status).toBe(201);

    // No new set-cookie required since token already existed
    const newCookie = res.cookies.get("guest_cart_token");
    expect(newCookie).toBeUndefined();

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.subtotal).toBe(179.98);
    expect(json.data.itemCount).toBe(2);
  });

  it("retrieves guest cart via GET /api/cart with guest_cart_token cookie", async () => {
    const guestToken = "guest-cookie-token-abc";
    vi.mocked(prisma.cart.findFirst).mockResolvedValueOnce({
      id: "cart_guest",
      userId: null,
      guestToken,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: "item_1",
          cartId: "cart_guest",
          variantId: "var_1",
          quantity: 1,
          createdAt: new Date(),
          variant: mockVariant,
        },
      ],
    } as any);

    const req = new NextRequest("http://localhost:3000/api/cart", {
      headers: {
        Cookie: `guest_cart_token=${guestToken}`,
      },
    });

    const res = await getCartRoute(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.guestToken).toBe(guestToken);
    expect(json.data.items).toHaveLength(1);
    expect(json.data.subtotal).toBe(89.99);
    expect(json.data.itemCount).toBe(1);
  });

  it("returns empty cart safely when no guest cookie is provided to GET /api/cart", async () => {
    const req = new NextRequest("http://localhost:3000/api/cart");
    const res = await getCartRoute(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.items).toEqual([]);
    expect(json.data.subtotal).toBe(0);
    expect(json.data.itemCount).toBe(0);
  });
});
