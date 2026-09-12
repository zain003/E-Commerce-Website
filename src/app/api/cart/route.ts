import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCart } from "@/lib/services/cart";
import { CART_COOKIE_NAME } from "@/lib/cookies/cart-cookie";
import { apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const guestToken = req.cookies.get(CART_COOKIE_NAME)?.value;

    const result = await getCart(guestToken, userId);

    if (!result.success) {
      return apiError(
        result.error?.code ?? "INTERNAL_SERVER_ERROR",
        result.error?.message ?? "Failed to fetch cart",
        500
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[CartRoute] GET /api/cart error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "An unexpected error occurred", 500);
  }
}
