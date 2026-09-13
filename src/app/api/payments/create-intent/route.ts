import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CART_COOKIE_NAME, getGuestCartToken } from "@/lib/cookies/cart-cookie";
import { apiError, apiSuccess } from "@/lib/api-response";
import { createPaymentIntent } from "@/lib/services/payments";
import { validateCreatePaymentIntentInput } from "@/lib/validators/payments";

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
    const isGuest = !userId;

    // Validate payload against schema and role expectations
    const validation = validateCreatePaymentIntentInput(body, isGuest);
    if (!validation.success || !validation.data) {
      return apiError(
        validation.error?.code ?? "VALIDATION_ERROR",
        validation.error?.message ?? "Invalid payment intent payload",
        400,
        validation.error?.details
      );
    }

    const guestToken =
      req.cookies.get(CART_COOKIE_NAME)?.value || (await getGuestCartToken());

    const result = await createPaymentIntent(
      validation.data,
      guestToken,
      userId
    );

    if (!result.success || !result.data) {
      let status = 400;
      if (result.error?.code === "SERVICE_UNAVAILABLE") {
        status = 503;
      } else if (result.error?.code === "INTERNAL_SERVER_ERROR") {
        status = 500;
      }

      return apiError(
        result.error?.code ?? "PAYMENT_INTENT_FAILED",
        result.error?.message ?? "Failed to create payment intent",
        status,
        result.error?.details
      );
    }

    return apiSuccess(result.data, 200);
  } catch (error) {
    console.error("[PaymentsRoute] POST /api/payments/create-intent error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "An unexpected error occurred", 500);
  }
}
