import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserOrders } from "@/lib/services/orders";
import { OrderHistoryList } from "@/components/orders/order-history-list";
import { serializeData } from "@/lib/utils";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
  title: "Order History — E-Commerce Store",
  description: "View past orders, delivery tracking, and purchase receipts",
};

interface AccountOrdersPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
}

export default async function AccountOrdersPage({
  searchParams,
}: AccountOrdersPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login?callbackUrl=/account/orders");
  }

  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10) || 1);
  const limit = Math.max(1, parseInt(resolvedParams.limit || "10", 10) || 10);

  const result = await getUserOrders(session.user.id, page, limit);

  const ordersData = result.success && result.data
    ? serializeData(result.data)
    : { items: [], total: 0, page: 1, limit, totalPages: 1 };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Navigation Breadcrumb */}
      <div>
        <BackButton fallbackUrl="/account/profile" label="Back" />
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Order History
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View all your previous purchases, download printable receipts, and track shipments
        </p>
      </div>

      {/* Order List */}
      <OrderHistoryList
        orders={ordersData.items}
        total={ordersData.total}
        page={ordersData.page}
        totalPages={ordersData.totalPages}
      />
    </div>
  );
}
