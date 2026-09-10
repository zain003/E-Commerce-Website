"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addressSchema, AddressInput } from "@/lib/validators/auth";
import { Address } from "@/types";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type AddressFormInput = z.input<typeof addressSchema>;

export interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddressInput) => Promise<void>;
  initialData?: Address | null;
  isLoading?: boolean;
}

export function AddressFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: AddressFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormInput, unknown, AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      street: initialData?.street || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      postalCode: initialData?.postalCode || "",
      country: initialData?.country || "USA",
      phone: initialData?.phone || "",
      isDefault: initialData?.isDefault || false,
    },
  });

  React.useEffect(() => {
    if (initialData) {
      reset({
        fullName: initialData.fullName,
        street: initialData.street,
        city: initialData.city,
        state: initialData.state,
        postalCode: initialData.postalCode,
        country: initialData.country,
        phone: initialData.phone,
        isDefault: initialData.isDefault,
      });
    } else {
      reset({
        fullName: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "USA",
        phone: "",
        isDefault: false,
      });
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = async (data: AddressInput) => {
    await onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Shipping Address" : "Add New Shipping Address"}
      description="Enter your delivery destination and contact details below."
    >
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-4 pt-2"
        noValidate
      >
        <Input
          id="address-fullName"
          label="Full Name"
          placeholder="e.g. Jane Doe"
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <Input
          id="address-street"
          label="Street Address"
          placeholder="e.g. 123 Main Street, Apt 4B"
          error={errors.street?.message}
          {...register("street")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="address-city"
            label="City"
            placeholder="e.g. Seattle"
            error={errors.city?.message}
            {...register("city")}
          />
          <Input
            id="address-state"
            label="State"
            placeholder="e.g. WA"
            error={errors.state?.message}
            {...register("state")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="address-postalCode"
            label="Postal Code"
            placeholder="e.g. 98101"
            error={errors.postalCode?.message}
            {...register("postalCode")}
          />
          <Input
            id="address-country"
            label="Country"
            placeholder="e.g. USA"
            error={errors.country?.message}
            {...register("country")}
          />
        </div>

        <Input
          id="address-phone"
          label="Phone"
          type="tel"
          placeholder="e.g. +1 (206) 555-0100"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <div className="flex items-center gap-2 pt-1">
          <input
            id="address-isDefault"
            type="checkbox"
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            {...register("isDefault")}
          />
          <label
            htmlFor="address-isDefault"
            className="text-sm font-medium text-foreground cursor-pointer"
          >
            Set as default shipping address
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isLoading ? "Saving..." : "Save Address"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
