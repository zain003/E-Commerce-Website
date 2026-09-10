"use client";

import * as React from "react";
import { Address } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Trash2, Edit } from "lucide-react";

export interface AddressCardProps {
  address: Address;
  onEdit?: (address: Address) => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  isDeleting = false,
}: AddressCardProps) {
  return (
    <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="space-y-0.5">
            <h4 className="font-semibold text-foreground text-base">
              {address.fullName}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span>{address.phone}</span>
            </div>
          </div>
          {address.isDefault && (
            <Badge variant="success" className="shrink-0 font-medium">
              Default
            </Badge>
          )}
        </div>

        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-4">
          <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
          <div className="space-y-0.5">
            <p className="text-foreground">{address.street}</p>
            <p>
              {address.city}, {address.state} {address.postalCode}
            </p>
            <p>{address.country}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(address)}
              className="gap-1.5"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit</span>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(address.id)}
              disabled={isDeleting}
              isLoading={isDeleting}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5 ml-auto"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
