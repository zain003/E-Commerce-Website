import { create } from "zustand";
import { ApiResponse, HydratedCart, HydratedCartItem, CouponValidationResult } from "@/types";
import { calculateDiscount } from "@/lib/services/coupon-calculator";

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

function recalculateCoupon(
  appliedCoupon: CouponValidationResult | null,
  newSubtotal: number
): { appliedCoupon: CouponValidationResult | null; discountTotal: number; couponError: string | null } {
  if (!appliedCoupon) {
    return { appliedCoupon: null, discountTotal: 0, couponError: null };
  }

  // Check minSpend
  if (appliedCoupon.minSpend != null && newSubtotal < appliedCoupon.minSpend) {
    return {
      appliedCoupon: null,
      discountTotal: 0,
      couponError: `Coupon "${appliedCoupon.code}" removed because minimum spend of $${appliedCoupon.minSpend.toFixed(2)} is no longer met`,
    };
  }

  const { discountAmount, newTotal } = calculateDiscount(
    newSubtotal,
    appliedCoupon.discountType,
    appliedCoupon.discountValue
  );

  return {
    appliedCoupon: {
      ...appliedCoupon,
      discountAmount,
      newTotal,
    },
    discountTotal: discountAmount,
    couponError: null,
  };
}

export interface OptimisticCartDetails {
  variant?: {
    id?: string;
    name?: string;
    sku?: string;
    priceDelta?: number | string | { toNumber?: () => number; toString?: () => string };
    stock?: number;
  };
  product?: {
    id?: string;
    name?: string;
    slug?: string;
    basePrice?: number | string | { toNumber?: () => number; toString?: () => string };
    images?: string[];
  };
}

export const cartItemRegistry = new Map<string, OptimisticCartDetails>();

export function registerCartItemDetails(variantId: string, details: OptimisticCartDetails) {
  if (variantId && details) {
    cartItemRegistry.set(variantId, details);
  }
}

export interface CartStoreState {
  cart: HydratedCart | null;
  isOpen: boolean;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;

  // Coupon state
  appliedCoupon: CouponValidationResult | null;
  discountTotal: number;
  couponError: string | null;
  isApplyingCoupon: boolean;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setOpen: (open: boolean) => void;
  clearError: () => void;
  setError: (error: string | null) => void;
  clearCart: () => void;
  fetchCart: () => Promise<void>;
  mergeCart: (guestToken?: string) => Promise<void>;
  addItem: (variantId: string, quantity?: number, options?: OptimisticCartDetails) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;

  // Coupon actions
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: () => void;
  clearCouponError: () => void;
}

