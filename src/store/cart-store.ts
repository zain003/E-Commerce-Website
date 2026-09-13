import { create } from "zustand";
import { ApiResponse, HydratedCart, HydratedCartItem } from "@/types";

function calculateTotals(items: HydratedCartItem[]): { subtotal: number; itemCount: number } {
  const subtotal = items.reduce((acc, item) => {
    const base = Number(item.variant?.product?.basePrice ?? 0);
    const delta = Number(item.variant?.priceDelta ?? 0);
    return acc + (base + delta) * item.quantity;
  }, 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    itemCount,
  };
}

export interface CartStoreState {
  cart: HydratedCart | null;
  isOpen: boolean;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setOpen: (open: boolean) => void;
  clearError: () => void;
  setError: (error: string | null) => void;
  clearCart: () => void;
  fetchCart: () => Promise<void>;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
}

export const useCartStore = create<CartStoreState>((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,
  isMutating: false,
  error: null,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open: boolean) => set({ isOpen: open }),
  clearError: () => set({ error: null }),
  setError: (error: string | null) => set({ error }),
  clearCart: () => set({ cart: null }),

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) {
        throw new Error("Failed to fetch cart");
      }
      const json: ApiResponse<HydratedCart> = await res.json();
      if (json.success && json.data) {
        set({ cart: json.data, isLoading: false, error: null });
      } else {
        set({
          isLoading: false,
          error: json.error?.message || "Failed to load cart",
        });
      }
    } catch (err) {
      set({
        isLoading: false,
        error: "Failed to connect to cart service",
      });
    }
  },

  addItem: async (variantId: string, quantity = 1) => {
    set({ isOpen: true, isMutating: true, error: null });
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity }),
      });
      const json: ApiResponse<HydratedCart> = await res.json();

      if (!res.ok || !json.success) {
        set({
          isMutating: false,
          error: json.error?.message || "Failed to add item to cart",
        });
        return;
      }

      set({
        cart: json.data,
        isMutating: false,
        error: null,
      });
    } catch (err) {
      set({
        isMutating: false,
        error: "Network error occurred while adding to cart",
      });
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    const currentCart = get().cart;
    if (!currentCart) return;

    const targetItem = currentCart.items.find((it) => it.id === itemId);
    if (!targetItem) return;

    if (quantity > targetItem.variant.stock) {
      set({ error: `Only ${targetItem.variant.stock} items left in stock` });
      return;
    }

    if (quantity <= 0) {
      return get().removeItem(itemId);
    }

    // Save state for rollback
    const previousCart = currentCart;

    // Optimistic UI state update
    const updatedItems = currentCart.items.map((it) =>
      it.id === itemId ? { ...it, quantity } : it
    );
    const { subtotal, itemCount } = calculateTotals(updatedItems);
    const optimisticCart: HydratedCart = {
      ...currentCart,
      items: updatedItems,
      subtotal,
      itemCount,
    };

    set({ cart: optimisticCart, isMutating: true, error: null });

    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const json: ApiResponse<HydratedCart> = await res.json();

      if (!res.ok || !json.success) {
        // Roll back on failure
        set({
          cart: previousCart,
          isMutating: false,
          error: json.error?.message || "Failed to update item quantity",
        });
        return;
      }

      set({ cart: json.data, isMutating: false, error: null });
    } catch (err) {
      // Roll back on network error
      set({
        cart: previousCart,
        isMutating: false,
        error: "Network error while updating quantity",
      });
    }
  },

  removeItem: async (itemId: string) => {
    const currentCart = get().cart;
    if (!currentCart) return;

    const previousCart = currentCart;
    const updatedItems = currentCart.items.filter((it) => it.id !== itemId);
    const { subtotal, itemCount } = calculateTotals(updatedItems);
    const optimisticCart: HydratedCart = {
      ...currentCart,
      items: updatedItems,
      subtotal,
      itemCount,
    };

    set({ cart: optimisticCart, isMutating: true, error: null });

    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
      });
      const json: ApiResponse<HydratedCart> = await res.json();

      if (!res.ok || !json.success) {
        set({
          cart: previousCart,
          isMutating: false,
          error: json.error?.message || "Failed to remove item from cart",
        });
        return;
      }

      set({ cart: json.data, isMutating: false, error: null });
    } catch (err) {
      set({
        cart: previousCart,
        isMutating: false,
        error: "Network error while removing item",
      });
    }
  },
}));
