"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { checkoutAddressSchema } from "@/lib/validators/checkout";
import { Address, AddressDto } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, ArrowRight, User, Mail } from "lucide-react";

const phoneRegex = /^\+?[0-9\s\-().]+$/;

const baseAddressFormSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  street: z.string().trim().min(1, "Street address is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  postalCode: z
    .string()
    .trim()
    .min(3, "Postal code must be at least 3 characters")
    .max(12, "Postal code is too long")
    .regex(/^[A-Za-z0-9\s-]+$/, "Invalid postal code format"),
  country: z.string().trim().min(2, "Country is required"),
  phone: z
    .string()
    .trim()
    .max(25, "Phone number is too long")
    .regex(phoneRegex, "Invalid phone number format")
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, "");
        return digits.length >= 7 && digits.length <= 15;
      },
      { message: "Phone number must contain between 7 and 15 digits" }
    ),
  isDefault: z.boolean().optional(),
  guestEmail: z.string().optional(),
});

const guestAddressFormSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  street: z.string().trim().min(1, "Street address is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  postalCode: z
    .string()
    .trim()
    .min(3, "Postal code must be at least 3 characters")
    .max(12, "Postal code is too long")
    .regex(/^[A-Za-z0-9\s-]+$/, "Invalid postal code format"),
  country: z.string().trim().min(2, "Country is required"),
  phone: z
    .string()
    .trim()
    .max(25, "Phone number is too long")
    .regex(phoneRegex, "Invalid phone number format")
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, "");
        return digits.length >= 7 && digits.length <= 15;
      },
      { message: "Phone number must contain between 7 and 15 digits" }
    ),
  isDefault: z.boolean().optional(),
  guestEmail: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Invalid email address")
    .email("Invalid email address"),
});

export type CheckoutAddressFormData = {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
  guestEmail?: string;
};

export interface AddressStepProps {
  initialAddress?: Partial<AddressDto>;
  initialGuestEmail?: string;
  isGuest?: boolean;
  savedAddresses?: Address[];
  onNext: (data: { address: AddressDto; guestEmail?: string }) => void;
}