export const useCartStore = create<CartStoreState>((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,
  isMutating: false,
  error: null,

  appliedCoupon: null,
  discountTotal: 0,
  couponError: null,
  isApplyingCoupon: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open: boolean) => set({ isOpen: open }),
  clearError: () => set({ error: null }),
  setError: (error: string | null) => set({ error }),
  clearCart: () =>
    set({
      cart: null,
      appliedCoupon: null,
      discountTotal: 0,
      couponError: null,
    }),

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) {
        throw new Error("Failed to fetch cart");
      }
      const json: ApiResponse<HydratedCart> = await res.json();
      if (json.success && json.data) {
        const couponRecalc = recalculateCoupon(get().appliedCoupon, json.data.subtotal);
        set({
          cart: json.data,
          isLoading: false,
          error: null,
          appliedCoupon: couponRecalc.appliedCoupon,
          discountTotal: couponRecalc.discountTotal,
          ...(couponRecalc.couponError ? { couponError: couponRecalc.couponError } : {}),
        });
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

  mergeCart: async (guestToken?: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/cart/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guestToken ? { guestToken } : {}),
      });
      if (!res.ok) {
        throw new Error("Failed to merge cart");
      }
      const json: ApiResponse<HydratedCart> = await res.json();
      if (json.success && json.data) {
        const couponRecalc = recalculateCoupon(get().appliedCoupon, json.data.subtotal);
        set({
          cart: json.data,
          isLoading: false,
          error: null,
          appliedCoupon: couponRecalc.appliedCoupon,
          discountTotal: couponRecalc.discountTotal,
          ...(couponRecalc.couponError ? { couponError: couponRecalc.couponError } : {}),
        });
      } else {
        await get().fetchCart();
      }
    } catch {
      await get().fetchCart();
    }
  },

  addItem: async (variantId: string, quantity = 1, options?: OptimisticCartDetails) => {
    const details = options || cartItemRegistry.get(variantId);
    const currentCart = get().cart;
    const previousCart = currentCart;
    const previousCoupon = get().appliedCoupon;
    const previousDiscount = get().discountTotal;

    // Optimistic item update or creation
    const currentItems = currentCart?.items ? [...currentCart.items] : [];
    const existingIndex = currentItems.findIndex((it) => it.variantId === variantId);

    let updatedItems: HydratedCartItem[];
    if (existingIndex > -1) {
      updatedItems = currentItems.map((it, idx) =>
        idx === existingIndex ? { ...it, quantity: it.quantity + quantity } : it
      );
    } else {
      const numericPriceDelta =
        typeof details?.variant?.priceDelta === "object" && details?.variant?.priceDelta !== null && "toNumber" in details.variant.priceDelta
          ? (details.variant.priceDelta as any).toNumber()
          : Number(details?.variant?.priceDelta ?? 0);

      const numericBasePrice =
        typeof details?.product?.basePrice === "object" && details?.product?.basePrice !== null && "toNumber" in details.product.basePrice
          ? (details.product.basePrice as any).toNumber()
          : Number(details?.product?.basePrice ?? 0);

      const optimisticItem: HydratedCartItem = {
        id: `temp-${Date.now()}`,
        cartId: currentCart?.id || "temp-cart",
        variantId,
        quantity,
        createdAt: new Date(),
        updatedAt: new Date(),
        variant: {
          id: variantId,
          productId: details?.product?.id || "",
          name: details?.variant?.name || "Standard",
          sku: details?.variant?.sku || "",
          priceDelta: numericPriceDelta,
          stock: Number(details?.variant?.stock ?? 999),
          createdAt: new Date(),
          updatedAt: new Date(),
          product: {
            id: details?.product?.id || "",
            name: details?.product?.name || "Product",
            slug: details?.product?.slug || "",
            basePrice: numericBasePrice,
            images: details?.product?.images || [],
            featured: false,
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any,
        },
      };
      updatedItems = [...currentItems, optimisticItem];
    }

    const { subtotal, itemCount } = calculateTotals(updatedItems);
    const optimisticCart: HydratedCart = {
      id: currentCart?.id || "temp-cart",
      userId: currentCart?.userId || null,
      guestToken: currentCart?.guestToken || null,
      items: updatedItems,
      subtotal,
      itemCount,
      createdAt: currentCart?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    const optimisticCoupon = recalculateCoupon(previousCoupon, optimisticCart.subtotal);

    // INSTANT UI UPDATE: item immediately appears in cart
    set({
      cart: optimisticCart,
      isOpen: true,
      isMutating: true,
      error: null,
      appliedCoupon: optimisticCoupon.appliedCoupon,
      discountTotal: optimisticCoupon.discountTotal,
      ...(optimisticCoupon.couponError ? { couponError: optimisticCoupon.couponError } : {}),
    });

    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity }),
      });
      const json: ApiResponse<HydratedCart> = await res.json();

      if (!res.ok || !json.success || !json.data) {
        set({
          cart: previousCart,
          isMutating: false,
          appliedCoupon: previousCoupon,
          discountTotal: previousDiscount,
          error: json.error?.message || "Failed to add item to cart",
        });
        return;
      }

      const couponRecalc = recalculateCoupon(get().appliedCoupon, json.data.subtotal);
      set({
        cart: json.data,
        isMutating: false,
        error: null,
        appliedCoupon: couponRecalc.appliedCoupon,
        discountTotal: couponRecalc.discountTotal,
        ...(couponRecalc.couponError ? { couponError: couponRecalc.couponError } : {}),
      });
    } catch (err) {
      set({
        cart: previousCart,
        isMutating: false,
        appliedCoupon: previousCoupon,
        discountTotal: previousDiscount,
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
    const previousCoupon = get().appliedCoupon;
    const previousDiscount = get().discountTotal;

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

    const optimisticCoupon = recalculateCoupon(previousCoupon, optimisticCart.subtotal);

    set({
      cart: optimisticCart,
      isMutating: true,
      error: null,
      appliedCoupon: optimisticCoupon.appliedCoupon,
      discountTotal: optimisticCoupon.discountTotal,
      ...(optimisticCoupon.couponError ? { couponError: optimisticCoupon.couponError } : {}),
    });

    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const json: ApiResponse<HydratedCart> = await res.json();

      if (!res.ok || !json.success || !json.data) {
        // Roll back on failure
        set({
          cart: previousCart,
          isMutating: false,
          appliedCoupon: previousCoupon,
          discountTotal: previousDiscount,
          error: json.error?.message || "Failed to update item quantity",
        });
        return;
      }

      const couponRecalc = recalculateCoupon(get().appliedCoupon, json.data.subtotal);
      set({
        cart: json.data,
        isMutating: false,
        error: null,
        appliedCoupon: couponRecalc.appliedCoupon,
        discountTotal: couponRecalc.discountTotal,
        ...(couponRecalc.couponError ? { couponError: couponRecalc.couponError } : {}),
      });
    } catch (err) {
      // Roll back on network error
      set({
        cart: previousCart,
        isMutating: false,
        appliedCoupon: previousCoupon,
        discountTotal: previousDiscount,
        error: "Network error while updating quantity",
      });
    }
  },

  removeItem: async (itemId: string) => {
    const currentCart = get().cart;
    if (!currentCart) return;

    const previousCart = currentCart;
    const previousCoupon = get().appliedCoupon;
    const previousDiscount = get().discountTotal;

    const updatedItems = currentCart.items.filter((it) => it.id !== itemId);
    const { subtotal, itemCount } = calculateTotals(updatedItems);
    const optimisticCart: HydratedCart = {
      ...currentCart,
      items: updatedItems,
      subtotal,
      itemCount,
    };

    const optimisticCoupon = recalculateCoupon(previousCoupon, optimisticCart.subtotal);

    set({
      cart: optimisticCart,
      isMutating: true,
      error: null,
      appliedCoupon: optimisticCoupon.appliedCoupon,
      discountTotal: optimisticCoupon.discountTotal,
      ...(optimisticCoupon.couponError ? { couponError: optimisticCoupon.couponError } : {}),
    });

    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
      });
      const json: ApiResponse<HydratedCart> = await res.json();

      if (!res.ok || !json.success || !json.data) {
        set({
          cart: previousCart,
          isMutating: false,
          appliedCoupon: previousCoupon,
          discountTotal: previousDiscount,
          error: json.error?.message || "Failed to remove item from cart",
        });
        return;
      }

      const couponRecalc = recalculateCoupon(get().appliedCoupon, json.data.subtotal);
      set({
        cart: json.data,
        isMutating: false,
        error: null,
        appliedCoupon: couponRecalc.appliedCoupon,
        discountTotal: couponRecalc.discountTotal,
        ...(couponRecalc.couponError ? { couponError: couponRecalc.couponError } : {}),
      });
    } catch (err) {
      set({
        cart: previousCart,
        isMutating: false,
        appliedCoupon: previousCoupon,
        discountTotal: previousDiscount,
        error: "Network error while removing item",
      });
    }
  },

  applyCoupon: async (code: string) => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      set({ couponError: "Please enter a promo code" });
      return { success: false, error: "Please enter a promo code" };
    }

    const currentCart = get().cart;
    const subtotal = currentCart?.subtotal ?? 0;

    set({ isApplyingCoupon: true, couponError: null });

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: trimmedCode,
          cartSubtotal: subtotal,
        }),
      });

      const json: ApiResponse<CouponValidationResult> = await res.json();

      if (!res.ok || !json.success || !json.data) {
        const errorMsg = json.error?.message || "Failed to validate coupon";
        set({
          isApplyingCoupon: false,
          couponError: errorMsg,
          appliedCoupon: null,
          discountTotal: 0,
        });
        return { success: false, error: errorMsg };
      }

      set({
        isApplyingCoupon: false,
        couponError: null,
        appliedCoupon: json.data,
        discountTotal: json.data.discountAmount,
      });

      return { success: true };
    } catch (err) {
      const errorMsg = "Network error while validating coupon";
      set({
        isApplyingCoupon: false,
        couponError: errorMsg,
        appliedCoupon: null,
        discountTotal: 0,
      });
      return { success: false, error: errorMsg };
    }
  },

  removeCoupon: () => {
    set({
      appliedCoupon: null,
      discountTotal: 0,
      couponError: null,
    });
  },

  clearCouponError: () => {
    set({ couponError: null });
  },
}));
