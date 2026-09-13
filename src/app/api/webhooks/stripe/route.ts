import { NextRequest, NextResponse } from "next/server";
import { handleStripeWebhook } from "@/lib/services/order-creation";

/**
 * Stripe Webhook Route Handler (Next.js 16 App Router)
 * POST /api/webhooks/stripe
 *
 * Verifies cryptographic signature using raw request body,
 * enforces idempotent order creation, decrements stock, and cleans up cart.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "WEBHOOK_SIGNATURE_VERIFICATION_FAILED",
            message: "Missing Stripe signature header",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    try {
      const result = await handleStripeWebhook(rawBody, signature);

      return NextResponse.json(
        {
          received: result.received,
          orderId: result.orderId,
          success: true,
          data: result,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } catch (err: any) {
      if (
        err?.message === "WEBHOOK_SIGNATURE_VERIFICATION_FAILED" ||
        err?.type === "StripeSignatureVerificationError" ||
        err?.name === "StripeSignatureVerificationError"
      ) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "WEBHOOK_SIGNATURE_VERIFICATION_FAILED",
              message: err.message || "Invalid Stripe webhook signature",
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      console.error("[StripeWebhookRoute] Webhook processing failed:", err);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: err?.message || "Webhook processing failed",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[StripeWebhookRoute] Request parsing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to read request body",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
