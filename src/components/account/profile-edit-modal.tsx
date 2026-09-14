"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, UpdateProfileInput } from "@/lib/validators/auth";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";

export interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName?: string | null;
  onSuccess: (updatedName: string) => void;
}

export function ProfileEditModal({
  isOpen,
  onClose,
  currentName,
  onSuccess,
}: ProfileEditModalProps) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: currentName || "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({ name: currentName || "" });
      setServerError(null);
    }
  }, [isOpen, currentName, reset]);

  const onFormSubmit = async (data: UpdateProfileInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setServerError(json.error?.message || "Failed to update profile");
        setIsSubmitting(false);
        return;
      }

      onSuccess(data.name);
      onClose();
    } catch {
      setServerError("A network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      description="Update your display name"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {serverError && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="profile-edit-name"
            className="text-sm font-medium text-foreground"
          >
            Full Name
          </label>
          <Input
            id="profile-edit-name"
            {...register("name")}
            aria-invalid={!!errors.name}
            disabled={isSubmitting}
            placeholder="Your Full Name"
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>Save Changes</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
