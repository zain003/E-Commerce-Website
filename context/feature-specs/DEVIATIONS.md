# Deviations & Assumptions Log

This file is a running log of ambiguities encountered and assumptions made during implementation sessions.

### Protocol
1. Do NOT silently guess when specifications are ambiguous.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it here using the format below:
   `[FILE-ID] — [what was ambiguous] — [assumption made]`
4. If an ambiguity affects the core data model in `000-shared-contracts.md`, **STOP** and flag for human review immediately.

---

## Log Entries

- `[FEAT-002-FE]` — Route collision between root `src/app/page.tsx` and `src/app/(shop)/page.tsx` — Migrated root `page.tsx` into `src/app/(shop)/page.tsx` with shared `(shop)/layout.tsx` per `architecture.md` to cleanly support customer storefront route grouping and mobile navigation bars.
- `[FEAT-004-BE]` — Empty cart resolution — Handled `getCart()` for sessions without an active cart by returning an in-memory empty `HydratedCart` (`items: []`, `subtotal: 0`, `itemCount: 0`) without creating superfluous empty rows in PostgreSQL until items are added.
- `[FEAT-004-BE]` — Token resolution in `POST /api/cart/merge` — Allowed `guestToken` to be resolved from either HTTP-only `guest_cart_token` cookie or optional request body `{ guestToken }` before fallback.
- `[FEAT-006-FE]` — Client confirmation redirection target — Using `/order-confirmation?orderNumber=${paymentIntent.id}&payment_intent=${paymentIntent.id}` upon successful client-side confirmation because orders are generated asynchronously via webhook in `FEAT-006-INT`, enabling both order number and payment intent lookups.
- `[FEAT-006-INT]` — Out of stock order status representation — Prisma `OrderStatus` enum does not contain `REVIEW_REQUIRED`; created Order with `status: PROCESSING` and `paymentStatus: PAID`, decremented variant stock to record deficit, and logged an explicit `[ADMIN ALERT]` for staff review without breaking transaction integrity.
- `[FEAT-007-FE]` — Fallback identifier resolution in `getOrderByNumber` & Cart Store Reset — Extended `getOrderByNumber` to support `{ stripePaymentId: trimmedOrderNumber }` lookup when queried with `pi_` prefixes (or payment intent identifiers) ensuring robust order discovery; and added `clearCart()` to `useCartStore` to automatically reset client cart state when receipt confirmation is rendered.
