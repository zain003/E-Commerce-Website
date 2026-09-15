import { stripe } from "@/lib/payments/stripe";
import { prisma } from "@/lib/prisma";
import { calculateCartTotals, getVariantUnitPrice } from "@/lib/services/cart-calculator";
import { calculateShippingFee } from "@/lib/services/shipping-calculator";
import { incrementCouponUsage } from "@/lib/services/coupons";
import Stripe from "stripe";

export interface StripeWebhookResult {
  received: boolean;
  orderId?: string;
}

/**
 * Generates a unique, human-friendly order number with timestamp and random suffix.
 * e.g., ORD-LZB3K1-A4F2
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${randomSuffix}`;
}

/**
 * Creates an order from a succeeded PaymentIntent in an idempotent, atomic transaction.
 * Can be invoked by:
 * 1. Stripe Webhook handler (`handleStripeWebhook`)
 * 2. Client confirm endpoint (`POST /api/checkout/confirm`)
 * 3. Server fallback on `/order-confirmation` page
 */
export async function createOrderFromPaymentIntent(
  paymentIntentOrId: string | Stripe.PaymentIntent
) {
  // If string ID was passed, first check if order already exists
  if (typeof paymentIntentOrId === "string") {
    const existing = await prisma.order.findUnique({
      where: { stripePaymentId: paymentIntentOrId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        user: true,
      },
    });

    if (existing) {
      console.log(
        `[StripeWebhook] Order already exists for payment ${paymentIntentOrId}: ${existing.id}`
      );
      return existing;
    }
  }

  let paymentIntent: Stripe.PaymentIntent;
  if (typeof paymentIntentOrId === "string") {
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentOrId);
  } else {
    paymentIntent = paymentIntentOrId;
  }

  // 1. Idempotency check: if stripePaymentId already exists in Order table, return without re-processing
  const existingOrder = await prisma.order.findUnique({
    where: { stripePaymentId: paymentIntent.id },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
      user: true,
    },
  });

  if (existingOrder) {
    console.log(
      `[StripeWebhook] Order already exists for payment ${paymentIntent.id}: ${existingOrder.id}`
    );
    return existingOrder;
  }

  // 2. Validate metadata
  const metadata = paymentIntent.metadata || {};
  const cartId = metadata.cartId;

  if (!cartId) {
    console.error(
      "[StripeWebhook] PaymentIntent missing required metadata:",
      paymentIntent.id,
      metadata
    );
    return null;
  }

  // 3. Concurrency-safe atomic transaction
  try {
    const order = await prisma.$transaction(
      async (tx) => {
        // Fetch cart with items, variants, and product base prices
        const cart = await tx.cart.findUnique({
          where: { id: cartId },
          include: {
            items: {
              include: {
                variant: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        });

        if (!cart || cart.items.length === 0) {
          // If cart was already cleared or deleted by a concurrent process, check if order exists
          const existingDuringTx = await tx.order.findUnique({
            where: { stripePaymentId: paymentIntent.id },
            include: {
              items: {
                include: {
                  variant: {
                    include: {
                      product: true,
                    },
                  },
                },
              },
              user: true,
            },
          });

          if (existingDuringTx) {
            return existingDuringTx;
          }

          console.error(
            `[StripeWebhook] Cart ${cartId} not found or empty during order creation`
          );
          return null;
        }

        // Check stock levels & log admin alert if deficit
        for (const item of cart.items) {
          if (item.variant.stock < item.quantity) {
            console.warn(
              `[ADMIN ALERT] Stock deficit detected during order creation for variant ${item.variant.sku} (ID: ${item.variant.id}). Required: ${item.quantity}, available: ${item.variant.stock}. Order will proceed with stock decrement and requires manual review.`
            );
          }
        }

        // Calculate item unit prices and line items
        const orderItemsData = cart.items.map((item) => {
          const unitPrice = getVariantUnitPrice(item.variant);
          return {
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice,
          };
        });

        // Compute subtotal, shipping fee, and total
        const cartTotals = calculateCartTotals(cart.items as any);
        const shippingMethodId = (
          metadata.shippingMethodId === "EXPRESS" ? "EXPRESS" : "STANDARD"
        ) as "STANDARD" | "EXPRESS";
        const shippingFee = calculateShippingFee(
          cartTotals.subtotal,
          shippingMethodId
        );
        const rawDiscount = metadata.discountTotal ? parseFloat(metadata.discountTotal) : 0.0;
        const discountTotal = isNaN(rawDiscount) ? 0.0 : Math.max(0, rawDiscount);
        const total = Math.round(Math.max(0, cartTotals.subtotal + shippingFee - discountTotal) * 100) / 100;

        // Parse shipping address safely
        let parsedShippingAddress: any = {};
        if (typeof metadata.shippingAddress === "string") {
          try {
            parsedShippingAddress = JSON.parse(metadata.shippingAddress);
          } catch {
            parsedShippingAddress = { raw: metadata.shippingAddress };
          }
        } else if (
          metadata.shippingAddress &&
          typeof metadata.shippingAddress === "object"
        ) {
          parsedShippingAddress = metadata.shippingAddress;
        }

        const orderNumber = generateOrderNumber();

        // 1. Create Order and OrderItem records
        const createdOrder = await tx.order.create({
          data: {
            orderNumber,
            userId: metadata.userId ? metadata.userId : (cart.userId || null),
            guestEmail: metadata.guestEmail || null,
            status: "PROCESSING",
            paymentStatus: "PAID",
            stripePaymentId: paymentIntent.id,
            subtotal: cartTotals.subtotal,
            discountTotal,
            shippingFee,
            total,
            shippingAddress: parsedShippingAddress,
            items: {
              create: orderItemsData,
            },
          },
          include: {
            items: {
              include: {
                variant: {
                  include: {
                    product: true,
                  },
                },
              },
            },
            user: true,
          },
        });

        // 2. Decrement stock on ProductVariant records in parallel
        await Promise.all(
          cart.items.map((item) =>
            tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            })
          )
        );

        // 3. Clear CartItem records and delete Cart
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        await tx.cart.delete({
          where: { id: cart.id },
        });

        return createdOrder;
      },
      {
        maxWait: 15000,
        timeout: 30000,
      }
    );

    if (order) {
      if (metadata.couponCode && metadata.couponCode.trim()) {
        try {
          await incrementCouponUsage(metadata.couponCode.trim());
        } catch (couponErr) {
          console.warn("[OrderCreation] Failed to increment coupon usage:", couponErr);
        }
      }
      return order;
    }
    return null;
  } catch (txError: any) {
    // Check for P2002 unique constraint on stripePaymentId (concurrent webhook delivery race condition)
    if (
      txError?.code === "P2002" ||
      String(txError?.message).includes("stripePaymentId")
    ) {
      const concurrentOrder = await prisma.order.findUnique({
        where: { stripePaymentId: paymentIntent.id },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: true,
                },
              },
            },
          },
          user: true,
        },
      });
      if (concurrentOrder) {
        console.log(
          `[StripeWebhook] Resolved concurrent webhook race condition for payment ${paymentIntent.id}: ${concurrentOrder.id}`
        );
        return concurrentOrder;
      }
    }

    // Otherwise rethrow transaction error
    throw txError;
  }
}

/**
 * Handles incoming Stripe webhook events with cryptographic signature verification,
 * idempotency checks, atomic Prisma order creation, stock decrementing, and cart cleanup.
 */
export async function handleStripeWebhook(
  rawBody: string | Buffer,
  signature: string
): Promise<StripeWebhookResult> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    const error = new Error("WEBHOOK_SIGNATURE_VERIFICATION_FAILED");
    (error as any).cause = err;
    throw error;
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const order = await createOrderFromPaymentIntent(paymentIntent);
    return { received: true, orderId: order?.id };
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const failureMessage =
      paymentIntent.last_payment_error?.message || "Payment failed";

    console.error(
      "[StripeWebhook] Payment failed for PaymentIntent:",
      paymentIntent.id,
      failureMessage
    );

    const existingOrder = await prisma.order.findUnique({
      where: { stripePaymentId: paymentIntent.id },
    });

    if (existingOrder) {
      await prisma.order.update({
        where: { id: existingOrder.id },
        data: { paymentStatus: "FAILED" },
      });
    }

    return { received: true };
  }

  return { received: true };
}
