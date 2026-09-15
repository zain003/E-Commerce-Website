when i checkout and submit 4242424242424242 card number, order doesnt placed or successful, instead a page opens shows order not found
error:
intercept-console-error.ts:48 Error: Route "/order-confirmation": Next.js encountered uncached data during prerendering or a navigation.

`fetch(...)` or `connection()` accessed outside of `<Suspense>` prevents the route from being prerendered or the navigation from being instant, leading to a slower user experience.

Ways to fix this:
  - [stream] Provide a placeholder with `<Suspense fallback={...}>` around the data access
  - [cache] Cache the data access with `"use cache"` (does not apply to `connection()`)
  - [block] Set `export const instant = false` to allow a blocking route

Learn more: https://nextjs.org/docs/messages/blocking-prerender-dynamic
    at OrderConfirmationPage (page.tsx:65:41)