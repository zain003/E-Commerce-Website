# ISSUE-006: Storefront Footer Lacks Essential Navigation Links

## Summary
The global storefront footer contains only branding text, a copyright notice, and a "Verified SQA Quality Gate" badge. It lacks standard e-commerce navigation columns or links to core areas like the product catalog, categories, account history, or legal policies.

## Location / Flow
Global Storefront Footer (`src/app/(shop)/layout.tsx`, lines 132-155).

## Steps to Reproduce
1. Navigate to the storefront homepage or any shop page.
2. Scroll to the very bottom of the page.
3. Inspect the footer.
4. Observe that only the logo, "Modern Store", copyright, and SQA badge are present.
5. Notice there are no navigational links to Categories, All Products, My Orders, Wishlist, or Customer Support.

## Expected Behavior
Per standard e-commerce conventions and comprehensive site accessibility, the footer serves as a reliable fallback navigation hub for users who scroll to the end of a page, providing links to Catalog, Categories, Order Tracking, and Account.

## Actual Behavior
The footer is an informational-only bar with zero interactive navigation links.

## Severity
Low

## Scope
- **In Scope:** Adding clean, accessible link groups (e.g. Shop: Catalog, Categories; Account: Orders, Wishlist, Profile) to the storefront footer in `src/app/(shop)/layout.tsx`.
- **Out of Scope:** Creating standalone terms/privacy policy pages if not in spec.

## Acceptance Criteria
- [x] The storefront footer provides organized, accessible links to core destinations: `/products`, `/#categories`, `/account/orders`, and `/account/wishlist`.
- [x] Links conform to Tailwind v4 design tokens and WCAG AA contrast standards.
- [x] Links are thumb-reachable and responsively stacked on mobile screens.

## Related Feature ID
FEAT-002 — Catalog & Product Details, FEAT-007 — Orders & Receipts

## Notes
A complete footer enhances SEO link crawling and improves navigational UX on long catalog pages.
