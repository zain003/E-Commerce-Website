# Issues Index — QA Audit Master Catalog

This document provides a master catalog of all defects, navigational gaps, and functional issues identified during the comprehensive SQA audit performed in accordance with [`Quality-Check.md`](file:///c:/Users/zaina/Desktop/ecommerce/issues/Quality-Check.md).

---

## Executive Summary

| Total Issues | Critical | High | Medium | Low |
|:---:|:---:|:---:|:---:|:---:|
| **16** | 1 | 5 | 6 | 4 |

### Severity Classifications
- **Critical**: Systemic payment, financial, or data corruption bugs that charge incorrect amounts or break core transaction flows.
- **High**: Broken primary user journeys, dead/misleading conversion links, or missing core mobile navigation elements.
- **Medium**: Missing secondary CRUD operations, broken fallback assets, or inaccurate back-office reporting calculations.
- **Low**: Minor routing conveniences, unlinked text, or cleanup of deprecated API arguments.

---

## Issues Tracker Matrix

| Issue ID | Severity | Status | Flow / Area | Title | Related Spec | File Link |
|---|---|---|---|---|---|---|
| **`ISSUE-001`** | `Medium` | `Resolved` | Global Navigation | Header Account CTA Unconditionally Directs to `/login` | `FEAT-001` | [`ISSUE-001-header-account-link.md`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-001-header-account-link.md) |
| **`ISSUE-002`** | `High` | `Resolved` | Global Navigation | Missing Orders Link in Storefront Header, Mobile Nav & Footer | `FEAT-007` | [`ISSUE-002-missing-orders-link.md`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-002-missing-orders-link.md) |
| **`ISSUE-003`** | `High` | `Resolved` | Global Navigation | Missing Admin Portal Entry Point for Authenticated Administrators | `FEAT-008`, `FEAT-009` | [`ISSUE-003-missing-admin-link.md`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-003-missing-admin-link.md) |
| **`ISSUE-004`** | `Medium` | `Resolved` | Global Navigation | 404 Not Found Error on `/admin` Root Route | `FEAT-008`, `FEAT-009` | [`ISSUE-004-admin-root-404.md`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-004-admin-root-404.md) |
| **`ISSUE-005`** | `High` | `Resolved` | Customer Flow / UI | Sticky Mobile PDP Action Bar Obscures Mobile Bottom Navigation | `FEAT-002` | [`ISSUE-005-sticky-mobile-bar-overlap.md`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-005-sticky-mobile-bar-overlap.md) |
| **`ISSUE-006`** | `Low` | `Resolved` | Global Navigation | Storefront Footer Lacks Essential Navigation Links | `FEAT-002`, `FEAT-007` | [`ISSUE-006-footer-navigation-links.md`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-006-footer-navigation-links.md) |
| **`ISSUE-007`** | `High` | `Resolved` | Auth & Profiles | Guest Cookie Cart Items Are Not Merged into User Account on Login | `FEAT-001`, `FEAT-004` | [`ISSUE-007-guest-cart-merge-on-login.md`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-007-guest-cart-merge-on-login.md) |
| **`ISSUE-008`** | `Medium` | `Resolved` | Auth & Profiles | Customer Profile Is Read-Only with No Edit Form or Update API | `FEAT-001` | [`ISSUE-008-profile-read-only.md`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-008-profile-read-only.md) |
| **`ISSUE-009`** | `High` | `Resolved` | Customer Flow | Homepage Category Badges Link to `/#featured` Instead of Filtered Catalog | `FEAT-002`, `FEAT-003` | [`ISSUE-009-category-badges-dead-link.md`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-009-category-badges-dead-link.md) |
| **`ISSUE-010`** | `Critical` | `Resolved` | Customer Flow / Payments | Coupon Discounts Are Disconnected from Checkout, Stripe & Order Creation | `FEAT-005`, `FEAT-006`, `FEAT-012` | [`ISSUE-010-coupon-checkout-disconnect.md`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-010-coupon-checkout-disconnect.md) |
| **`ISSUE-011`** | `Medium` | `Resolved` | Customer Flow | Missing Fallback Asset `/placeholder.png` Causes Broken Images in Receipts | `FEAT-007` | [`ISSUE-011-missing-placeholder-asset.md`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-011-missing-placeholder-asset.md) |
| **`ISSUE-012`** | `Low` | `Resolved` | Customer Flow | Purchased Items in Order Receipt and History Lack Navigation Links to PDP | `FEAT-007`, `FEAT-010` | [`ISSUE-012-order-items-unlinked.md`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-012-order-items-unlinked.md) |
| **`ISSUE-013`** | `Medium` | `Resolved` | Admin Flow | Admin KPI Revenue Metric Aggregates Subtotal Instead of Total Revenue | `FEAT-009` | [`ISSUE-013-admin-metrics-revenue-subtotal.md`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-013-admin-metrics-revenue-subtotal.md) |
| **`ISSUE-014`** | `Low` | `Resolved` | Admin Flow | Invalid Cache Life Profile Argument in `revalidateTag("products", "hours")` | `FEAT-008` | [`ISSUE-014-revalidate-tag-signature.md`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-014-revalidate-tag-signature.md) |
| **`ISSUE-015`** | `Low` | `Resolved` | Admin Flow | 403 Unauthorized Page Hardcodes Callback URL to `/admin/products` | `FEAT-001`, `FEAT-008` | [`ISSUE-015-unauthorized-page-callback.md`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-015-unauthorized-page-callback.md) |
| **`ISSUE-016`** | `Medium` | `Resolved` | Phase 2 Features | Order History Lacks Direct "Leave a Review" CTA for Verified Purchases | `FEAT-007`, `FEAT-010` | [`ISSUE-016-order-history-review-cta.md`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-016-order-history-review-cta.md) |

---

## Breakdown by Audit Scope

### 1. Global Navigation & Layout
- [`ISSUE-001`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-001-header-account-link.md): Account link in desktop header always directs to `/login`.
- [`ISSUE-002`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-002-missing-orders-link.md): Missing order history link across header, mobile nav, and footer.
- [`ISSUE-003`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-003-missing-admin-link.md): Admin users have no link to access the Admin Portal from storefront views.
- [`ISSUE-004`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-004-admin-root-404.md): Accessing `/admin` returns an unhandled 404 error.
- [`ISSUE-005`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-005-sticky-mobile-bar-overlap.md): Sticky mobile action bar on PDP sits flush on top of bottom navigation tabs.
- [`ISSUE-006`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-006-footer-navigation-links.md): Storefront footer lacks standard navigation links.

### 2. Authentication & Profiles
- [`ISSUE-007`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-007-guest-cart-merge-on-login.md): Guest cart items are not merged into customer accounts upon signing in.
- [`ISSUE-008`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-008-profile-read-only.md): Profile view is read-only; no profile edit form or update endpoint exists.

### 3. Customer Flow
- [`ISSUE-009`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-009-category-badges-dead-link.md): Homepage category pills hardcode dead links to `/#featured`.
- [`ISSUE-010`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-010-coupon-checkout-disconnect.md): **[CRITICAL]** Coupon discounts applied in cart are ignored by Stripe and order creation, charging customers full undiscounted prices.
- [`ISSUE-011`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-011-missing-placeholder-asset.md): Missing `/placeholder.png` asset causes broken image 404s in order receipts.
- [`ISSUE-012`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-012-order-items-unlinked.md): Purchased items in order receipts and history do not link to the Product Detail Page.

### 4. Admin Flow
- [`ISSUE-013`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-013-admin-metrics-revenue-subtotal.md): Revenue KPI aggregates `subtotal` instead of `total`, omitting shipping revenue.
- [`ISSUE-014`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-014-revalidate-tag-signature.md): Invalid second argument `"hours"` passed to Next.js `revalidateTag`.
- [`ISSUE-015`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-015-unauthorized-page-callback.md): 403 page hardcodes callback URL to `/admin/products`.

### 5. Phase 2 Features
- [`ISSUE-016`](file:///c:/Users/zaina/Desktop/ecommerce/issues/ISSUE-016-order-history-review-cta.md): Delivered orders in `/account/orders` lack a direct "Leave a Review" CTA for verified buyers.
