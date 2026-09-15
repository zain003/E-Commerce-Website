import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCartStore, registerCartItemDetails } from "@/store/cart-store";

describe("Cart Store — Optimistic Add Item (ISSUE-020)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.getState().clearCart();
    global.fetch = vi.fn();
  });

  it("instantly updates cart state optimistically before network request resolves", async () => {
    // Register details for variant
    registerCartItemDetails("var-123", {
      variant: { id: "var-123", name: "Large", priceDelta: 5, stock: 10 },
      product: { id: "prod-123", name: "Premium Hoodie", slug: "premium-hoodie", basePrice: 50, images: ["/hoodie.jpg"] },
    });

    let resolvePromise: (value: any) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(global.fetch).mockReturnValue(pendingPromise as any);

    // Call addItem (without awaiting network resolution yet)
    const addPromise = useCartStore.getState().addItem("var-123", 1);

    // Synchronously check cart store state right after click!
    const immediateCart = useCartStore.getState().cart;
    expect(immediateCart).not.toBeNull();
    expect(immediateCart?.items.length).toBe(1);
    expect(immediateCart?.items[0].variantId).toBe("var-123");
    expect(immediateCart?.items[0].variant.product.name).toBe("Premium Hoodie");
    expect(immediateCart?.subtotal).toBe(55); // base (50) + delta (5)
    expect(immediateCart?.itemCount).toBe(1);
    expect(useCartStore.getState().isOpen).toBe(true);

    // Now resolve the backend response
    resolvePromise!({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: "server-cart-1",
          items: [
            {
              id: "server-item-1",
              variantId: "var-123",
              quantity: 1,
              variant: {
                id: "var-123",
                product: { name: "Premium Hoodie", basePrice: 50 },
                priceDelta: 5,
              },
            },
          ],
          subtotal: 55,
          itemCount: 1,
        },
      }),
    });

    await addPromise;

    expect(useCartStore.getState().cart?.id).toBe("server-cart-1");
    expect(useCartStore.getState().isMutating).toBe(false);
  });
});
