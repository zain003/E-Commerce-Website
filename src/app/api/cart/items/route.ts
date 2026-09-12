import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addToCart } from "@/lib/services/cart";
import { addToCartSchema } from "@/lib/validators/cart";
import {
  attachGuestCartCookie,
  CART_COOKIE_NAME,
  generateGuestToken,
} from "@/lib/cookies/cart-cookie";
import { apiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    let guestToken = req.cookies.get(CART_COOKIE_NAME)?.value;
    let shouldSetCookie = false;

    if (!userId && !guestToken) {
      guestToken = generateGuestToken();
      shouldSetCookie = true;
    }

    const body = await req.json().catch(() => null);
    const validated = addToCartSchema.safeParse(body);

    if (!validated.success) {
      return apiError(
        "VALIDATION_ERROR",
        "Invalid add to cart payload",
        400,
        validated.error.flatten().fieldErrors
      );
    }

    const result = await addToCart(validated.data, guestToken, userId);

    if (!result.success) {
      const statusCode =
        result.error?.code === "NOT_FOUND"
          ? 404
          : result.error?.code === "INSUFFICIENT_STOCK"
          ? 400
          : 400;

      return NextResponse.json(result, { status: statusCode });
    }

    const response = NextResponse.json(result, { status: 201 });

    if (shouldSetCookie && guestToken) {
      attachGuestCartCookie(response, guestToken);
    }

    return response;
  } catch (error) {
    console.error("[CartRoute] POST /api/cart/items error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "An unexpected error occurred", 500);
  }
}