export function AddressStep({
  initialAddress,
  initialGuestEmail = "",
  isGuest = false,
  savedAddresses = [],
  onNext,
}: AddressStepProps) {
  const hasSavedAddresses = !isGuest && savedAddresses.length > 0;
  const defaultSavedAddress = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];

  const [selectedAddressId, setSelectedAddressId] = React.useState<string>(
    hasSavedAddresses ? defaultSavedAddress?.id || "new" : "new"
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutAddressFormData>({
    resolver: zodResolver(isGuest ? guestAddressFormSchema : baseAddressFormSchema),
    defaultValues: {
      fullName: initialAddress?.fullName || "",
      street: initialAddress?.street || "",
      city: initialAddress?.city || "",
      state: initialAddress?.state || "",
      postalCode: initialAddress?.postalCode || "",
      country: initialAddress?.country || "",
      phone: initialAddress?.phone || "",
      isDefault: initialAddress?.isDefault ?? false,
      guestEmail: initialGuestEmail || "",
    },
  });

  const onSubmitForm = (data: CheckoutAddressFormData) => {
    onNext({
      address: {
        fullName: data.fullName,
        street: data.street,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone,
        isDefault: data.isDefault,
      },
      guestEmail: isGuest ? data.guestEmail : initialGuestEmail || undefined,
    });
  };

  const handleSavedAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAddressId === "new") {
      handleSubmit(onSubmitForm)();
      return;
    }

    const chosen = savedAddresses.find((a) => a.id === selectedAddressId);
    if (!chosen) {
      handleSubmit(onSubmitForm)();
      return;
    }

    onNext({
      address: {
        fullName: chosen.fullName,
        street: chosen.street,
        city: chosen.city,
        state: chosen.state,
        postalCode: chosen.postalCode,
        country: chosen.country,
        phone: chosen.phone,
        isDefault: chosen.isDefault,
      },
      guestEmail: initialGuestEmail || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Saved Addresses Section (for Authenticated Users) */}
      {hasSavedAddresses && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">
              Select Shipping Destination
            </h3>
            <span className="text-xs text-muted-foreground">
              {savedAddresses.length} saved{" "}
              {savedAddresses.length === 1 ? "address" : "addresses"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {savedAddresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;
              return (
                <label
                  key={addr.id}
                  htmlFor={`address-${addr.id}`}
                  className={`relative flex cursor-pointer flex-col rounded-xl border p-4 transition-all ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/20 bg-card shadow-xs"
                      : "border-border bg-card/60 hover:border-border/80 hover:bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`address-${addr.id}`}
                        name="savedAddress"
                        value={addr.id}
                        checked={isSelected}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="h-4 w-4 text-primary focus:ring-primary"
                        aria-label={`${addr.fullName}, ${addr.street}`}
                      />
                      <span className="font-semibold text-sm text-foreground">
                        {addr.fullName}
                      </span>
                    </div>
                    {addr.isDefault && (
                      <Badge variant="success" className="text-[10px] shrink-0 font-medium">
                        Default
                      </Badge>
                    )}
                  </div>

                  <div className="ml-6 space-y-1 text-xs text-muted-foreground">
                    <p className="text-foreground">{addr.street}</p>
                    <p>
                      {addr.city}, {addr.state} {addr.postalCode}
                    </p>
                    <p>{addr.country}</p>
                    <div className="flex items-center gap-1 pt-1 text-[11px]">
                      <Phone className="h-3 w-3" />
                      <span>{addr.phone}</span>
                    </div>
                  </div>
                </label>
              );
            })}

            {/* Use New Address Option */}
            <label
              htmlFor="address-new"
              className={`relative flex cursor-pointer flex-col justify-center rounded-xl border p-4 transition-all ${
                selectedAddressId === "new"
                  ? "border-primary ring-2 ring-primary/20 bg-card shadow-xs"
                  : "border-dashed border-border bg-muted/20 hover:border-border hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="address-new"
                  name="savedAddress"
                  value="new"
                  checked={selectedAddressId === "new"}
                  onChange={() => setSelectedAddressId("new")}
                  className="h-4 w-4 text-primary focus:ring-primary"
                  aria-label="Use a new address"
                />
                <span className="font-semibold text-sm text-foreground">
                  Use a new address
                </span>
              </div>
              <p className="ml-6 mt-1 text-xs text-muted-foreground">
                Enter a different delivery address for this order
              </p>
            </label>
          </div>
        </div>
      )}

      {/* Manual Address Form (when guest OR when "Use a new address" is selected) */}
      {(!hasSavedAddresses || selectedAddressId === "new") && (
        <form
          id="address-form"
          onSubmit={handleSubmit(onSubmitForm)}
          className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs"
          noValidate
        >
          {/* Guest Contact Information Header */}
          {isGuest && (
            <div className="space-y-3 pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold text-foreground">
                  Contact Information
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                We will send your order confirmation and tracking details here.
              </p>

              <div>
                <label
                  htmlFor="guestEmail"
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  Email address
                </label>
                <Input
                  id="guestEmail"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.guestEmail)}
                  {...register("guestEmail")}
                  className={errors.guestEmail ? "border-destructive" : ""}
                />
                {errors.guestEmail && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.guestEmail.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Shipping Address Inputs */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">
                Shipping Address
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="fullName"
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  Full name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="e.g. Jane Doe"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.fullName)}
                  {...register("fullName")}
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Street Address */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="street"
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  Street address
                </label>
                <Input
                  id="street"
                  type="text"
                  placeholder="123 Main St, Apt 4B"
                  autoComplete="street-address"
                  aria-invalid={Boolean(errors.street)}
                  {...register("street")}
                  className={errors.street ? "border-destructive" : ""}
                />
                {errors.street && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.street.message}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label
                  htmlFor="city"
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  City
                </label>
                <Input
                  id="city"
                  type="text"
                  placeholder="City"
                  autoComplete="address-level2"
                  aria-invalid={Boolean(errors.city)}
                  {...register("city")}
                  className={errors.city ? "border-destructive" : ""}
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.city.message}
                  </p>
                )}
              </div>

              {/* State */}
              <div>
                <label
                  htmlFor="state"
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  State / Province
                </label>
                <Input
                  id="state"
                  type="text"
                  placeholder="State"
                  autoComplete="address-level1"
                  aria-invalid={Boolean(errors.state)}
                  {...register("state")}
                  className={errors.state ? "border-destructive" : ""}
                />
                {errors.state && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.state.message}
                  </p>
                )}
              </div>

              {/* Postal Code */}
              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  Postal / ZIP code
                </label>
                <Input
                  id="postalCode"
                  type="text"
                  placeholder="e.g. 98101"
                  autoComplete="postal-code"
                  aria-invalid={Boolean(errors.postalCode)}
                  {...register("postalCode")}
                  className={errors.postalCode ? "border-destructive" : ""}
                />
                {errors.postalCode && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.postalCode.message}
                  </p>
                )}
              </div>

              {/* Country */}
              <div>
                <label
                  htmlFor="country"
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  Country
                </label>
                <Input
                  id="country"
                  type="text"
                  placeholder="e.g. USA"
                  autoComplete="country-name"
                  aria-invalid={Boolean(errors.country)}
                  {...register("country")}
                  className={errors.country ? "border-destructive" : ""}
                />
                {errors.country && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.country.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="phone"
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  Phone number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (206) 555-0100"
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                  {...register("phone")}
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.phone.message}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Required for delivery carrier notifications (7-15 digits).
                </p>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Action Button */}
      <div className="pt-2">
        <Button
          type="button"
          size="lg"
          onClick={(e) => {
            if (hasSavedAddresses && selectedAddressId !== "new") {
              handleSavedAddressSubmit(e);
            } else {
              handleSubmit(onSubmitForm)();
            }
          }}
          className="w-full sm:w-auto gap-2 font-semibold shadow-xs cursor-pointer"
        >
          <span>Continue to Delivery</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
