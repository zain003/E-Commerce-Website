# FEAT-007-FE — Order Confirmation & History UI
**Priority**: P0 (Launch-Blocking)  
**Layer**: Frontend UI & Receipt Views

## Goal
Build the customer Order Confirmation ("Thank You") page with itemized receipts and the customer `/account/orders` history view.

## Depends on / Context pack / Consumes
- **Depends on**: `FEAT-007-BE-orders.md`
- **Context pack**:
```typescript
import { HydratedOrder, HydratedOrderItem } from "./FEAT-007-BE-orders";
import { OrderStatus } from "@/types";
```
- **Consumes**:
  - `GET /api/orders/:orderNumber` -> `getOrderByNumber(orderNumber, guestEmail)`
  - `GET /api/account/orders` -> `getUserOrders()`

## Scope (In)
- `/order-confirmation` page showing celebration badge, order number, delivery address, item breakdown, and print receipt CTA.
- `/account/orders` page displaying past orders, status badges (`Processing`, `Shipped`, `Delivered`), and expandable detail views.
- Status progress tracker step bar (Confirmed -> Processing -> Shipped -> Delivered).

## Scope (Out)
- Live courier map tracking (Phase 3).

## Tech / Files to Touch
- `src/app/(shop)/order-confirmation/page.tsx`
- `src/app/account/orders/page.tsx`
- `src/components/orders/order-receipt.tsx`
- `src/components/orders/order-history-card.tsx`
- `src/components/orders/order-status-badge.tsx`

## Tests to Write FIRST
1. `tests/ui/order-receipt.test.tsx`: Renders order number, itemized rows, shipping address, and total amount.
2. `tests/ui/order-status-badge.test.tsx`: Displays appropriate color variant for each OrderStatus.
3. `tests/ui/order-history-list.test.tsx`: Renders list of past orders with dates and details button.

## Implementation Steps
1. Create `OrderStatusBadge` component with status colors (e.g. green for Delivered, blue for Processing).
2. Build `OrderReceipt` component displaying complete invoice details.
3. Assemble `/order-confirmation` page with receipt view and "Continue Shopping" CTA.
4. Assemble `/account/orders` page showing order cards and pagination controls.

## Acceptance Criteria
- [ ] Confirmation page displays correct order number, purchased item images, quantities, and totals.
- [ ] Order status reflects accurate state with matching visual badge.
- [ ] Customer order history shows empty state with shopping button when 0 orders exist.
- [ ] Printable stylesheet formatting applies when user prints receipt (`window.print()`).

## Definition of Done
- [ ] All Fake DOM tests pass 100%.
- [ ] Responsive design verified on mobile and desktop viewports.

## Edge Cases to Handle
- Accessing `/order-confirmation` with missing orderNumber shows friendly fallback.
- Handling long item lists with clean scrolling.

## Pre-flight Check
- Confirm `FEAT-007-BE-orders.md` responds with valid order data.

## What's Next
- `FEAT-007-VERIFY-orders.md` (Orders Verification Pass).

## Ambiguity Resolution Protocol
If you encounter a case not covered by this spec:
1. Do NOT silently guess.
2. Make the smallest reasonable assumption needed to proceed.
3. Log it in `context/feature-specs/DEVIATIONS.md` as: `[FEAT-007-FE] — [what was ambiguous] — [assumption made]`.
4. Continue implementation; do not block unless it affects `000-shared-contracts.md`.
