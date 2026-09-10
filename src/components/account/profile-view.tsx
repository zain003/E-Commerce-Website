"use client";

import * as React from "react";
import { User } from "@/types";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  User as UserIcon,
  Mail,
  Calendar,
  MapPin,
  Package,
  Heart,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ProfileViewProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    role: string;
    createdAt: Date | string;
  };
}

export function ProfileView({ user }: ProfileViewProps) {
  const registeredDate = React.useMemo(() => {
    try {
      return new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  }, [user.createdAt]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          My Account
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          View your profile details and manage your shopping preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
              <UserIcon className="h-10 w-10 text-foreground" />
            </div>
            <CardTitle className="text-xl">{user.name || "Customer"}</CardTitle>
            <div className="pt-1">
              <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                {user.role === "ADMIN" ? (
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Admin
                  </span>
                ) : (
                  "Customer"
                )}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0 text-foreground" />
              <span className="truncate text-foreground font-medium">
                {user.email}
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0 text-foreground" />
              <span>Joined {registeredDate}</span>
            </div>

            <div className="pt-4">
              <Button
                variant="outline"
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation Hub */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Account Hub</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/account/addresses" className="block group">
              <Card className="h-full transition-all group-hover:border-primary/50 group-hover:shadow-md">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="rounded-lg bg-muted p-2.5 text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      Shipping Addresses
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Manage default shipping addresses and delivery contacts
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/account/orders" className="block group">
              <Card className="h-full transition-all group-hover:border-primary/50 group-hover:shadow-md">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="rounded-lg bg-muted p-2.5 text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      Order History
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      View past orders, receipts, and track shipments
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/account/wishlist" className="block group">
              <Card className="h-full transition-all group-hover:border-primary/50 group-hover:shadow-md">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="rounded-lg bg-muted p-2.5 text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      Saved Wishlist
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      View your saved products and move to cart
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
