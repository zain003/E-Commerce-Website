import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  TrendingUp,
  Award,
  Truck,
  Leaf,
} from "lucide-react";
import { getFeaturedProducts, getCategories } from "@/lib/services/products";
import { ProductCard } from "@/components/product/product-card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, toNumericPrice } from "@/components/product/price-tag";
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

  const trendingProduct = featuredProducts.length > 0 ? featuredProducts[0] : null;

  return (
    <div className="flex flex-col">
      {/* Editorial Luxury Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 md:pt-28 md:pb-32 bg-radial-[at_top_center] from-muted/50 via-background to-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center text-center">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-foreground shadow-2xs backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>Artisanal Craftsmanship • Autumn / Winter Collection</span>
            </div>

            {/* Layered Headline mixing bold sans and italic serif */}
            <h1 className="mt-6 max-w-4xl text-4xl font-extrabold tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Modern essentials, crafted for{" "}
              <span className="font-serif italic font-normal text-muted-foreground">
                timeless living.
              </span>
            </h1>

            {/* Editorial Subtitle */}
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
              Discover an uncompromising collection of curated wardrobe anchors and artisanal goods,
              masterfully tailored with ethical integrity and carbon-neutral delivery.
            </p>

            {/* Hero CTAs */}
            <div className="mt-9 flex flex-col gap-3.5 sm:flex-row sm:items-center">
              <Link
                href="/#featured"
                className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95"
              >
                <span>Shop Featured Collection</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#categories"
                className="inline-flex h-12 items-center justify-center rounded-full border border-border/90 bg-card px-8 text-sm font-semibold text-foreground shadow-2xs transition-all hover:bg-muted hover:border-foreground/20 active:scale-95"
              >
                Browse Categories
              </Link>
            </div>

            {/* Floating Trending Spotlight Card (Overlay) */}
            {trendingProduct && (
              <div className="mt-12 w-full max-w-md">
                <Link
                  href={`/products/${trendingProduct.slug}`}
                  className="group flex items-center justify-between rounded-2xl border border-border/80 bg-card/90 p-3.5 text-left shadow-atelier backdrop-blur-md transition-all hover:border-border hover:shadow-atelier-lg"
                >
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {trendingProduct.images && trendingProduct.images[0] ? (
                        <Image
                          src={trendingProduct.images[0]}
                          alt={trendingProduct.name}
                          fill
                          sizes="56px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                        <TrendingUp className="h-3 w-3" />
                        <span>Trending #1 Bestseller</span>
                      </div>
                      <div className="truncate text-xs font-semibold text-foreground group-hover:text-primary">
                        {trendingProduct.name}
                      </div>
                      <div className="text-xs font-medium text-muted-foreground">
                        {formatCurrency(toNumericPrice(trendingProduct.basePrice))}
                      </div>
                    </div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground shrink-0 ml-3">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Refined Monochrome Trust Marquee */}
      <div
        aria-hidden="true"
        className="overflow-hidden border-y border-border/60 bg-muted/40 py-3.5 text-[11px] font-bold tracking-[0.25em] uppercase text-muted-foreground"
      >
        <div className="flex whitespace-nowrap justify-around gap-8 opacity-80">
          <span>Artisanal Craftsmanship</span>
          <span>•</span>
          <span>Carbon-Neutral Delivery</span>
          <span>•</span>
          <span>Ethically Sourced Materials</span>
          <span>•</span>
          <span>Lifetime Atelier Guarantee</span>
          <span>•</span>
          <span>30-Day Effortless Returns</span>
        </div>
      </div>

      {/* Category Badges / Pills Strip */}
      {categories && categories.length > 0 && (
        <section id="categories" className="py-8 border-b border-border/60 bg-background">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                Shop by Category
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
                      className="px-4 py-1.5 text-xs font-medium transition-all hover:border-foreground/30 hover:bg-muted cursor-pointer rounded-full border border-border/60 bg-card text-foreground shadow-2xs"
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
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.2em] uppercase text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Atelier Selection</span>
              </div>
              <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                Curated Essentials
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Explore our handpicked collection of modern luxury essentials.
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

      {/* Quiet Luxury Value Proposition Highlights */}
      <section id="features" className="border-y border-border/60 bg-card py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-border/60 bg-background/80 p-6 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Artisanal Craftsmanship</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Masterfully tailored pieces made with pure organic fibers and heirloom quality standards.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 rounded-2xl border border-border/60 bg-background/80 p-6 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Carbon-Neutral Delivery</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Complimentary global shipping on orders over $100 with 100% verified carbon offset logistics.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 rounded-2xl border border-border/60 bg-background/80 p-6 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Leaf className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Ethically Sourced</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Sustainable sourcing practices with certified supply chain transparency and zero harsh chemicals.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 rounded-2xl border border-border/60 bg-background/80 p-6 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Encrypted 256-Bit Checkout</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                PCI-compliant bank-grade payment encryption powered by Stripe with guaranteed buyer privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Portal */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                <span>Account Services</span>
              </div>
              <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Customer Services Portal
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your orders, saved delivery destinations, and customer profile.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/account/profile"
              className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-6 shadow-atelier transition-all hover:border-border hover:shadow-atelier-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    Account
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  Customer Profile
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  View and update your personal details, email preferences, and security settings.
                </p>
              </div>
              <span className="mt-6 text-xs font-semibold text-primary group-hover:underline">
                View Profile &rarr;
              </span>
            </Link>

            <Link
              href="/account/addresses"
              className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-6 shadow-atelier transition-all hover:border-border hover:shadow-atelier-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                    Shipping
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  Saved Destinations
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  Manage primary delivery addresses and streamline your multi-step checkout.
                </p>
              </div>
              <span className="mt-6 text-xs font-semibold text-primary group-hover:underline">
                Manage Addresses &rarr;
              </span>
            </Link>

            <Link
              href="/login"
              className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-6 shadow-atelier transition-all hover:border-border hover:shadow-atelier-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    Security
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  Authentication & Orders
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  Sign in to view real-time tracking for recent orders, receipts, and invoices.
                </p>
              </div>
              <span className="mt-6 text-xs font-semibold text-primary group-hover:underline">
                Sign In &rarr;
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

