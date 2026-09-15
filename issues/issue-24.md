2
intercept-console-error.ts:48
 Error: Route "/account/profile": Next.js encountered uncached data during prerendering or a navigation.

`fetch(...)` or `connection()` accessed outside of `<Suspense>` prevents the route from being prerendered or the navigation from being instant, leading to a slower user experience.

Ways to fix this:
  - [stream] Provide a placeholder with `<Suspense fallback={...}>` around the data access
  - [cache] Cache the data access with `"use cache"` (does not apply to `connection()`)
  - [block] Set `export const instant = false` to allow a blocking route

Learn more: https://nextjs.org/docs/messages/blocking-prerender-dynamic
    at ProfilePage (page.tsx:14:41)
intercept-console-error.ts:48
 Error: Route "/account/profile": Next.js encountered uncached data during prerendering or a navigation.

`fetch(...)` or `connection()` accessed outside of `<Suspense>` prevents the route from being prerendered or the navigation from being instant, leading to a slower user experience.

Ways to fix this:
  - [stream] Provide a placeholder with `<Suspense fallback={...}>` around the data access
  - [cache] Cache the data access with `"use cache"` (does not apply to `connection()`)
  - [block] Set `export const instant = false` to allow a blocking route

Learn more: https://nextjs.org/docs/messages/blocking-prerender-dynamic
    at ProfilePage (page.tsx:14:41)


when i click store in admin, i saw this error, what is store for? as i have admin button to manage store, then what is store for