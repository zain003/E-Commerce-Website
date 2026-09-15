import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-response";
import { createOrderFromPaymentIntent } from "@/lib/services/order-creation";
import { z } from "zod";

const confirmOrderSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
  guestEmail: z.string().email().optional(),
});

/**
 * Confirms payment and completes order creation immediately upon client-side Stripe checkout success.
 * POST /api/checkout/confirm
 */
export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return apiError("VALIDATION_ERROR", "Invalid JSON payload", 400);
    }

    const validation = confirmOrderSchema.safeParse(body);
    if (!validation.success) {
      return apiError(
        "VALIDATION_ERROR",
        validation.error.issues[0]?.message || "Invalid confirmation payload",
        400,
        validation.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { paymentIntentId } = validation.data;

    const order = await createOrderFromPaymentIntent(paymentIntentId);

    if (!order) {
      return apiError(
        "ORDER_CREATION_FAILED",
        "Could not verify payment or generate order confirmation",
        400
      );
    }

    return apiSuccess(
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
      },
      200
    );
  } catch (error: any) {
    console.error("[CheckoutConfirmRoute] Failed to confirm order:", error);
    return apiError(
      "INTERNAL_SERVER_ERROR",
      error?.message || "An unexpected error occurred while confirming order",
      500
    );
  }
}
