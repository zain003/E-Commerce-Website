import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { removeCartItem, updateCartItem } from "@/lib/services/cart";
import { updateCartItemSchema } from "@/lib/validators/cart";
import { CART_COOKIE_NAME } from "@/lib/cookies/cart-cookie";
import { apiError } from "@/lib/api-response";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return apiError("VALIDATION_ERROR", "Cart item ID is required", 400);
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const guestToken = req.cookies.get(CART_COOKIE_NAME)?.value;

    const body = await req.json().catch(() => null);
    const validated = updateCartItemSchema.safeParse(body);

    if (!validated.success) {
      return apiError(
        "VALIDATION_ERROR",
        "Invalid update payload",
        400,
        validated.error.flatten().fieldErrors
      );
    }

    const result = await updateCartItem(id, validated.data, guestToken, userId);

    if (!result.success) {
      const statusCode =
        result.error?.code === "NOT_FOUND"
          ? 404
          : result.error?.code === "FORBIDDEN"
          ? 403
          : result.error?.code === "INSUFFICIENT_STOCK"
          ? 400
          : 400;

      return NextResponse.json(result, { status: statusCode });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[CartRoute] PATCH /api/cart/items/[id] error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "An unexpected error occurred", 500);
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return apiError("VALIDATION_ERROR", "Cart item ID is required", 400);
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const guestToken = req.cookies.get(CART_COOKIE_NAME)?.value;

    const result = await removeCartItem(id, guestToken, userId);

    if (!result.success) {
      const statusCode =
        result.error?.code === "NOT_FOUND"
          ? 404
          : result.error?.code === "FORBIDDEN"
          ? 403
          : 400;

      return NextResponse.json(result, { status: statusCode });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[CartRoute] DELETE /api/cart/items/[id] error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "An unexpected error occurred", 500);
  }
}
