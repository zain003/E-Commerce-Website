import { prisma } from "@/lib/prisma";
import {
  AddToCartDto,
  ApiResponse,
  HydratedCart,
  HydratedCartItem,
  UpdateCartItemDto,
} from "@/types";
import { addToCartSchema, updateCartItemSchema } from "@/lib/validators/cart";
import { calculateCartTotals } from "./cart-calculator";
import { generateGuestToken } from "@/lib/cookies/cart-cookie";

/**
 * Transforms raw DB cart with includes into a fully hydrated cart with subtotal and itemCount.
 * Automatically prunes any stale cart items referencing deleted or archived products/variants.
 */
async function hydrateAndPruneCart(cart: {
  id: string;
  userId: string | null;
  guestToken: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: Array<any>;
}): Promise<HydratedCart> {
  const staleItemIds: string[] = [];
  const validItems: HydratedCartItem[] = [];

  for (const item of cart.items) {
    if (!item.variant || !item.variant.product || item.variant.product.isArchived) {
      staleItemIds.push(item.id);
    } else {
      validItems.push(item as HydratedCartItem);
    }
  }

  // Prune stale items asynchronously in the background
  if (staleItemIds.length > 0) {
    try {
      await prisma.cartItem.deleteMany({
        where: { id: { in: staleItemIds } },
      });
    } catch (e) {
      console.warn("[CartService] Failed to prune stale cart items:", e);
    }
  }

  const { subtotal, itemCount } = calculateCartTotals(validItems);

  return {
    id: cart.id,
    userId: cart.userId,
    guestToken: cart.guestToken,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
    items: validItems,
    subtotal,
    itemCount,
  };
}

/**
 * Creates an empty in-memory HydratedCart representation.
 */
