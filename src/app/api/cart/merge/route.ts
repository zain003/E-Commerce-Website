import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCart, mergeGuestCart } from "@/lib/services/cart";
import {
  CART_COOKIE_NAME,
  clearGuestCartCookie,
} from "@/lib/cookies/cart-cookie";
import { mergeCartSchema } from "@/lib/validators/cart";
import { apiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return apiError("UNAUTHORIZED", "Authentication required to merge cart", 401);
    }

    const cookieGuestToken = req.cookies.get(CART_COOKIE_NAME)?.value;
    const body = await req.json().catch(() => null);
    const parsedBody = body ? mergeCartSchema.safeParse(body) : null;
    const bodyGuestToken = parsedBody?.success ? parsedBody.data.guestToken : undefined;

    const guestToken = cookieGuestToken || bodyGuestToken;

    if (!guestToken) {
      // Nothing to merge; return current user cart
      const currentCart = await getCart(undefined, session.user.id);
      return NextResponse.json(currentCart, { status: 200 });
    }

    const result = await mergeGuestCart(guestToken, session.user.id);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    const response = NextResponse.json(result, { status: 200 });
    clearGuestCartCookie(response);
    return response;
  } catch (error) {
    console.error("[CartRoute] POST /api/cart/merge error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "An unexpected error occurred", 500);
  }
}
