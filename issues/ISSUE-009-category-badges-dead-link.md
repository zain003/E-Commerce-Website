# ISSUE-009: Homepage Category Badges Link to /#featured Instead of Filtered Catalog

## Summary
In the "Shop by Category" section on the homepage (`src/app/(shop)/page.tsx`), every category badge is wrapped in an anchor linking statically to `/#featured` rather than filtering the product catalog by the category's slug. Clicking any category pill scrolls to the featured section without filtering products.

## Location / Flow
Homepage → Shop by Category Strip (`src/app/(shop)/page.tsx`, lines 79-94).

## Steps to Reproduce
1. Navigate to the storefront homepage `/`.
2. Scroll to the "Shop by Category:" strip directly beneath the hero section.
3. Observe category badges rendered dynamically from the database (e.g. "Apparel", "Electronics", "Accessories").
4. Hover or click on the "Apparel" category badge.
5. Notice the link destination in the browser preview is `http://localhost:3000/#featured`.
6. Click the badge: the page scrolls down to "Featured Products", displaying all featured products unfiltered.

## Expected Behavior
Per `context/project-overview.md` (Core Customer Shopping Flow 1: "Customer browses homepage hero, categories, and featured products or uses debounced multi-criteria search (price range, category, sorting)") and `context/feature-specs/FEAT-003-FE-search.md`:
Clicking a category badge should navigate to the catalog page pre-filtered for that category: `/products?category=${category.slug}`.

## Actual Behavior
The code hardcodes:
```tsx
<Link key={category.id} href="/#featured" ...>
  <Badge variant="secondary">{category.name}</Badge>
</Link>
```
The category slug is completely discarded, rendering the category badges dysfunctional as filtering mechanisms.

## Severity
High

## Scope
- **In Scope:** Updating the category badge link in `src/app/(shop)/page.tsx` to `href={`/products?category=${category.slug}`}`.
- **Out of Scope:** Modifying `/products` catalog filtering logic (which already supports `category=${slug}`).

## Acceptance Criteria
- [x] Category badges on the homepage link to `/products?category=${category.slug}`.
- [x] Clicking a badge navigates to `/products` with the corresponding category active and filtered in `CatalogView`.
- [x] The category pill remains accessible with keyboard focus and screen readers.

## Related Feature ID
FEAT-002 — Catalog & Product Details, FEAT-003 — Search & Filtering

## Notes
The `/products` page already natively reads `searchParams.category` and applies the filter correctly. This is purely a broken link bug on the storefront homepage.
