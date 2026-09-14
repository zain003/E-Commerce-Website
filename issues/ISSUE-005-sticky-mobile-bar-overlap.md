# ISSUE-005: Sticky Mobile PDP Action Bar Obscures Mobile Bottom Navigation

## Summary
On mobile viewports (< 768px), the sticky action bar on the Product Detail Page (`data-testid="sticky-mobile-bar"`) is positioned with `fixed bottom-0` and `z-40`, placing it directly over the global mobile bottom navigation bar (`fixed bottom-0`, `z-30`). This completely hides and blocks access to the primary mobile navigation tabs (Home, Search, Cart, Profile).

## Location / Flow
Product Detail Page (Mobile Viewport) → `src/components/product/product-detail-view.tsx` (lines 150-182) & Storefront Layout → `src/app/(shop)/layout.tsx` (lines 104-130).

## Steps to Reproduce
1. Open the application on a mobile viewport (e.g., width 375px or 390px in DevTools).
2. Navigate to any product detail page, e.g. `/products/classic-cotton-tee`.
3. Look at the bottom of the screen.
4. Notice that the sticky action bar (Total Price + "Add to Cart" + Heart button) sits flush against the bottom edge (`bottom-0`) with `z-40`.
5. Observe that the global mobile bottom navigation bar (`Home`, `Search`, `Cart`, `Profile`) has been completely occluded and rendered unreachable.

## Expected Behavior
Per `context/ui-context.md` (Layout Patterns 1 & 2):
1. "Mobile Bottom Navigation: Fixed bottom navigation bar on mobile viewports (< 768px) with thumb-accessible icons (Home, Search, Cart with badge, Account)."
2. "Sticky Mobile Action Bar: Fixed bottom bar on Product Detail Pages on mobile containing live price and full-width 'Add to Cart' button."
Both elements must either coexist (e.g. action bar positioned above the 16 (64px) bottom nav: `bottom-16`) or the action bar must integrate navigation access so the user is not trapped on the PDP without bottom navigation.

## Actual Behavior
The sticky mobile bar sits at `bottom-0` with `z-40`, completely overlapping the bottom nav bar at `bottom-0` with `z-30`, preventing users from switching tabs.

## Severity
High

## Scope
- **In Scope:** Adjusting mobile positioning in `product-detail-view.tsx` so the sticky order action bar sits above the mobile navigation bar (e.g. `bottom-16`) or provides adequate clearance without layout distortion.
- **Out of Scope:** Altering desktop product detail view layout.

## Acceptance Criteria
- [ ] On mobile viewports (< 768px), the sticky action bar and the mobile bottom navigation bar do not overlap or obscure each other.
- [ ] Both the "Add to Cart" CTA and all 4 bottom navigation tabs (`Home`, `Search`, `Cart`, `Profile`) are visible and interactive.
- [ ] No horizontal or vertical overflow defects are introduced.

## Related Feature ID
FEAT-002 — Catalog & Product Details

## Notes
Thumb reachability is a core requirement in `context/project-overview.md` (Goal 2: "100% thumb-friendly navigation"). Blocking bottom navigation breaks this goal on the single most visited conversion page.
