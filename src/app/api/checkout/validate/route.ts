import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateCheckoutSession } from "@/lib/services/checkout";
import { CART_COOKIE_NAME, getGuestCartToken } from "@/lib/cookies/cart-cookie";
import { apiError, apiSuccess } from "@/lib/api-response";
import { CheckoutSessionDto } from "@/types";

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("VALIDATION_ERROR", "Invalid JSON payload", 400);
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const guestToken =
      req.cookies.get(CART_COOKIE_NAME)?.value || (await getGuestCartToken());

    const result = await validateCheckoutSession(
      body as CheckoutSessionDto,
      guestToken,
      userId
    );

    if (!result.success || !result.data) {
      const status =
        result.error?.code === "CART_EMPTY" ||
        result.error?.code === "STOCK_CHANGED" ||
        result.error?.code === "VALIDATION_ERROR"
          ? 400
          : 500;

      return apiError(
        result.error?.code ?? "VALIDATION_ERROR",
        result.error?.message ?? "Checkout validation failed",
        status,
        result.error?.details
      );
    }

    return apiSuccess(result.data, 200);
  } catch (error) {
    console.error("[CheckoutRoute] POST /api/checkout/validate error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "An unexpected error occurred", 500);
  }
}
