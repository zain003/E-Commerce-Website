import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  User,
  Search,
  Home as HomeIcon,
  ShieldCheck,
  Heart,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  HeaderCartButton,
  MobileCartNavButton,
} from "@/components/layout/header-cart-button";
import { HeaderAccountButton } from "@/components/layout/header-account-button";
import { CartDrawer } from "@/components/cart/cart-drawer";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Universal Store Header */}
      <header className="sticky top-0 z-30 w-full border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-85"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span>Store</span>
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
              <Link
                href="/products"
                className="transition-colors hover:text-foreground"
              >
                Catalog
              </Link>
              <Link
                href="/#categories"
                className="transition-colors hover:text-foreground"
              >
                Categories
              </Link>
              <Link
                href="/account/wishlist"
                className="transition-colors hover:text-foreground"
              >
                Wishlist
              </Link>
              <Link
                href="/account/addresses"
                className="transition-colors hover:text-foreground"
              >
                Saved Addresses
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              aria-label="Search products"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:h-9 md:w-auto md:px-3 md:gap-1.5"
            >
              <Search className="h-4 w-4" />
              <span className="hidden text-sm md:inline">Search</span>
            </Link>

            <Link
              href="/account/wishlist"
              aria-label="View wishlist"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Heart className="h-4 w-4" />
            </Link>

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
          href="/account/profile"
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <User className="h-5 w-5" />
          <span>Profile</span>
        </Link>
      </nav>

      {/* Storefront Footer */}
      <footer className="border-t border-border bg-card py-10 pb-24 text-sm text-muted-foreground md:pb-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
              S
            </div>
            <span className="font-semibold text-foreground">Modern Store</span>
            <span className="text-xs text-muted-foreground">
              — Sub-second catalog & seamless checkout
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified SQA Quality Gate
            </span>
            <span>•</span>
            <p>© {new Date().getFullYear()} Modern Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
