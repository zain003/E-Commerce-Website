# Project Overview — E-Commerce Web App

## Overview
A fast, trustworthy, mobile-first online store built on Next.js 16, React 19, Tailwind CSS v4, and Prisma. The application provides an effortless shopping experience with zero learning curve for customers, and a streamlined back-office dashboard for administrators to manage products, inventory, and order fulfillment.

---

## Goals
1. **Speed & Performance**: Sub-second catalog browsing and instant interactive cart powered by Next.js 16 Cache Components (`"use cache"`) and Turbopack.
2. **Mobile-First Accessibility**: 100% thumb-friendly navigation (bottom tab bar on mobile, sticky Add-to-Cart, clean slide-out cart drawer) adhering to WCAG AA contrast guidelines.
3. **Transaction Reliability & Trust**: Idempotent Stripe payment processing, real-time inventory validation, transparent order tracking, and clear trust signals throughout checkout.

---

## Core User Flows

### Customer Shopping Flow
1. **Discovery**: Customer browses homepage hero, categories, and featured products or uses debounced multi-criteria search (price range, category, sorting).
2. **Product Details**: Customer views product imagery gallery, selects variant (size/color) with real-time price delta and stock status updates.
3. **Cart Management**: Customer adds items to cart (authenticated or guest via HTTP-only cookie); slides open Cart Drawer to adjust quantities or apply discount codes.
4. **Multi-Step Checkout**: Customer completes 3-step checkout: Shipping Address & Contact -> Delivery Method -> Stripe Elements Payment.
5. **Confirmation & Tracking**: Customer receives instant order confirmation receipt with unique order number and tracks order status in `/account/orders`.

### Administrator Flow
1. **Authentication**: Admin signs in with credentials; role is verified as `ADMIN`.
2. **Catalog & Inventory**: Admin creates and edits products with variant matrices (SKU, price delta, stock) and triggers instant cache revalidation (`revalidateTag("products")`).
3. **Order Fulfillment**: Admin inspects incoming orders, reviews shipping details, and transitions order status from `PROCESSING` to `SHIPPED` / `DELIVERED`.
4. **KPI Dashboard**: Admin tracks total revenue, order volume, and pending fulfillment metrics.

---

## Features & Scope

### Phase 1 — MVP (Launch-Blocking)
- **Authentication & Profiles** (`FEAT-001`): Credentials auth, registration, profile & address CRUD.
- **Catalog & Product Details** (`FEAT-002`): Cached catalog reads, dynamic product detail pages, variant selector.
- **Search & Filtering** (`FEAT-003`): Debounced search, category filters, price range sliders, URL state sync.
- **Cart & Persistence** (`FEAT-004`): Zustand store, guest cookie sessions, stock limit validation, slide-out drawer.
- **Checkout & Shipping** (`FEAT-005`): Address validation, shipping tiers ($5 Standard / Free > $100 / $15 Express).
- **Stripe Payments** (`FEAT-006`): Stripe PaymentIntents, Elements card UI, idempotent webhook order creation with atomic stock decrements.
- **Orders & Receipts** (`FEAT-007`): Itemized order receipts, customer order history.
- **Admin Catalog Management** (`FEAT-008`): Product/variant CRUD, inline inventory adjustments, `revalidateTag`.
- **Admin Orders Dashboard** (`FEAT-009`): Order status transition management, store revenue & order metric cards.

### Phase 2 — Growth (P1)
- **Customer Reviews & Ratings** (`FEAT-010`): Verified buyer reviews, 1-5 star ratings, average rating summary.
- **Customer Wishlist** (`FEAT-011`): Heart toggle on cards/PDP, `/account/wishlist` view with Move-to-Cart.
- **Coupons & Discounts** (`FEAT-012`): Percentage and fixed discounts, minimum spend validation, promo input.

### Phase 3 — Scale (Out of Scope for MVP)
- Multi-vendor marketplace support.
- AI shopping assistant & vector semantic search.
- Multi-warehouse inventory sync.
- International multi-currency & localization.

---

## Success Criteria
1. Complete customer journey (Browse -> Add to Cart -> Checkout -> Stripe Payment -> Order Confirmation) completes with 0 errors.
2. 100% of feature specifications in `context/feature-specs/` pass multi-layer SQA automated tests (Fake DOM, API, Backend, DB).
3. Production build (`npm run build`) succeeds cleanly with zero TypeScript or ESLint errors.
