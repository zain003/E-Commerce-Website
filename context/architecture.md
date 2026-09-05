# Architecture Context

## Stack Matrix

| Layer | Technology | Role & Justification |
|---|---|---|
| **Framework** | Next.js 16 (App Router + Turbopack) | Stable Turbopack bundler, React Server Components, Cache Components (`"use cache"`), SEO-optimized SSR |
| **Language** | TypeScript (Strict Mode) | End-to-end type safety, auto-generated Prisma types, zero runtime type errors |
| **UI Runtime** | React 19.2 | High performance server rendering, Action hooks, modern transitions |
| **Styling** | Tailwind CSS v4 + shadcn/ui | Utility-first styling with modern CSS variables, accessible component primitives |
| **Auth** | Auth.js / NextAuth | Credentials login, bcrypt password hashing, role-based session callbacks (`CUSTOMER`, `ADMIN`) |
| **Database & ORM** | PostgreSQL + Prisma ORM | Relational integrity for orders, foreign key constraints, atomic transactions via `prisma.$transaction` |
| **State Management** | Zustand | Lightweight client-side cart & UI drawer state with optimistic updates |
| **Forms & Validation** | React Hook Form + Zod | Schema-first client and server validation; type inference directly from Zod schemas |
| **Payments** | Stripe Node SDK + Stripe Elements | PCI-compliant card collection, server-side PaymentIntents, idempotent webhook order processing |
| **Testing** | Vitest + React Testing Library + jsdom | Multi-layer SQA verification (Fake DOM UI, API route handlers, unit calculations) |

---

## System Boundaries

- `src/app/(shop)/` — Customer storefront pages (Home, Products, PDP, Cart, Checkout, Order Confirmation).
- `src/app/(auth)/` — Authentication pages (`/login`, `/register`).
- `src/app/account/` — Customer portal (`/account/profile`, `/account/orders`, `/account/addresses`, `/account/wishlist`).
- `src/app/admin/` — Back-office admin dashboard and product/order management pages (protected by `requireAdmin`).
- `src/app/api/` — Next.js Route Handlers exposing JSON endpoints conforming to `ApiResponse<T>`.
- `src/components/ui/` — Base design system components (Button, Card, Input, Dialog, Badge, Sheet).
- `src/components/` — Domain-specific UI components (`product/`, `cart/`, `checkout/`, `orders/`, `admin/`, `reviews/`, `wishlist/`).
- `src/lib/services/` — Pure backend business logic, database queries, and calculation services.
- `src/lib/validators/` — Shared Zod schemas for request validation.
- `src/store/` — Client Zustand stores (`cart-store.ts`).
- `src/types/` — Shared TypeScript interfaces and Prisma models.
- `prisma/` — Prisma schema definition and database migration history.

---

## Storage Model

- **PostgreSQL Database**:
  - `User`, `Address`: Identity, role, and saved shipping destinations.
  - `Category`, `Product`, `ProductVariant`: Product catalog hierarchy, prices, SKUs, and inventory counts.
  - `Cart`, `CartItem`: Persistent customer and guest cart records.
  - `Order`, `OrderItem`: Immutable financial transactions, snapshot unit prices, and status logs.
  - `Review`, `WishlistItem`, `Coupon`: Social proof, customer preferences, and discount rules.
- **File / Media Storage**:
  - Image URLs stored in PostgreSQL as string arrays (`images: String[]`); media hosted via optimized CDN / public assets.

---

## Auth & Access Model

1. **Authentication**: Handled via Auth.js with JWT session strategy stored in secure HTTP-only cookies.
2. **Roles**:
   - `CUSTOMER`: Default role. Can view catalog, manage own cart, checkout, view own orders/addresses/wishlist, and review purchased products.
   - `ADMIN`: Full access to admin dashboard, product/variant CRUD, inventory adjustment, and order fulfillment status transitions.
3. **Enforcement Pattern**:
   - `requireAuth(session)` — Enforces active user identity; returns `401 UNAUTHORIZED` if missing.
   - `requireAdmin(session)` — Enforces `session.user.role === "ADMIN"`; returns `403 FORBIDDEN` for non-admin accounts.
   - Row-level access: Users can only mutate their own addresses, carts, orders, and wishlist items.

---

## Architectural Invariants

1. **Server Components by Default**: Pages and layout components are Server Components unless user interactivity (e.g. cart drawer, forms, filters) explicitly requires `"use client"`.
2. **Explicit Next.js 16 Caching**: Catalog read functions use `"use cache"` and `cacheLife("hours")`. Mutations immediately call `revalidateTag("products")`.
3. **Prices Verified Server-Side**: The client never provides or calculates line-item prices for orders. Payment amounts are calculated strictly from database prices in the PaymentIntent creation service.
4. **Idempotent Webhook Processing**: Stripe webhooks are the single source of truth for payment status. Webhooks check existing `stripePaymentId` to prevent duplicate order generation.
5. **Atomic Transactional Integrity**: Order creation, inventory stock decrementing, and cart deletion execute inside an atomic `prisma.$transaction`.
6. **Zero Secret Exposure**: `STRIPE_SECRET_KEY`, `DATABASE_URL`, and `NEXTAUTH_SECRET` are never referenced in client-side code or public bundles.
