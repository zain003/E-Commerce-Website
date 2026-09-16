import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  User,
  Search,
  Home as HomeIcon,
  ShieldCheck,
  Heart,
  Package,
  Sparkles,
  Truck,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  HeaderCartButton,
  MobileCartNavButton,
} from "@/components/layout/header-cart-button";
import { HeaderAccountButton } from "@/components/layout/header-account-button";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SpotlightSearch } from "@/components/layout/spotlight-search";
import { MegaMenu } from "@/components/layout/mega-menu";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* 36px Slim Luxury Rotating Announcement Strip */}
      <AnnouncementBar />

      {/* Floating Frosted Glass Header */}
      <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl shadow-2xs transition-all">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            {/* Brand Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span className="font-serif text-lg font-bold tracking-[0.2em] uppercase text-foreground">
                Atelier
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
              <MegaMenu />
              <Link
                href="/#categories"
                className="transition-colors hover:text-foreground py-2"
              >
                Categories
              </Link>
              <Link
                href="/account/orders"
                className="transition-colors hover:text-foreground py-2"
              >
                Orders
              </Link>
              <Link
                href="/account/wishlist"
                className="transition-colors hover:text-foreground py-2"
              >
                Wishlist
              </Link>
              <Link
                href="/account/addresses"
                className="transition-colors hover:text-foreground py-2"
              >
                Saved Addresses
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Spotlight Search Pill */}
            <SpotlightSearch />

            <Link
              href="/account/wishlist"
              aria-label="View wishlist"
              className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
            >
              <Heart className="h-4 w-4 transition-transform group-hover:scale-110" />
            </Link>

            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin/dashboard"
                className="hidden sm:inline-flex h-8 items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Admin</span>
              </Link>
            )}

            <HeaderAccountButton user={session?.user} />

            <HeaderCartButton />
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1">{children}</main>

      {/* Global Slide-Out Cart Drawer */}
      <CartDrawer />

      {/* Mobile Bottom Navigation Bar (WCAG AA & UI Context) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="fixed bottom-0 left-0 z-30 flex h-16 w-full items-center justify-around border-t border-border bg-background/95 backdrop-blur-md md:hidden"
      >
        <Link
          href="/"
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <HomeIcon className="h-5 w-5" />
          <span>Home</span>
        </Link>
        <Link
          href="/products"
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Search className="h-5 w-5" />
          <span>Search</span>
        </Link>
        <MobileCartNavButton />
        <Link
          href="/account/orders"
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Package className="h-5 w-5" />
          <span>Orders</span>
        </Link>
        <Link
          href="/account/profile"
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <User className="h-5 w-5" />
          <span>Profile</span>
        </Link>
      </nav>

      {/* Storefront Editorial Footer */}
      <footer className="border-t border-border bg-card py-12 pb-24 text-sm text-muted-foreground md:pb-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
            {/* Brand Column */}
            <div className="md:col-span-4 flex flex-col items-start gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold font-serif">
                  A
                </div>
                <span className="font-serif text-base font-bold tracking-[0.2em] uppercase text-foreground">
                  Atelier
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground max-w-sm">
                Curated collection of modern luxury essentials, designed for timeless longevity and crafted with ethical supply chain integrity.
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                  <span>Carbon Neutral</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Verified SQA</span>
                </div>
              </div>
            </div>

            {/* Navigation Columns */}
            <div className="grid grid-cols-2 gap-8 text-xs sm:grid-cols-3 md:col-span-8">
              <div className="flex flex-col gap-3">
                <span className="font-bold tracking-wider uppercase text-foreground">
                  Collections
                </span>
                <Link href="/products" className="transition-colors hover:text-foreground">
                  All Products
                </Link>
                <Link href="/#categories" className="transition-colors hover:text-foreground">
                  Categories
                </Link>
                <Link href="/products?featured=true" className="transition-colors hover:text-foreground">
                  Featured Atelier
                </Link>
                <Link href="/products?sort=newest" className="transition-colors hover:text-foreground">
                  New Season Arrivals
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                <span className="font-bold tracking-wider uppercase text-foreground">
                  Customer Care
                </span>
                <Link href="/account/orders" className="transition-colors hover:text-foreground">
                  My Orders
                </Link>
                <Link href="/account/wishlist" className="transition-colors hover:text-foreground">
                  Saved Wishlist
                </Link>
                <Link href="/account/addresses" className="transition-colors hover:text-foreground">
                  Saved Addresses
                </Link>
                <Link href="/account/profile" className="transition-colors hover:text-foreground">
                  Profile Settings
                </Link>
              </div>

              <div className="flex flex-col gap-3 col-span-2 sm:col-span-1">
                <span className="font-bold tracking-wider uppercase text-foreground">
                  Pillars & Trust
                </span>
                <span className="text-muted-foreground">Artisanal Craftsmanship</span>
                <span className="text-muted-foreground">Complimentary $100+ Delivery</span>
                <span className="text-muted-foreground">30-Day Hassle-Free Returns</span>
                <span className="text-muted-foreground">256-Bit SSL Encryption</span>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/60 flex flex-col items-center justify-between gap-4 text-xs sm:flex-row">
            <p>© {new Date().getFullYear()} Modern Atelier Store. All rights reserved.</p>
            <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
              <span>Visa</span>
              <span>•</span>
              <span>Mastercard</span>
              <span>•</span>
              <span>Amex</span>
              <span>•</span>
              <span>Apple Pay</span>
              <span>•</span>
              <span>Stripe</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

