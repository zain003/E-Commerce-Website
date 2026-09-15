import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminProducts } from "@/lib/services/admin-products";
import { getCategories } from "@/lib/services/products";
import { AdminProductsManager } from "@/components/admin/admin-products-manager";
import { AdminNav } from "@/components/admin/admin-nav";
import { serializeData } from "@/lib/utils";
import type { AdminProduct } from "@/types";

export const metadata: Metadata = {
  title: "Products — Admin Portal",
  description: "Manage catalog products, variants, pricing, and live inventory stock.",
};

interface AdminProductsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
}

export const instant = false;

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect("/login?callbackUrl=/admin/products");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10) || 1);
  const limit = Math.max(1, parseInt(resolvedParams.limit || "10", 10) || 10);

  const [productsResult, fetchedCategories] = await Promise.all([
    getAdminProducts(page, limit),
    getCategories(),
  ]);

  const categories = serializeData(fetchedCategories);
  const productsData =
    productsResult.success && productsResult.data
      ? serializeData(productsResult.data)
      : { items: [], total: 0, page: 1, limit, totalPages: 1 };

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <AdminNav />
      <AdminProductsManager
        initialProducts={productsData.items}
        categories={categories}
        total={productsData.total}
        page={productsData.page}
        limit={productsData.limit}
        totalPages={productsData.totalPages}
      />
    </div>
  );
}
