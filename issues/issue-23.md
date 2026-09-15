intercept-console-error.ts:48
 Error: Route "/checkout": Next.js encountered uncached data during prerendering or a navigation.

`fetch(...)` or `connection()` accessed outside of `<Suspense>` prevents the route from being prerendered or the navigation from being instant, leading to a slower user experience.

Ways to fix this:
  - [stream] Provide a placeholder with `<Suspense fallback={...}>` around the data access
  - [cache] Cache the data access with `"use cache"` (does not apply to `connection()`)
  - [block] Set `export const instant = false` to allow a blocking route

Learn more: https://nextjs.org/docs/messages/blocking-prerender-dynamic
    at CheckoutPage (page.tsx:14:41)
84
Tracking Prevention blocked access to storage for <URL>.
stripe.js:1
 You may test your Stripe.js integration over HTTP. However, live Stripe.js integrations must use HTTPS.
controller-with-prec…961a90bf4dc3d4.js:1
 [Stripe.js] Your Elements integration is using an older API. We recommend migrating to the Checkout Sessions API to reduce code, maintenance, and tokens (for AI agents). Additionally, you can easily turn on advanced features like Adaptive Pricing.
View migration guide: https://docs.stripe.com/payments/payment-element/migration-ewcs
controller-with-prec…961a90bf4dc3d4.js:1
 [Stripe.js] If you are testing Apple Pay or Google Pay, you must serve this page over HTTPS as it will not work over HTTP. Please read https://stripe.com/docs/stripe-js/elements/payment-request-button#html-js-prerequisites for more details.
controller-with-prec…961a90bf4dc3d4.js:1
 [Stripe.js] The following payment method types are not activated:

- crypto
- link
- cashapp
- amazon_pay

They will be displayed in test mode, but hidden in live mode. Please activate the payment method types in your dashboard (https://dashboard.stripe.com/settings/payment_methods) and ensure your account is enabled for any preview features that you are trying to use.
controller-with-prec…961a90bf4dc3d4.js:1
 [Stripe.js] You have not registered or verified the domain, so the following payment methods are not enabled in the Payment Element: 

- apple_pay

Please follow https://stripe.com/docs/payments/payment-methods/pmd-registration to register and verify the domain.
order-creation.ts:223  Server  prisma:error 
Invalid `prisma.cartItem.deleteMany()` invocation:


Transaction API error: Transaction already closed: A query cannot be executed on an expired transaction. The timeout for this transaction was 5000 ms, however 5310 ms passed since the start of the transaction. Consider increasing the interactive transaction timeout or doing less work in the transaction.
%255Broot-of-the-ser…(ecmascript)?244:56
  Server  [OrdersService] On-demand order creation fallback error: PrismaClientKnownRequestError: 
Invalid `prisma.cartItem.deleteMany()` invocation:


Transaction API error: Transaction already closed: A query cannot be executed on an expired transaction. The timeout for this transaction was 5000 ms, however 5310 ms passed since the start of the transaction. Consider increasing the interactive transaction timeout or doing less work in the transaction.
    at eval (order-creation.ts:223:7)
    at createOrderFromPaymentIntent (order-creation.ts:105:19)
    at getOrderByNumber (orders.ts:58:31)
    at OrderConfirmationContent (page.tsx:80:18)
﻿



here, i just need caard, leave other options, but main error is
when i click checkout button from cart, the error comes in console log of chrome dev tools, when i hit final payment proceed button to pay the amount in development mod eof stripe i got prisma error