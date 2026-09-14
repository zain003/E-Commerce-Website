# ISSUE-013: Admin KPI Revenue Metric Aggregates Subtotal Instead of Total Revenue

## Summary
In the back-office administrative service `getAdminMetrics()`, total revenue is calculated by aggregating the `subtotal` column of paid orders rather than the `total` column. This excludes collected shipping fees and ignores discount deductions, presenting inaccurate revenue figures on the Admin Dashboard.

## Location / Flow
Admin Orders Service → KPI Aggregation (`src/lib/services/admin-orders.ts`, lines 217-241) & Dashboard (`src/app/admin/dashboard/page.tsx`).

## Steps to Reproduce
1. Complete a purchase with an item subtotal of $50.00 and $15.00 Express Shipping (Total = $65.00).
2. Log in as an administrator and navigate to `/admin/dashboard`.
3. Inspect the "Total Revenue" KPI card.
4. Observe that the metric card shows $50.00 instead of the actual $65.00 collected from the customer.

## Expected Behavior
Per `context/project-overview.md` (Administrator Flow 4: "Admin tracks total revenue, order volume, and pending fulfillment metrics") and `context/feature-specs/FEAT-009-BE-admin-orders.md`:
"Total Revenue" must represent the actual financial revenue collected across all paid orders, aggregating the `total` field (`subtotal + shippingFee - discountTotal`).

## Actual Behavior
The service query aggregates `subtotal`:
```typescript
const [revenueAggregation, totalOrders, processingOrders, deliveredOrders] =
  await Promise.all([
    prisma.order.aggregate({
      where: {
        paymentStatus: "PAID",
      },
      _sum: {
        subtotal: true, // Defect: Should be total: true
      },
    }),
    ...
```
This causes back-office metrics to underreport revenue by omitting shipping payments, or overreport when discounts were applied.

## Severity
Medium

## Scope
- **In Scope:** Changing `_sum.subtotal` to `_sum.total` in `getAdminMetrics()` in `src/lib/services/admin-orders.ts`.
- **Out of Scope:** Changing the visual presentation of `MetricsCards`.

## Acceptance Criteria
- [x] `getAdminMetrics()` aggregates the `total` column for orders with `paymentStatus: "PAID"`.
- [x] The Total Revenue card on `/admin/dashboard` accurately reflects net order revenue including shipping and discounts.
- [x] Associated unit tests for KPI metric calculations pass with updated expectation.

## Related Feature ID
FEAT-009 — Admin Orders Dashboard

## Notes
Accurate financial reporting is vital for business inventory planning and tax accounting.
