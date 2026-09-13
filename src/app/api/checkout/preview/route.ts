import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCheckoutPreview } from "@/lib/services/checkout";
import { CART_COOKIE_NAME, getGuestCartToken } from "@/lib/cookies/cart-cookie";
import { apiError, apiSuccess } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const method = searchParams.get("method") || undefined;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const guestToken =
      req.cookies.get(CART_COOKIE_NAME)?.value || (await getGuestCartToken());

    const result = await getCheckoutPreview(method, guestToken, userId);

    if (!result.success || !result.data) {
      const status =
        result.error?.code === "CART_EMPTY" ||
        result.error?.code === "STOCK_CHANGED"
          ? 400
          : 500;
      return apiError(
        result.error?.code ?? "INTERNAL_SERVER_ERROR",
        result.error?.message ?? "Failed to generate checkout preview",
        status,
        result.error?.details
      );
    }

    return apiSuccess(result.data, 200);
  } catch (error) {
    console.error("[CheckoutRoute] GET /api/checkout/preview error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "An unexpected error occurred", 500);
  }
}
