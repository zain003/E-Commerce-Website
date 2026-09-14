# ISSUE-014: Invalid Cache Life Profile Argument in revalidateTag("products", "hours")

## Summary
In `src/lib/services/admin-products.ts`, cache revalidation is called as `revalidateTag("products", "hours")`. In Next.js (App Router / Next.js 16), `revalidateTag` accepts only a single string argument (`tag: string`). Supplying `"hours"` as a second argument is invalid and causes TypeScript warnings and runtime issues in modern Next.js releases.

## Location / Flow
Admin Products Service → `src/lib/services/admin-products.ts` (lines 158, 306, 360).

## Steps to Reproduce
1. Open `src/lib/services/admin-products.ts`.
2. Inspect lines 158, 306, and 360 inside `createAdminProduct`, `updateAdminProduct`, and `updateVariantStock`.
3. Notice:
   ```typescript
   try {
     revalidateTag("products", "hours");
   } catch (tagError) { ... }
   ```
4. Check the Next.js `revalidateTag` type definition in `next/cache`:
   `export declare function revalidateTag(tag: string): void;`

## Expected Behavior
Per `context/code-standards.md` (Next.js 16 Standards) and Next.js official documentation, `revalidateTag` should be called with only the cache tag name:
```typescript
revalidateTag("products");
```
(The profile `"hours"` belongs in `cacheLife("hours")` inside data-fetching functions, not in `revalidateTag`).

## Actual Behavior
The second argument `"hours"` was mistakenly passed to `revalidateTag`, triggering catch blocks or runtime warnings when executing under standard Next.js 16 server environments.

## Severity
Low

## Scope
- **In Scope:** Updating all calls to `revalidateTag("products", "hours")` in `src/lib/services/admin-products.ts` to `revalidateTag("products")`.
- **Out of Scope:** Changing cache tags or data-fetching cache profiles.

## Acceptance Criteria
- [x] `revalidateTag` is called with exactly one argument: `revalidateTag("products")`.
- [x] TypeScript types strictly validate with zero type warnings.
- [x] Catalog updates immediately invalidate the storefront products cache without errors.

## Related Feature ID
FEAT-008 — Admin Catalog Management

## Notes
The try/catch block around `revalidateTag` currently suppresses the error, but cleaning up the signature prevents silent cache invalidation failures.
