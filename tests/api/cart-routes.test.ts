import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH as updateCartItemRoute, DELETE as deleteCartItemRoute } from "@/app/api/cart/items/[id]/route";
import { POST as mergeCartRoute } from "@/app/api/cart/merge/route";
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
  updateCartItem: vi.fn(),
  removeCartItem: vi.fn(),
  mergeGuestCart: vi.fn(),
  getCart: vi.fn(),
}));

describe("Cart Route Handlers (API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockHydratedCart = {
    id: "cart_1",
    userId: "usr_1",
    guestToken: null,
    items: [],
    subtotal: 0,
    itemCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("PATCH /api/cart/items/[id]", () => {
    it("returns 200 with updated cart envelope on valid update", async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: "usr_1", email: "user@test.com", role: "CUSTOMER", name: "Test" },
        expires: "9999-12-31",
      });

      vi.mocked(cartService.updateCartItem).mockResolvedValue({
        success: true,
        data: {
          ...mockHydratedCart,
          subtotal: 50.0,
          itemCount: 2,
        },
        timestamp: new Date().toISOString(),
      });

      const req = new NextRequest("http://localhost:3000/api/cart/items/item_1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: 2 }),
      });

      const context = { params: Promise.resolve({ id: "item_1" }) };
      const res = await updateCartItemRoute(req, context);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.itemCount).toBe(2);
      expect(cartService.updateCartItem).toHaveBeenCalledWith(
        "item_1",
        { quantity: 2 },
        undefined,
        "usr_1"
      );
    });

    it("returns 400 VALIDATION_ERROR when quantity is invalid", async () => {
      const req = new NextRequest("http://localhost:3000/api/cart/items/item_1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: "invalid" }),
      });

      const context = { params: Promise.resolve({ id: "item_1" }) };
      const res = await updateCartItemRoute(req, context);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("VALIDATION_ERROR");
      expect(cartService.updateCartItem).not.toHaveBeenCalled();
    });

    it("returns 403 FORBIDDEN when user does not own the cart item", async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: "usr_intruder", email: "bad@test.com", role: "CUSTOMER", name: "Bad" },
        expires: "9999-12-31",
      });

      vi.mocked(cartService.updateCartItem).mockResolvedValue({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to modify this cart item",
        },
        timestamp: new Date().toISOString(),
      });

      const req = new NextRequest("http://localhost:3000/api/cart/items/item_other", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: 5 }),
      });

      const context = { params: Promise.resolve({ id: "item_other" }) };
      const res = await updateCartItemRoute(req, context);

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("FORBIDDEN");
    });

    it("returns 404 NOT_FOUND when cart item does not exist", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      vi.mocked(cartService.updateCartItem).mockResolvedValue({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Cart item not found",
        },
        timestamp: new Date().toISOString(),
      });

      const req = new NextRequest("http://localhost:3000/api/cart/items/item_missing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: 1 }),
      });

      const context = { params: Promise.resolve({ id: "item_missing" }) };
      const res = await updateCartItemRoute(req, context);

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("NOT_FOUND");
    });
  });

  describe("DELETE /api/cart/items/[id]", () => {
    it("returns 200 with updated cart after successful deletion", async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: "usr_1", email: "user@test.com", role: "CUSTOMER", name: "Test" },
        expires: "9999-12-31",
      });

      vi.mocked(cartService.removeCartItem).mockResolvedValue({
        success: true,
        data: {
          ...mockHydratedCart,
          subtotal: 0,
          itemCount: 0,
        },
        timestamp: new Date().toISOString(),
      });

      const req = new NextRequest("http://localhost:3000/api/cart/items/item_del", {
        method: "DELETE",
      });

      const context = { params: Promise.resolve({ id: "item_del" }) };
      const res = await deleteCartItemRoute(req, context);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(cartService.removeCartItem).toHaveBeenCalledWith("item_del", undefined, "usr_1");
    });

    it("returns 403 FORBIDDEN on unauthorized deletion", async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: "usr_2", email: "u2@test.com", role: "CUSTOMER", name: "User 2" },
        expires: "9999-12-31",
      });

      vi.mocked(cartService.removeCartItem).mockResolvedValue({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to remove this cart item",
        },
        timestamp: new Date().toISOString(),
      });

      const req = new NextRequest("http://localhost:3000/api/cart/items/item_not_owned", {
        method: "DELETE",
      });

      const context = { params: Promise.resolve({ id: "item_not_owned" }) };
      const res = await deleteCartItemRoute(req, context);

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("FORBIDDEN");
    });
  });

  describe("POST /api/cart/merge", () => {
    it("returns 401 UNAUTHORIZED if session is missing", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/cart/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestToken: "token_abc" }),
      });

      const res = await mergeCartRoute(req);
      expect(res.status).toBe(401);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
      expect(cartService.mergeGuestCart).not.toHaveBeenCalled();
    });

    it("merges guest cart and clears guest_cart_token cookie on success", async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: "usr_merge_target", email: "target@test.com", role: "CUSTOMER", name: "Target" },
        expires: "9999-12-31",
      });

      vi.mocked(cartService.mergeGuestCart).mockResolvedValue({
        success: true,
        data: {
          ...mockHydratedCart,
          userId: "usr_merge_target",
          subtotal: 120.0,
          itemCount: 3,
        },
        timestamp: new Date().toISOString(),
      });

      const req = new NextRequest("http://localhost:3000/api/cart/merge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "guest_cart_token=guest_tok_to_clear",
        },
        body: JSON.stringify({}),
      });

      const res = await mergeCartRoute(req);
      expect(res.status).toBe(200);

      // Verify cookie was cleared (maxAge: 0 or value empty)
      const clearedCookie = res.cookies.get("guest_cart_token");
      expect(clearedCookie).toBeDefined();
      expect(clearedCookie?.value).toBe("");
      expect(clearedCookie?.maxAge).toBe(0);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.subtotal).toBe(120.0);
      expect(cartService.mergeGuestCart).toHaveBeenCalledWith("guest_tok_to_clear", "usr_merge_target");
    });
  });
});
