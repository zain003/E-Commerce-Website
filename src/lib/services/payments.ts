import { stripe, calculateStripeAmount } from "@/lib/payments/stripe";
import {
  ApiResponse,
  CreatePaymentIntentDto,
  PaymentIntentResponse,
} from "@/types";
import { getCart } from "./cart";
import { validateCheckoutSession } from "./checkout";

/**
 * Creates a Stripe PaymentIntent with server-side verified cart totals and metadata.
 * Strictly adheres to the Server-Side Price Invariant.
 */
export async function createPaymentIntent(
  dto: CreatePaymentIntentDto,
  guestToken?: string,
  userId?: string
): Promise<ApiResponse<PaymentIntentResponse>> {
  try {
    // 1. Fetch cart to verify existence and retrieve cartId
    const cartRes = await getCart(guestToken, userId);
    if (!cartRes.success || !cartRes.data || cartRes.data.items.length === 0) {
      return {
        success: false,
        error: {
          code: "CART_EMPTY",
          message: "Cart is empty. Add items before proceeding to payment.",
        },
        timestamp: new Date().toISOString(),
      };
    }

    const cart = cartRes.data;

    // 2. Validate checkout session, addresses, and live inventory stock
    const sessionRes = await validateCheckoutSession(
      dto.checkoutSession,
      guestToken,
      userId
    );

    if (!sessionRes.success || !sessionRes.data) {
      return {
        success: false,
        error: sessionRes.error,
        timestamp: new Date().toISOString(),
      };
    }

    const preview = sessionRes.data.preview;

    // 3. Convert verified totals strictly to integer cents
    const amountInCents = calculateStripeAmount(
      preview.subtotal,
      preview.shippingFee,
      preview.discountTotal
    );

    if (amountInCents <= 0) {
      return {
        success: false,
        error: {
          code: "INVALID_AMOUNT",
          message: "Order total must be greater than zero to process payment.",
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 4. Construct metadata
    const metadata: Record<string, string> = {
      cartId: cart.id,
      userId: userId || "",
      guestEmail: dto.checkoutSession.guestEmail || "",
      shippingMethodId: dto.checkoutSession.shippingMethodId,
      shippingAddress: JSON.stringify(dto.checkoutSession.shippingAddress),
      couponCode: dto.checkoutSession.couponCode || "",
      discountTotal: String(preview.discountTotal || 0),
    };

    // 5. Determine idempotency key
    const idempotencyKey =
      dto.idempotencyKey || `pi_${cart.id}_${amountInCents}`;

    // 6. Invoke Stripe API
    try {
      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: amountInCents,
          currency: "usd",
          metadata,
          automatic_payment_methods: { enabled: true },
        },
        idempotencyKey ? { idempotencyKey } : undefined
      );

      if (!paymentIntent.client_secret) {
        return {
          success: false,
          error: {
            code: "STRIPE_ERROR",
            message: "Failed to retrieve client secret from Stripe.",
          },
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: amountInCents,
          currency: "usd",
        },
        timestamp: new Date().toISOString(),
      };
    } catch (stripeError: unknown) {
      console.error("[PaymentsService] Stripe API error:", stripeError);

      const errorObj = stripeError as {
        name?: string;
        type?: string;
        statusCode?: number;
        message?: string;
      };

      const isOutage =
        errorObj?.name === "StripeConnectionError" ||
        errorObj?.type === "StripeConnectionError" ||
        errorObj?.name === "StripeAPIError" ||
        errorObj?.statusCode === 503 ||
        (typeof errorObj?.message === "string" &&
          errorObj.message.toLowerCase().includes("connection"));

      if (isOutage) {
        return {
          success: false,
          error: {
            code: "SERVICE_UNAVAILABLE",
            message:
              "Payment service is temporarily unavailable. Please try again later.",
          },
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: false,
        error: {
          code: "STRIPE_ERROR",
          message: errorObj?.message || "Failed to create payment intent.",
        },
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error("[PaymentsService] Unexpected error:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while processing payment intent.",
      },
      timestamp: new Date().toISOString(),
    };
  }
}
