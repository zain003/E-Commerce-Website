import { stripe } from "@/lib/payments/stripe";
import { prisma } from "@/lib/prisma";
import { calculateCartTotals, getVariantUnitPrice } from "@/lib/services/cart-calculator";
import { calculateShippingFee } from "@/lib/services/shipping-calculator";
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

    // 1. Idempotency check: if stripePaymentId already exists in Order table, return without re-processing
    const existingOrder = await prisma.order.findUnique({
      where: { stripePaymentId: paymentIntent.id },
    });

    if (existingOrder) {
      console.log(
        `[StripeWebhook] Order already exists for payment ${paymentIntent.id}: ${existingOrder.id}`
      );
      return { received: true, orderId: existingOrder.id };
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
      return { received: true };
    }

    // 3. Concurrency-safe atomic transaction
    try {
      const order = await prisma.$transaction(async (tx) => {
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
        const total = Math.round((cartTotals.subtotal + shippingFee) * 100) / 100;

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
            discountTotal: 0.0,
            shippingFee,
            total,
            shippingAddress: parsedShippingAddress,
            items: {
              create: orderItemsData,
            },
          },
        });

        // 2. Decrement stock on ProductVariant records
        for (const item of cart.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        // 3. Clear CartItem records and delete Cart
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        await tx.cart.delete({
          where: { id: cart.id },
        });

        return createdOrder;
      });

      if (order) {
        return { received: true, orderId: order.id };
      }
      return { received: true };
    } catch (txError: any) {
      // Check for P2002 unique constraint on stripePaymentId (concurrent webhook delivery race condition)
      if (
        txError?.code === "P2002" ||
        String(txError?.message).includes("stripePaymentId")
      ) {
        const concurrentOrder = await prisma.order.findUnique({
          where: { stripePaymentId: paymentIntent.id },
        });
        if (concurrentOrder) {
          console.log(
            `[StripeWebhook] Resolved concurrent webhook race condition for payment ${paymentIntent.id}: ${concurrentOrder.id}`
          );
          return { received: true, orderId: concurrentOrder.id };
        }
      }

      // Otherwise rethrow transaction error
      throw txError;
    }
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
