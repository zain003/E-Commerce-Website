# ISSUE-012: Purchased Items in Order Receipt and History Lack Navigation Links to PDP

## Summary
Item names and thumbnails in `OrderReceipt` and `OrderHistoryCard` are rendered as plain static text (`<p>`) and `<div>` elements rather than links to the corresponding Product Detail Page (`/products/[slug]`). Customers viewing past purchases cannot click on an item to view the product, check current stock, re-order, or leave a review.

## Location / Flow
Orders & Receipts UI → `src/components/orders/order-receipt.tsx` (lines 180-184) & `src/components/orders/order-history-card.tsx` (lines 168-170).

## Steps to Reproduce
1. Navigate to `/order-confirmation?orderNumber=...` or `/account/orders`.
2. Expand an order in order history or inspect the line items in the confirmation receipt.
3. Hover over the product name or thumbnail.
4. Observe the cursor does not indicate a link, and clicking the element produces no action.

## Expected Behavior
Per standard e-commerce best practices, line items in an order receipt and order history should link directly to the product detail page (`/products/${product.slug}`) so customers can re-order, inspect current product details, or leave reviews.

## Actual Behavior
The product name is rendered as a plain non-interactive paragraph (`<p className="font-medium text-sm text-foreground truncate">{product?.name || "Product"}</p>`) with no `<Link>` component.

## Severity
Low

## Scope
- **In Scope:** Wrapping the product title and thumbnail in `OrderReceipt` and `OrderHistoryCard` in Next.js `<Link href={`/products/${product.slug}`}>` when a slug is available.
- **Out of Scope:** Creating a dedicated 1-click re-order button.

## Acceptance Criteria
- [ ] Product names and thumbnails in `OrderReceipt` link to `/products/${slug}`.
- [ ] Product names and thumbnails in `OrderHistoryCard` link to `/products/${slug}`.
- [ ] If a product slug is missing (e.g. deleted product), gracefully falls back to non-clickable text.
- [ ] Links include accessible hover and focus styling matching Tailwind v4 tokens.

## Related Feature ID
FEAT-007 — Orders & Receipts, FEAT-010 — Customer Reviews & Ratings

## Notes
Enabling navigation back to the PDP from past orders is essential for driving customer repeat purchases and verified product reviews.
