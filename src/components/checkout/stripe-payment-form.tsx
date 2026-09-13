"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/components/product/price-tag";
import {
  Lock,
  Loader2,
  AlertCircle,
  ShieldCheck,
  RotateCw,
} from "lucide-react";

export interface StripePaymentFormProps {
  amount: number;
  paymentIntentId?: string;
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: any) => void;
  className?: string;
}

export function StripePaymentForm({
  amount,
  paymentIntentId,
  onSuccess,
  onError,
  className = "",
}: StripePaymentFormProps) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = React.useState(false);

  const isStripeReady = Boolean(stripe && elements);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setIsNetworkError(false);

    try {
      const returnUrl = typeof window !== "undefined"
        ? `${window.location.origin}/order-confirmation?orderNumber=${paymentIntentId || "confirmed"}`
        : "/order-confirmation";

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: "if_required",
      });

      if (result.error) {
        const error = result.error;
        const isConnectionIssue =
          error.type === "api_connection_error" ||
          (typeof error.message === "string" &&
            error.message.toLowerCase().includes("connection"));

        setIsNetworkError(isConnectionIssue);
        setErrorMessage(
          error.message ||
            "Your payment could not be processed. Please check your card details and try again."
        );
        setIsProcessing(false);
        onError?.(error);
        return;
      }

      const paymentIntent = result.paymentIntent;

      if (
        paymentIntent &&
        (paymentIntent.status === "succeeded" ||
          paymentIntent.status === "processing")
      ) {
        onSuccess?.(paymentIntent);

        const targetOrderNumber = paymentIntent.id || paymentIntentId || "confirmed";
        router.push(
          `/order-confirmation?orderNumber=${targetOrderNumber}&payment_intent=${paymentIntent.id}`
        );
      } else {
        setIsProcessing(false);
      }
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setIsNetworkError(true);
      setErrorMessage(
        errObj?.message ||
          "A network or unexpected error occurred while connecting to the payment gateway. Please try again."
      );
      setIsProcessing(false);
      onError?.(err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full max-w-full space-y-5 overflow-hidden ${className}`}
      noValidate
    >
      {/* Inline Accessible Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive"
        >
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Payment Unsuccessful</p>
            <p>{errorMessage}</p>
            {isNetworkError && (
              <p className="pt-1 text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <RotateCw className="h-3 w-3" />
                Please check your network and click Pay Now to retry.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Stripe Payment Element Container */}
      <div className="w-full max-w-full overflow-hidden rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs">
        <PaymentElement
          id="payment-element"
          options={{
            layout: "tabs",
          }}
          className="w-full max-w-full"
        />
      </div>

      {/* Pay Now Button */}
      <Button
        type="submit"
        size="lg"
        disabled={!isStripeReady || isProcessing}
        aria-busy={isProcessing}
        className="w-full gap-2 font-semibold shadow-xs cursor-pointer text-sm sm:text-base py-6"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing payment...</span>
          </>
        ) : !isStripeReady ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading payment secure gateway...</span>
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            <span>Pay {formatCurrency(amount)}</span>
          </>
        )}
      </Button>

      {/* Trust & Security Signals */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1 text-center text-xs text-muted-foreground">
        <div className="flex items-center gap-1 text-emerald-600 font-medium">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>256-bit SSL Encrypted Payment</span>
        </div>
        <span className="hidden sm:inline">•</span>
        <span>PCI-DSS Level 1 Compliant</span>
      </div>
    </form>
  );
}
