import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as addToCartRoute } from "@/app/api/cart/items/route";
import { PATCH as updateCartItemRoute } from "@/app/api/cart/items/[id]/route";
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
      create: vi.fn(),
    },
    cartItem: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("Cart Stock Limits & Edge Cases (API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(null);
  });

  const mockProduct = {
    id: "prod_100",
    name: "Limited Edition Jacket",
    slug: "limited-edition-jacket",
    description: "Exclusive jacket with limited production run",
    basePrice: new Decimal("299.99"),
    categoryId: "cat_outerwear",
    images: ["/jacket.jpg"],
    featured: true,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockVariant = {
    id: "var_jacket_m",
    productId: "prod_100",
    sku: "JKT-LIM-M",
    name: "Medium",
    priceDelta: new Decimal("0.00"),
    stock: 5, // Only 5 available in inventory
    product: mockProduct,
  };

  it("returns 400 INSUFFICIENT_STOCK when requested quantity exceeds available stock on fresh add", async () => {
    vi.mocked(prisma.productVariant.findUnique).mockResolvedValue(mockVariant as any);
    vi.mocked(prisma.cart.findFirst).mockResolvedValue({
      id: "cart_1",
      userId: null,
      guestToken: "token_1",
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    } as any);

    const req = new NextRequest("http://localhost:3000/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        variantId: "var_jacket_m",
        quantity: 6, // Exceeds 5
      }),
    });

    const res = await addToCartRoute(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INSUFFICIENT_STOCK");
    expect(json.error.message).toContain("exceeds available stock");
    expect(prisma.cartItem.create).not.toHaveBeenCalled();
  });

  it("returns 400 INSUFFICIENT_STOCK when cumulative quantity exceeds available stock", async () => {
    vi.mocked(prisma.productVariant.findUnique).mockResolvedValue(mockVariant as any);
    vi.mocked(prisma.cart.findFirst).mockResolvedValue({
      id: "cart_1",
      userId: null,
      guestToken: "token_1",
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: "item_existing",
          cartId: "cart_1",
          variantId: "var_jacket_m",
          quantity: 4, // 4 already in cart
        },
      ],
    } as any);

    // Attempting to add 2 more (4 + 2 = 6 > 5)
    const req = new NextRequest("http://localhost:3000/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        variantId: "var_jacket_m",
        quantity: 2,
      }),
    });

    const res = await addToCartRoute(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INSUFFICIENT_STOCK");
    expect(json.error.message).toContain("Requested quantity (6) exceeds available stock (5)");
    expect(prisma.cartItem.update).not.toHaveBeenCalled();
  });

  it("returns 400 INSUFFICIENT_STOCK when PATCH /api/cart/items/[id] exceeds available stock", async () => {
    const guestToken = "guest_patch_tok";
    vi.mocked(prisma.cartItem.findUnique).mockResolvedValue({
      id: "item_to_update",
      cartId: "cart_1",
      variantId: "var_jacket_m",
      quantity: 2,
      cart: {
        id: "cart_1",
        userId: null,
        guestToken,
      },
      variant: mockVariant, // stock = 5
    } as any);

    const req = new NextRequest("http://localhost:3000/api/cart/items/item_to_update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `guest_cart_token=${guestToken}`,
      },
      body: JSON.stringify({
        quantity: 10, // Exceeds 5
      }),
    });

    const context = { params: Promise.resolve({ id: "item_to_update" }) };
    const res = await updateCartItemRoute(req, context);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INSUFFICIENT_STOCK");
    expect(json.error.message).toContain("exceeds available stock (5)");
    expect(prisma.cartItem.update).not.toHaveBeenCalled();
  });

  it("returns 400 VALIDATION_ERROR when quantity is 0 on POST /api/cart/items", async () => {
    const req = new NextRequest("http://localhost:3000/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        variantId: "var_jacket_m",
        quantity: 0,
      }),
    });

    const res = await addToCartRoute(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
    expect(json.error.details?.quantity).toBeDefined();
  });

  it("returns 400 VALIDATION_ERROR when quantity is negative on POST /api/cart/items", async () => {
    const req = new NextRequest("http://localhost:3000/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        variantId: "var_jacket_m",
        quantity: -3,
      }),
    });

    const res = await addToCartRoute(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 404 NOT_FOUND when variant does not exist in database", async () => {
    vi.mocked(prisma.productVariant.findUnique).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        variantId: "nonexistent_var",
        quantity: 1,
      }),
    });

    const res = await addToCartRoute(req);
    expect(res.status).toBe(404);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("NOT_FOUND");
    expect(json.error.message).toContain("Product variant not found");
  });
});
