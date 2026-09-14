import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrderByNumber } from "@/lib/services/orders";
import { OrderReceipt } from "@/components/orders/order-receipt";
import { serializeData } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ShoppingBag, Package } from "lucide-react";

export const metadata: Metadata = {
  title: "Order Confirmation — E-Commerce Store",
  description: "View and print your itemized purchase receipt and tracking details",
};

interface OrderConfirmationPageProps {
  searchParams: Promise<{
    orderNumber?: string;
    payment_intent?: string;
    guestEmail?: string;
  }>;
}

export default async function OrderConfirmationPage({
  searchParams,
}: OrderConfirmationPageProps) {
  const resolvedParams = await searchParams;
  const targetOrderNumber =
    resolvedParams.orderNumber || resolvedParams.payment_intent;

  if (!targetOrderNumber || targetOrderNumber.trim() === "") {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16 sm:px-6">
        <Card className="border-border text-center p-8 sm:p-12 space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <AlertCircle className="h-8 w-8 text-foreground" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Order Reference Missing</h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              We couldn&apos;t locate an order reference in this request. If you recently completed checkout, your confirmation receipt may still be generating.
            </p>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-md font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5 py-2 text-sm gap-2 w-full sm:w-auto"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Browse Products</span>
            </Link>
            <Link
              href="/account/orders"
              className="inline-flex items-center justify-center rounded-md font-medium transition-colors border border-border bg-background hover:bg-muted text-foreground h-10 px-5 py-2 text-sm gap-2 w-full sm:w-auto"
            >
              <Package className="h-4 w-4" />
              <span>My Orders</span>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const result = await getOrderByNumber(
    targetOrderNumber,
    resolvedParams.guestEmail,
    userId
  );

  if (!result.success || !result.data) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16 sm:px-6">
        <Card className="border-border text-center p-8 sm:p-12 space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Order Not Found</h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {result.error?.message ||
                "We were unable to locate order details for this reference. Please verify your order number or check your email."}
            </p>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-md font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5 py-2 text-sm gap-2 w-full sm:w-auto"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Continue Shopping</span>
            </Link>
            <Link
              href="/account/orders"
              className="inline-flex items-center justify-center rounded-md font-medium transition-colors border border-border bg-background hover:bg-muted text-foreground h-10 px-5 py-2 text-sm gap-2 w-full sm:w-auto"
            >
              <Package className="h-4 w-4" />
              <span>View Order History</span>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <OrderReceipt order={serializeData(result.data)} />
    </div>
  );
}
