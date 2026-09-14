"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Address,
  AddressDto,
  CheckoutPreview,
  CheckoutSessionDto,
} from "@/types";
import { AddressStep } from "@/components/checkout/address-step";
import { ShippingStep } from "@/components/checkout/shipping-step";
import { CheckoutOrderSummary } from "@/components/checkout/order-summary";
import { StripeWrapper } from "@/components/checkout/stripe-wrapper";
import { StripePaymentForm } from "@/components/checkout/stripe-payment-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/components/product/price-tag";
import { useCartStore } from "@/store/cart-store";
import {
  Check,
  MapPin,
  Truck,
  CreditCard,
  Edit2,
  AlertCircle,
  ArrowLeft,
  Lock,
  Loader2,
} from "lucide-react";

export interface CheckoutWizardProps {
  isGuest?: boolean;
  userEmail?: string | null;
  initialAddresses?: Address[];
  initialPreview?: CheckoutPreview;
}

const SESSION_STORAGE_KEY = "checkout_draft_v1";

interface CheckoutDraftState {
  step: 1 | 2 | 3;
  address: AddressDto | null;
  guestEmail?: string;
  shippingMethodId: "STANDARD" | "EXPRESS";
}

export function CheckoutWizard({
  isGuest = true,
  userEmail,
  initialAddresses = [],
  initialPreview,
}: CheckoutWizardProps) {
  const router = useRouter();

  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const [preview, setPreview] = React.useState<CheckoutPreview | null>(
    initialPreview || null
  );
  const [isLoadingPreview, setIsLoadingPreview] = React.useState(!initialPreview);

  // Draft state
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [address, setAddress] = React.useState<AddressDto | null>(null);
  const [guestEmail, setGuestEmail] = React.useState<string>(userEmail || "");
  const [shippingMethodId, setShippingMethodId] = React.useState<
    "STANDARD" | "EXPRESS"
  >("STANDARD");

  const [isValidating, setIsValidating] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [isPaymentReady, setIsPaymentReady] = React.useState(false);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = React.useState<string | null>(null);

  // Restore draft state from sessionStorage
  React.useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed: CheckoutDraftState = JSON.parse(saved);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.guestEmail) setGuestEmail(parsed.guestEmail);
        if (parsed.shippingMethodId) setShippingMethodId(parsed.shippingMethodId);
      }
    } catch {
      // Ignore storage errors in private browsing
    }
  }, []);

  // Sync draft state to sessionStorage
  React.useEffect(() => {
    try {
      const draft: CheckoutDraftState = {
        step,
        address,
        guestEmail,
        shippingMethodId,
      };
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Ignore storage errors
    }
  }, [step, address, guestEmail, shippingMethodId]);

  // Load preview or redirect if empty
  React.useEffect(() => {
    if (initialPreview) {
      if (initialPreview.items.length === 0) {
        router.push("/cart");
      }
      return;
    }

    let isMounted = true;
    async function loadPreview() {
      try {
        const queryParams = new URLSearchParams();
        if (appliedCoupon?.code) {
          queryParams.set("coupon", appliedCoupon.code);
        }
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
        const res = await fetch(`/api/checkout/preview${queryString}`);
        const json = await res.json();
        if (!isMounted) return;

        if (
          !res.ok ||
          !json.success ||
          !json.data ||
          json.data.items.length === 0
        ) {
          router.push("/cart");
          return;
        }

        setPreview(json.data);
      } catch {
        if (isMounted) {
          router.push("/cart");
        }
      } finally {
        if (isMounted) {
          setIsLoadingPreview(false);
        }
      }
    }

    loadPreview();
    return () => {
      isMounted = false;
    };
  }, [initialPreview, router, appliedCoupon]);

  // Handle step 1 completion
  const handleAddressSubmit = (data: {
    address: AddressDto;
    guestEmail?: string;
  }) => {
    setAddress(data.address);
    if (data.guestEmail) {
      setGuestEmail(data.guestEmail);
    }
    setStep(2);
    setValidationError(null);
  };

  // Handle step 2 completion
  const handleShippingSubmit = () => {
    setStep(3);
    setValidationError(null);
  };

  // Handle step 3 proceed to payment
  const handleProceedToPayment = async () => {
    if (!address) {
      setStep(1);
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const payload: CheckoutSessionDto = {
        shippingAddress: address,
        shippingMethodId,
        guestEmail: isGuest ? guestEmail : undefined,
        couponCode: appliedCoupon?.code,
      };

      const res = await fetch("/api/checkout/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setValidationError(
          json.error?.message || "Checkout validation failed. Please check your information."
        );
        setIsValidating(false);
        return;
      }

      // Initialize Stripe PaymentIntent
      const intentRes = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutSession: payload }),
      });

      const intentJson = await intentRes.json();

      if (!intentRes.ok || !intentJson.success || !intentJson.data?.clientSecret) {
        setValidationError(
          intentJson.error?.message || "Failed to initialize payment gateway. Please try again."
        );
        setIsValidating(false);
        return;
      }

      setClientSecret(intentJson.data.clientSecret);
      setPaymentIntentId(intentJson.data.paymentIntentId);
      setIsPaymentReady(true);
      setIsValidating(false);
    } catch {
      setValidationError("Failed to connect to checkout service. Please try again.");
      setIsValidating(false);
    }
  };

  if (isLoadingPreview || !preview) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">
            Preparing your checkout session...
          </p>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: "1. Address" },
    { num: 2, label: "2. Delivery" },
    { num: 3, label: "3. Review" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Checkout Progress Stepper */}
      <nav
        aria-label="Checkout Progress"
        className="mb-8 border-b border-border pb-6"
      >
        <ol className="flex items-center justify-between sm:justify-center sm:gap-12">
          {steps.map((s) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;

            return (
              <li
                key={s.num}
                aria-current={isCurrent ? "step" : undefined}
                className="flex items-center gap-2"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/10"
                      : "border border-border bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : s.num}
                </div>
                <span
                  className={`text-xs sm:text-sm font-semibold transition-colors ${
                    isCurrent
                      ? "text-foreground font-bold"
                      : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left Column: Wizard Steps */}
        <div className="lg:col-span-7">
          {/* Validation Error Alert */}
          {validationError && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive"
            >
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Checkout Error</p>
                <p>{validationError}</p>
              </div>
            </div>
          )}

          {/* STEP 1: Address */}
          {step === 1 && (
            <AddressStep
              initialAddress={address || undefined}
              initialGuestEmail={guestEmail}
              isGuest={isGuest}
              savedAddresses={initialAddresses}
              onNext={handleAddressSubmit}
            />
          )}

          {/* STEP 2: Delivery Method */}
          {step === 2 && (
            <ShippingStep
              selectedMethodId={shippingMethodId}
              subtotal={preview.subtotal}
              availableMethods={preview.availableShippingMethods}
              onChange={(id) => setShippingMethodId(id)}
              onNext={handleShippingSubmit}
              onBack={() => setStep(1)}
            />
          )}

          {/* STEP 3: Review & Payment Readiness */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  Order Review
                </h3>
                <p className="text-xs text-muted-foreground">
                  Please review your delivery details and order summary before proceeding to payment.
                </p>
              </div>

              {/* Shipping Address Summary Card */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Shipping Destination</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsPaymentReady(false);
                      setClientSecret(null);
                      setStep(1);
                    }}
                    className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit</span>
                  </Button>
                </div>
                {address && (
                  <div className="space-y-0.5 text-xs text-muted-foreground ml-6">
                    <p className="font-medium text-foreground text-sm">
                      {address.fullName}
                    </p>
                    {isGuest && guestEmail && (
                      <p className="text-foreground">Email: {guestEmail}</p>
                    )}
                    <p>{address.street}</p>
                    <p>
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p>{address.country}</p>
                    <p className="pt-1 text-[11px]">Phone: {address.phone}</p>
                  </div>
                )}
              </div>

              {/* Delivery Speed Summary Card */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Selected Delivery</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsPaymentReady(false);
                      setClientSecret(null);
                      setStep(2);
                    }}
                    className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit</span>
                  </Button>
                </div>
                <div className="ml-6 space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {shippingMethodId === "EXPRESS"
                        ? "Express Delivery"
                        : "Standard Delivery"}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {shippingMethodId === "EXPRESS"
                        ? "1-2 Business Days"
                        : "3-5 Business Days"}
                    </Badge>
                  </div>
                  <p>
                    {shippingMethodId === "EXPRESS"
                      ? "$15.00 Priority Air Shipping"
                      : preview.subtotal >= 100
                      ? "Free Standard Ground Shipping"
                      : "$5.00 Standard Ground Shipping"}
                  </p>
                </div>
              </div>

              {/* Stripe Credit Card Payment Form */}
              {clientSecret && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">
                      Payment Details
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Enter your payment card information. All transactions are 256-bit encrypted and secure.
                    </p>
                  </div>
                  <StripeWrapper clientSecret={clientSecret}>
                    <StripePaymentForm
                      amount={preview.total}
                      paymentIntentId={paymentIntentId || undefined}
                    />
                  </StripeWrapper>
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsPaymentReady(false);
                        setClientSecret(null);
                        setStep(2);
                      }}
                      className="gap-2 text-xs font-semibold cursor-pointer"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      <span>Back to Delivery</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons before Stripe Form is initialized */}
              {!clientSecret && (
                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(2)}
                    className="w-full sm:w-auto gap-2 font-semibold shadow-xs cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Delivery</span>
                  </Button>

                  <Button
                    type="button"
                    size="lg"
                    onClick={handleProceedToPayment}
                    disabled={isValidating}
                    isLoading={isValidating}
                    className="w-full sm:w-auto gap-2 font-semibold shadow-xs cursor-pointer"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Proceed to Payment</span>
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Sticky Order Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <CheckoutOrderSummary
              preview={preview}
              selectedShippingMethodId={shippingMethodId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
