# ISSUE-011: Missing Fallback Asset /placeholder.png Causes Broken Images in Receipts and History

## Summary
The `OrderReceipt` and `OrderHistoryCard` components use `const imageSrc = product?.images?.[0] || "/placeholder.png"`, but `/placeholder.png` does not exist in the `/public` directory. When an item lacks an image or has an empty image array, Next.js `<Image>` attempts to fetch `/placeholder.png`, causing an HTTP 404 and rendering a broken image icon.

## Location / Flow
Orders & Receipts UI → `src/components/orders/order-receipt.tsx` (line 163) & `src/components/orders/order-history-card.tsx` (lines 102, 150).

## Steps to Reproduce
1. Create or query an order containing a product with no images (`images: []` or `images: null`).
2. Navigate to the Order Confirmation page `/order-confirmation?orderNumber=...` or to `/account/orders`.
3. Open browser DevTools Network tab.
4. Inspect the item line thumbnail.
5. Notice an HTTP 404 GET request for `/placeholder.png` and a broken image placeholder in the browser.

## Expected Behavior
Per `context/ui-context.md` and repository best practices demonstrated in `ProductCard` (`src/components/product/product-card.tsx`, lines 48-56):
When a product has no image, the component should render an inline SVG placeholder (e.g. `Package` or `ShoppingBag` icon inside `bg-muted/40`) or reference an existing, valid SVG/PNG asset in `/public`, preventing broken network requests.

## Actual Behavior
The code references `/placeholder.png`, which is missing from `/public/` (only `favicon.ico` exists in `/public/`).

## Severity
Medium

## Scope
- **In Scope:** Replacing `/placeholder.png` in `order-receipt.tsx` and `order-history-card.tsx` with an inline SVG/Lucide placeholder component (matching `ProductCard`) or placing a lightweight fallback SVG in `/public/`.
- **Out of Scope:** Modifying product image upload logic.

## Acceptance Criteria
- [x] No 404 network errors occur when viewing order receipts or history for items without images.
- [x] Products with missing images display a clean, accessible fallback icon (e.g., `Package` or `ShoppingBag`).
- [x] Layout remains visually consistent with Tailwind v4 design tokens.

## Related Feature ID
FEAT-007 — Orders & Receipts

## Notes
`ProductCard` already solves this elegantly with an inline placeholder (`<div data-testid="product-card-placeholder" ...><ShoppingBag ... /></div>`). Adopting that pattern here ensures consistency across the app.
