import { Metadata } from "next";
import { Suspense } from "react";
import { getCategories } from "@/lib/services/products";
import { searchProducts } from "@/lib/services/search";
import { parseSearchParams } from "@/lib/validators/search";
import { CatalogView } from "@/components/search/catalog-view";

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const parsed = parseSearchParams(resolvedParams);

  if (parsed.success && parsed.data.query) {
    return {
      title: `Search: "${parsed.data.query}" | Modern Store`,
      description: `Browse product results for "${parsed.data.query}".`,
    };
  }

  if (parsed.success && parsed.data.categorySlug) {
    return {
      title: `${parsed.data.categorySlug.toUpperCase()} Collection | Modern Store`,
      description: `Explore our collection of ${parsed.data.categorySlug} items.`,
    };
  }

  return {
    title: "All Products Catalog | Modern Store",
    description: "Explore our complete collection of modern everyday essentials.",
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // In Next.js 16, searchParams is a Promise and must be awaited
  const resolvedSearchParams = await searchParams;
  const parseResult = parseSearchParams(resolvedSearchParams);

  const searchFilterParams = parseResult.success
    ? parseResult.data
    : { page: 1, limit: 12, sortBy: "newest" as const };

  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let searchResult: Awaited<ReturnType<typeof searchProducts>> = {
    items: [],
    total: 0,
    page: searchFilterParams.page || 1,
    limit: searchFilterParams.limit || 12,
    totalPages: 0,
  };

  try {
    const [fetchedCategories, fetchedResults] = await Promise.all([
      getCategories(),
      searchProducts(searchFilterParams),
    ]);
    categories = fetchedCategories;
    searchResult = fetchedResults;
  } catch (error) {
    console.warn("[ProductsPage] Catalog fetch fallback:", error);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Product Catalog
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Discover our curated collection with instant multi-criteria filtering.
        </p>
      </div>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted/40" />}>
        <CatalogView
          initialProducts={searchResult.items}
          initialTotal={searchResult.total}
          initialPage={searchResult.page}
          initialLimit={searchResult.limit}
          initialTotalPages={searchResult.totalPages}
          categories={categories}
        />
      </Suspense>
    </div>
  );
}
