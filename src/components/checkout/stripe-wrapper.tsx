"use client";

import * as React from "react";
import { loadStripe, Stripe, StripeElementsOptionsClientSecret } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";

let stripePromiseSingleton: Promise<Stripe | null> | null = null;

export function getStripePromise(publishableKey?: string): Promise<Stripe | null> {
  const key =
    publishableKey ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "";

  if (!stripePromiseSingleton && key) {
    stripePromiseSingleton = loadStripe(key);
  }

  return stripePromiseSingleton || Promise.resolve(null);
}

export interface StripeWrapperProps {
  clientSecret: string;
  children: React.ReactNode;
  publishableKey?: string;
  options?: Omit<StripeElementsOptionsClientSecret, "clientSecret">;
}

export function StripeWrapper({
  clientSecret,
  children,
  publishableKey,
  options,
}: StripeWrapperProps) {
  const stripePromise = React.useMemo(
    () => getStripePromise(publishableKey),
    [publishableKey]
  );

  const elementsOptions: StripeElementsOptionsClientSecret = React.useMemo(
    () => ({
      clientSecret,
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#18181b",
          colorBackground: "#ffffff",
          colorText: "#09090b",
          colorDanger: "#ef4444",
          fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          borderRadius: "8px",
          spacingUnit: "4px",
        },
        rules: {
          ".Input": {
            borderColor: "#e4e4e7",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          },
          ".Input:focus": {
            borderColor: "#18181b",
            boxShadow: "0 0 0 2px rgba(24, 24, 27, 0.1)",
          },
          ".Label": {
            fontWeight: "500",
            fontSize: "13px",
            color: "#09090b",
            marginBottom: "6px",
          },
          ".Tab": {
            borderColor: "#e4e4e7",
            backgroundColor: "#f4f4f5",
          },
          ".Tab--selected": {
            borderColor: "#18181b",
            backgroundColor: "#ffffff",
          },
        },
      },
      ...options,
    }),
    [clientSecret, options]
  );

  if (!clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
        <p className="text-xs">Initializing secure payment gateway...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={elementsOptions}>
      {children}
    </Elements>
  );
}
