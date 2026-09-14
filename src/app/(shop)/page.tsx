import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { getFeaturedProducts, getCategories } from "@/lib/services/products";
import { ProductCard } from "@/components/product/product-card";
import { Badge } from "@/components/ui/badge";
import { serializeData } from "@/lib/utils";

export default async function HomePage() {
  let featuredProducts: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    const [rawFeatured, rawCategories] = await Promise.all([
      getFeaturedProducts(),
      getCategories(),
    ]);
    featuredProducts = serializeData(rawFeatured);
    categories = serializeData(rawCategories);
  } catch (error) {
    console.warn("Notice: Database unavailable during page render. Rendering with empty catalog state.", error);
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3.5 py-1 text-xs font-medium text-muted-foreground shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Next.js 16 • React 19 • Tailwind CSS v4</span>
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Modern essentials, crafted for effortless everyday living.
            </h1>

            <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
              Experience sub-second catalog browsing, zero learning curve checkout,
              and real-time inventory synchronization.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/#featured"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
              >
                <span>Shop Featured Collection</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#categories"
                className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-7 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-95"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Badges / Pills Strip */}
      {categories && categories.length > 0 && (
        <section id="categories" className="border-y border-border bg-muted/20 py-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Shop by Category:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${encodeURIComponent(category.slug)}`}
                    className="focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-full"
                  >
                    <Badge
                      variant="secondary"
                      className="px-3.5 py-1 text-xs font-medium transition-all hover:border-foreground/30 hover:bg-muted cursor-pointer"
                    >
                      {category.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Grid */}
      <section id="featured" className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Curated Catalog</span>
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Featured Products
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Explore our handpicked selection of premium essentials.
              </p>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Showing {featuredProducts.length} {featuredProducts.length === 1 ? "item" : "items"}
            </span>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 4}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                No Featured Products Yet
              </h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Our catalog is being updated with fresh arrivals. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Value Proposition Highlights */}
      <section id="features" className="border-y border-border bg-card py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-start gap-2.5 rounded-xl border border-border/60 bg-background p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Sub-Second Speed</h3>
              <p className="text-sm text-muted-foreground">
                Instantaneous page loads backed by Next.js 16 App Router and Turbopack.
              </p>
            </div>

            <div className="flex flex-col items-start gap-2.5 rounded-xl border border-border/60 bg-background p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Secure Stripe Checkout</h3>
              <p className="text-sm text-muted-foreground">
                Encrypted payment processing with idempotent order verification and zero secret leakage.
              </p>
            </div>

            <div className="flex flex-col items-start gap-2.5 rounded-xl border border-border/60 bg-background p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <RotateCcw className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Easy Address Management</h3>
              <p className="text-sm text-muted-foreground">
                Save, edit, and toggle default shipping destinations with one click.
              </p>
            </div>

            <div className="flex flex-col items-start gap-2.5 rounded-xl border border-border/60 bg-background p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Mobile-First Design</h3>
              <p className="text-sm text-muted-foreground">
                Thumb-friendly interactions optimized for seamless shopping on any screen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links & Modules Showcase */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Quick Access Portal
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Explore customer account views and verified system modules.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/account/profile"
              className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-all hover:border-foreground/30 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    Account
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  Customer Profile
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Inspect your authenticated profile, roles, and membership details.
                </p>
              </div>
              <span className="mt-6 text-xs font-medium text-primary">
                View Profile &rarr;
              </span>
            </Link>

            <Link
              href="/account/addresses"
              className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-all hover:border-foreground/30 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                    Shipping
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  Saved Addresses
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Manage delivery destinations, set defaults, and update shipping details.
                </p>
              </div>
              <span className="mt-6 text-xs font-medium text-primary">
                Manage Addresses &rarr;
              </span>
            </Link>

            <Link
              href="/login"
              className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-6 transition-all hover:border-foreground/30 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    Security
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  Authentication Flow
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Credentials login, registration with Zod validation, and session guard.
                </p>
              </div>
              <span className="mt-6 text-xs font-medium text-primary">
                Go to Login &rarr;
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
