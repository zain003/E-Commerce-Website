"use client";

import * as React from "react";
import { Address } from "@/types";
import { AddressInput } from "@/lib/validators/auth";
import { AddressCard } from "@/components/account/address-card";
import { AddressFormModal } from "@/components/account/address-form-modal";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, AlertCircle } from "lucide-react";

export interface AddressesViewProps {
  initialAddresses?: Address[];
}

export function AddressesView({ initialAddresses = [] }: AddressesViewProps) {
  const [addresses, setAddresses] = React.useState<Address[]>(initialAddresses);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<Address | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (address: Address) => {
    setEditingAddress(address);
    setError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  const handleSubmitAddress = async (data: AddressInput) => {
    setIsSaving(true);
    setError(null);

    try {
      const isEdit = Boolean(editingAddress);
      const url = isEdit
        ? `/api/account/addresses/${editingAddress?.id}`
        : "/api/account/addresses";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message || "Failed to save address");
        setIsSaving(false);
        return;
      }

      const savedAddress: Address = json.data;

      setAddresses((prev) => {
        let updated = prev;
        if (savedAddress.isDefault) {
          updated = updated.map((a) => ({ ...a, isDefault: false }));
        }

        if (isEdit) {
          return updated.map((a) => (a.id === savedAddress.id ? savedAddress : a));
        } else {
          return [savedAddress, ...updated];
        }
      });

      setIsSaving(false);
      handleCloseModal();
    } catch {
      setError("An unexpected network error occurred. Please try again.");
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    setDeletingId(id);
    setError(null);

    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message || "Failed to delete address");
        setDeletingId(null);
        return;
      }

      setAddresses((prev) => prev.filter((a) => a.id !== id));
      setDeletingId(null);
    } catch {
      setError("An unexpected network error occurred while deleting.");
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Saved Addresses
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your delivery destinations for fast and easy checkout.
          </p>
        </div>
        <Button onClick={handleOpenAddModal} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span>Add New Address</span>
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-4 text-sm font-medium text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
            <MapPin className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            No saved addresses yet
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            You don&apos;t have any shipping addresses saved to your account. Add
            one to get started.
          </p>
          <Button
            onClick={handleOpenAddModal}
            variant="outline"
            className="mt-5 gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Address</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteAddress}
              isDeleting={deletingId === addr.id}
            />
          ))}
        </div>
      )}

      <AddressFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitAddress}
        initialData={editingAddress}
        isLoading={isSaving}
      />
    </div>
  );
}
