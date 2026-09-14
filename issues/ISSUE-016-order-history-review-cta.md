# ISSUE-016: Order History Lacks Direct "Leave a Review" CTA for Verified Purchases

## Summary
In `OrderHistoryCard` (`src/components/orders/order-history-card.tsx`), customers with delivered orders have no button or action to write a review for their purchased items. Even though the reviews system strictly requires verified buyer status (`hasUserPurchasedProduct`), the primary screen where customers inspect their completed purchases provides no path to trigger the review form.

## Location / Flow
Account Portal → Order History (`/account/orders`) → `src/components/orders/order-history-card.tsx`.

## Steps to Reproduce
1. Complete an order as an authenticated customer and transition the order status to `DELIVERED`.
2. Navigate to `/account/orders`.
3. Expand the delivered order to inspect purchased items.
4. Observe the only actions available are "View Details" and "View Printable Receipt".
5. Notice there is no "Write a Review" or "Review Item" button next to any of the purchased items.

## Expected Behavior
Per `context/project-overview.md` (Phase 2 — Growth: "Customer Reviews & Ratings (`FEAT-010`): Verified buyer reviews, 1-5 star ratings, average rating summary") and standard e-commerce workflows:
Delivered items in the customer's order history should display a "Write a Review" link or button directing them to the product detail page with the review form open, or opening the `ReviewFormModal` directly.

## Actual Behavior
Customers must manually search for or browse to each product's detail page, scroll down to the bottom, and click "Write a Review" in `ReviewSection`.

## Severity
Medium

## Scope
- **In Scope:** Adding a "Write Review" link or button on completed/delivered order line items in `src/components/orders/order-history-card.tsx` linking to `/products/${slug}#reviews` or opening the review modal.
- **Out of Scope:** Changing the verified buyer logic in `src/lib/services/reviews.ts`.

## Acceptance Criteria
- [ ] Delivered items in `/account/orders` display an accessible "Write Review" CTA.
- [ ] Clicking the CTA directs the verified customer to the product review section or opens the review modal.
- [ ] Items on cancelled or pending orders do not display the review CTA.

## Related Feature ID
FEAT-007 — Orders & Receipts, FEAT-010 — Customer Reviews & Ratings

## Notes
Most customers write reviews when prompted from their order receipt or order history. Providing this link dramatically increases verified review submission rates.
