import Link from "next/link";
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw,
  Sparkles,
  User,
  ExternalLink,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span>Store</span>
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
              <Link
                href="/#features"
                className="transition-colors hover:text-foreground"
              >
                Features
              </Link>
              <Link
                href="/#categories"
                className="transition-colors hover:text-foreground"
              >
                Categories
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
              href="/login"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <User className="h-4 w-4" />
              <span>Sign In</span>
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3.5 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Next.js 16 • React 19 • Tailwind v4</span>
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Modern essentials, crafted for effortless everyday living.
              </h1>

              <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                Experience sub-second catalog browsing, zero learning curve checkout,
                and real-time inventory synchronization.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-7 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-95"
                >
                  Sign In to Existing Account
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition Highlights */}
        <section
          id="features"
          className="border-y border-border bg-card py-12"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-start gap-2.5 rounded-xl border border-border/60 bg-background p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Zap className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold text-foreground">Sub-Second Speed</h2>
                <p className="text-sm text-muted-foreground">
                  Instantaneous page loads backed by Next.js 16 App Router and Turbopack.
                </p>
              </div>

              <div className="flex flex-col items-start gap-2.5 rounded-xl border border-border/60 bg-background p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold text-foreground">Secure Stripe Checkout</h2>
                <p className="text-sm text-muted-foreground">
                  Encrypted payment processing with idempotent order verification and zero secret leakage.
                </p>
              </div>

              <div className="flex flex-col items-start gap-2.5 rounded-xl border border-border/60 bg-background p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold text-foreground">Easy Address Management</h2>
                <p className="text-sm text-muted-foreground">
                  Save, edit, and toggle default shipping destinations with one click.
                </p>
              </div>

              <div className="flex flex-col items-start gap-2.5 rounded-xl border border-border/60 bg-background p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold text-foreground">Mobile-First Design</h2>
                <p className="text-sm text-muted-foreground">
                  Thumb-friendly interactions optimized for seamless shopping on any screen.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links & Modules Showcase */}
        <section
          id="categories"
          className="py-16 md:py-24"
        >
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
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p>© {new Date().getFullYear()} Modern Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