function createEmptyHydratedCart(
  guestToken?: string | null,
  userId?: string | null
): HydratedCart {
  return {
    id: "",
    userId: userId ?? null,
    guestToken: guestToken ?? null,
    items: [],
    subtotal: 0,
    itemCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Retrieves the hydrated cart for an authenticated user or guest session token.
 */
export async function getCart(
  guestToken?: string,
  userId?: string
): Promise<ApiResponse<HydratedCart>> {
  if (!userId && !guestToken) {
    return {
      success: true,
      data: createEmptyHydratedCart(),
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const cart = await prisma.cart.findFirst({
      where: userId
        ? { userId }
        : { guestToken: guestToken! },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!cart) {
      return {
        success: true,
        data: createEmptyHydratedCart(guestToken, userId),
        timestamp: new Date().toISOString(),
      };
    }

    const hydrated = await hydrateAndPruneCart(cart);
    return {
      success: true,
      data: hydrated,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[CartService] Error fetching cart:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch cart",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Adds an item to the user or guest cart with stock limit enforcement.
 */
export async function addToCart(
  dto: AddToCartDto,
  guestToken?: string,
  userId?: string
): Promise<ApiResponse<HydratedCart>> {
  const validated = addToCartSchema.safeParse(dto);
  if (!validated.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid add-to-cart payload",
        details: validated.error.flatten().fieldErrors,
      },
      timestamp: new Date().toISOString(),
    };
  }

  const effectiveGuestToken = !userId && !guestToken ? generateGuestToken() : guestToken;

  try {
    // 1. Verify variant exists and is not archived
    const variant = await prisma.productVariant.findUnique({
      where: { id: dto.variantId },
      include: { product: true },
    });

    if (!variant || !variant.product) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Product variant not found",
        },
        timestamp: new Date().toISOString(),
      };
    }

    if (variant.product.isArchived) {
      return {
        success: false,
        error: {
          code: "PRODUCT_UNAVAILABLE",
          message: "Product is no longer available",
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Resolve or create cart
    let cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { guestToken: effectiveGuestToken },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: userId
          ? { userId }
          : { guestToken: effectiveGuestToken },
        include: { items: true },
      });
    }

    // 3. Check cumulative stock limits
    const existingItem = cart.items.find((item) => item.variantId === dto.variantId);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const requestedTotal = currentQuantity + dto.quantity;

    if (requestedTotal > variant.stock) {
      return {
        success: false,
        error: {
          code: "INSUFFICIENT_STOCK",
          message: `Requested quantity (${requestedTotal}) exceeds available stock (${variant.stock})`,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 4. Upsert item
    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: requestedTotal },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: dto.variantId,
          quantity: dto.quantity,
        },
      });
    }

    // 5. Return updated hydrated cart
    return await getCart(cart.guestToken ?? effectiveGuestToken, cart.userId ?? userId);
  } catch (error) {
    console.error("[CartService] Error adding to cart:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to add item to cart",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Updates the quantity of a cart item. If quantity is 0, removes the item.
 * Strictly verifies ownership of the cart item.
 */
export async function updateCartItem(
  itemId: string,
  dto: UpdateCartItemDto,
  guestToken?: string,
  userId?: string
): Promise<ApiResponse<HydratedCart>> {
  const validated = updateCartItemSchema.safeParse(dto);
  if (!validated.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid update cart item payload",
        details: validated.error.flatten().fieldErrors,
      },
      timestamp: new Date().toISOString(),
    };
  }

  try {
    // 1. Locate cart item with its cart and variant
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        variant: true,
      },
    });

    if (!item) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Cart item not found",
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Ownership verification invariant
    const isOwner =
      (userId && item.cart.userId === userId) ||
      (guestToken && item.cart.guestToken === guestToken);

    if (!isOwner) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to modify this cart item",
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 3. If quantity is 0, remove item
    if (dto.quantity === 0) {
      await prisma.cartItem.delete({
        where: { id: itemId },
      });
      return await getCart(item.cart.guestToken ?? guestToken, item.cart.userId ?? userId);
    }

    // 4. Check variant stock limit
    if (dto.quantity > item.variant.stock) {
      return {
        success: false,
        error: {
          code: "INSUFFICIENT_STOCK",
          message: `Requested quantity (${dto.quantity}) exceeds available stock (${item.variant.stock})`,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 5. Update item
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    return await getCart(item.cart.guestToken ?? guestToken, item.cart.userId ?? userId);
  } catch (error) {
    console.error("[CartService] Error updating cart item:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update cart item",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Removes an item from the cart after verifying ownership.
 */
export async function removeCartItem(
  itemId: string,
  guestToken?: string,
  userId?: string
): Promise<ApiResponse<HydratedCart>> {
  try {
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
      },
    });

    if (!item) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Cart item not found",
        },
        timestamp: new Date().toISOString(),
      };
    }

    const isOwner =
      (userId && item.cart.userId === userId) ||
      (guestToken && item.cart.guestToken === guestToken);

    if (!isOwner) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to remove this cart item",
        },
        timestamp: new Date().toISOString(),
      };
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return await getCart(item.cart.guestToken ?? guestToken, item.cart.userId ?? userId);
  } catch (error) {
    console.error("[CartService] Error removing cart item:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to remove cart item",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Merges a guest cart into an authenticated user's cart.
 * Unique items are transferred, and duplicate variant quantities are summed.
 * The guest cart is deleted upon completion.
 */
export async function mergeGuestCart(
  guestToken: string,
  userId: string
): Promise<ApiResponse<HydratedCart>> {
  try {
    const guestCart = await prisma.cart.findUnique({
      where: { guestToken },
      include: {
        items: {
          include: {
            variant: true,
          },
        },
      },
    });

    if (!guestCart || guestCart.items.length === 0) {
      if (guestCart) {
        await prisma.cart.delete({ where: { id: guestCart.id } });
      }
      return await getCart(undefined, userId);
    }

    // Resolve or create user cart
    let userCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: true,
      },
    });

    if (!userCart) {
      userCart = await prisma.cart.create({
        data: { userId },
        include: { items: true },
      });
    }

    // Merge in an atomic transaction
    await prisma.$transaction(async (tx) => {
      for (const guestItem of guestCart.items) {
        const existingUserItem = userCart.items.find(
          (item) => item.variantId === guestItem.variantId
        );

        if (existingUserItem) {
          const summedQuantity = existingUserItem.quantity + guestItem.quantity;
          await tx.cartItem.update({
            where: { id: existingUserItem.id },
            data: { quantity: summedQuantity },
          });
          await tx.cartItem.delete({
            where: { id: guestItem.id },
          });
        } else {
          await tx.cartItem.update({
            where: { id: guestItem.id },
            data: { cartId: userCart.id },
          });
        }
      }

      // Delete the guest cart row
      await tx.cart.delete({
        where: { id: guestCart.id },
      });
    });

    return await getCart(undefined, userId);
  } catch (error) {
    console.error("[CartService] Error merging guest cart:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to merge guest cart",
      },
      timestamp: new Date().toISOString(),
    };
  }
}
