import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  mergeGuestCart,
} from "@/lib/services/cart";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    cart: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    cartItem: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    productVariant: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("Cart Service (Unit)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProduct = {
    id: "prod_1",
    name: "Classic Hoodie",
    slug: "classic-hoodie",
    description: "Cotton blend hoodie",
    basePrice: new Decimal("40.00"),
    categoryId: "cat_apparel",
    images: ["/hoodie.jpg"],
    featured: false,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockVariant1 = {
    id: "var_1",
    productId: "prod_1",
    sku: "HOD-M",
    name: "Medium",
    priceDelta: new Decimal("0.00"),
    stock: 20,
    product: mockProduct,
  };

  const mockVariant2 = {
    id: "var_2",
    productId: "prod_1",
    sku: "HOD-XL",
    name: "Extra Large",
    priceDelta: new Decimal("5.00"),
    stock: 10,
    product: mockProduct,
  };

  describe("getCart", () => {
    it("returns empty cart if neither guestToken nor userId provided", async () => {
      const res = await getCart();
      expect(res.success).toBe(true);
      expect(res.data?.items).toEqual([]);
      expect(res.data?.subtotal).toBe(0);
      expect(res.data?.itemCount).toBe(0);
    });

    it("fetches user cart and prunes stale items referencing archived products", async () => {
      const staleProduct = {
        ...mockProduct,
        id: "prod_stale",
        isArchived: true,
      };

      const rawCart = {
        id: "cart_user_1",
        userId: "usr_1",
        guestToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            id: "item_valid",
            cartId: "cart_user_1",
            variantId: "var_1",
            quantity: 2,
            createdAt: new Date(),
            variant: mockVariant1,
          },
          {
            id: "item_stale",
            cartId: "cart_user_1",
            variantId: "var_stale",
            quantity: 1,
            createdAt: new Date(),
            variant: {
              ...mockVariant1,
              id: "var_stale",
              product: staleProduct,
            },
          },
        ],
      };

      vi.mocked(prisma.cart.findFirst).mockResolvedValue(rawCart as any);
      vi.mocked(prisma.cartItem.deleteMany).mockResolvedValue({ count: 1 });

      const res = await getCart(undefined, "usr_1");

      expect(res.success).toBe(true);
      expect(res.data?.items).toHaveLength(1);
      expect(res.data?.items[0].id).toBe("item_valid");
      expect(res.data?.subtotal).toBe(80.0); // 40 * 2
      expect(res.data?.itemCount).toBe(2);
      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ["item_stale"] } },
      });
    });
  });

  describe("addToCart", () => {
    it("adds item to existing authenticated user cart", async () => {
      vi.mocked(prisma.productVariant.findUnique).mockResolvedValue(mockVariant1 as any);

      const existingCart = {
        id: "cart_user_1",
        userId: "usr_1",
        guestToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      };

      vi.mocked(prisma.cart.findFirst).mockResolvedValueOnce(existingCart as any);
      vi.mocked(prisma.cartItem.create).mockResolvedValueOnce({
        id: "item_new",
        cartId: "cart_user_1",
        variantId: "var_1",
        quantity: 2,
        createdAt: new Date(),
      } as any);

      vi.mocked(prisma.cart.findFirst).mockResolvedValueOnce({
        ...existingCart,
        items: [
          {
            id: "item_new",
            cartId: "cart_user_1",
            variantId: "var_1",
            quantity: 2,
            createdAt: new Date(),
            variant: mockVariant1,
          },
        ],
      } as any);

      const res = await addToCart({ variantId: "var_1", quantity: 2 }, undefined, "usr_1");

      expect(res.success).toBe(true);
      expect(res.data?.subtotal).toBe(80.0);
      expect(res.data?.itemCount).toBe(2);
      expect(prisma.cartItem.create).toHaveBeenCalledWith({
        data: {
          cartId: "cart_user_1",
          variantId: "var_1",
          quantity: 2,
        },
      });
    });
  });

  describe("updateCartItem", () => {
    it("removes item when quantity is updated to 0 and recalculates totals", async () => {
      const mockItem = {
        id: "item_to_remove",
        cartId: "cart_1",
        variantId: "var_1",
        quantity: 2,
        cart: {
          id: "cart_1",
          userId: "usr_1",
          guestToken: null,
        },
        variant: mockVariant1,
      };

      vi.mocked(prisma.cartItem.findUnique).mockResolvedValue(mockItem as any);
      vi.mocked(prisma.cartItem.delete).mockResolvedValue(mockItem as any);

      vi.mocked(prisma.cart.findFirst).mockResolvedValueOnce({
        id: "cart_1",
        userId: "usr_1",
        guestToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      } as any);

      const res = await updateCartItem("item_to_remove", { quantity: 0 }, undefined, "usr_1");

      expect(res.success).toBe(true);
      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: "item_to_remove" },
      });
      expect(res.data?.items).toHaveLength(0);
      expect(res.data?.subtotal).toBe(0);
      expect(res.data?.itemCount).toBe(0);
    });

    it("enforces ownership: blocks User B from modifying User A's cart item", async () => {
      const mockItem = {
        id: "item_usr_a",
        cartId: "cart_a",
        variantId: "var_1",
        quantity: 2,
        cart: {
          id: "cart_a",
          userId: "usr_A",
          guestToken: null,
        },
        variant: mockVariant1,
      };

      vi.mocked(prisma.cartItem.findUnique).mockResolvedValue(mockItem as any);

      const res = await updateCartItem("item_usr_a", { quantity: 3 }, undefined, "usr_B");

      expect(res.success).toBe(false);
      expect(res.error?.code).toBe("FORBIDDEN");
      expect(prisma.cartItem.update).not.toHaveBeenCalled();
    });
  });

  describe("removeCartItem", () => {
    it("removes item and recalculates subtotal and total itemCount", async () => {
      const mockItem = {
        id: "item_1",
        cartId: "cart_1",
        cart: {
          id: "cart_1",
          userId: "usr_1",
          guestToken: null,
        },
      };

      vi.mocked(prisma.cartItem.findUnique).mockResolvedValue(mockItem as any);
      vi.mocked(prisma.cartItem.delete).mockResolvedValue(mockItem as any);

      // Remaining item after deletion
      vi.mocked(prisma.cart.findFirst).mockResolvedValueOnce({
        id: "cart_1",
        userId: "usr_1",
        guestToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            id: "item_2",
            cartId: "cart_1",
            variantId: "var_2",
            quantity: 1,
            createdAt: new Date(),
            variant: mockVariant2,
          },
        ],
      } as any);

      const res = await removeCartItem("item_1", undefined, "usr_1");

      expect(res.success).toBe(true);
      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: "item_1" },
      });
      // Remaining item 2: 40 + 5 = 45
      expect(res.data?.subtotal).toBe(45.0);
      expect(res.data?.itemCount).toBe(1);
    });

    it("enforces ownership: blocks User B from removing User A's cart item", async () => {
      const mockItem = {
        id: "item_usr_a",
        cartId: "cart_a",
        cart: {
          id: "cart_a",
          userId: "usr_A",
          guestToken: null,
        },
      };

      vi.mocked(prisma.cartItem.findUnique).mockResolvedValue(mockItem as any);

      const res = await removeCartItem("item_usr_a", undefined, "usr_B");

      expect(res.success).toBe(false);
      expect(res.error?.code).toBe("FORBIDDEN");
      expect(prisma.cartItem.delete).not.toHaveBeenCalled();
    });
  });

  describe("mergeGuestCart", () => {
    it("transfers unique items and sums quantities for duplicate variants", async () => {
      const guestToken = "guest_tok_123";
      const userId = "usr_1";

      const guestCart = {
        id: "cart_guest",
        guestToken,
        userId: null,
        items: [
          {
            id: "guest_item_dup",
            cartId: "cart_guest",
            variantId: "var_1",
            quantity: 2,
            variant: mockVariant1,
          },
          {
            id: "guest_item_unique",
            cartId: "cart_guest",
            variantId: "var_2",
            quantity: 1,
            variant: mockVariant2,
          },
        ],
      };

      const userCart = {
        id: "cart_user",
        guestToken: null,
        userId,
        items: [
          {
            id: "user_item_dup",
            cartId: "cart_user",
            variantId: "var_1",
            quantity: 3, // 3 + 2 = 5
          },
        ],
      };

      (prisma.cart.findUnique as any).mockImplementation(async ({ where }: any) => {
        if (where.guestToken) return guestCart;
        if (where.userId) return userCart;
        return null;
      });

      const txCartItemUpdate = vi.fn();
      const txCartItemDelete = vi.fn();
      const txCartDelete = vi.fn();

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return callback({
          cartItem: {
            update: txCartItemUpdate,
            delete: txCartItemDelete,
          },
          cart: {
            delete: txCartDelete,
          },
        });
      });

      // After merge, getCart returns updated user cart
      vi.mocked(prisma.cart.findFirst).mockResolvedValueOnce({
        id: "cart_user",
        userId,
        guestToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            id: "user_item_dup",
            cartId: "cart_user",
            variantId: "var_1",
            quantity: 5,
            createdAt: new Date(),
            variant: mockVariant1,
          },
          {
            id: "guest_item_unique",
            cartId: "cart_user",
            variantId: "var_2",
            quantity: 1,
            createdAt: new Date(),
            variant: mockVariant2,
          },
        ],
      } as any);

      const res = await mergeGuestCart(guestToken, userId);

      expect(res.success).toBe(true);

      // Verify duplicate variant quantity was summed: 3 + 2 = 5
      expect(txCartItemUpdate).toHaveBeenCalledWith({
        where: { id: "user_item_dup" },
        data: { quantity: 5 },
      });
      expect(txCartItemDelete).toHaveBeenCalledWith({
        where: { id: "guest_item_dup" },
      });

      // Verify unique variant was transferred to user cart
      expect(txCartItemUpdate).toHaveBeenCalledWith({
        where: { id: "guest_item_unique" },
        data: { cartId: "cart_user" },
      });

      // Verify guest cart was deleted
      expect(txCartDelete).toHaveBeenCalledWith({
        where: { id: "cart_guest" },
      });

      // Subtotal: (40 * 5) + (45 * 1) = 200 + 45 = 245
      // Item count: 5 + 1 = 6
      expect(res.data?.subtotal).toBe(245.0);
      expect(res.data?.itemCount).toBe(6);
    });
  });
});
