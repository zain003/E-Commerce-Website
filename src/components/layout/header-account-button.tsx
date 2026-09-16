"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { signOut } from "next-auth/react";

export interface HeaderAccountButtonProps {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null;
}

export function HeaderAccountButton({ user }: HeaderAccountButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isAuthenticated = Boolean(user?.id);
  const href = isAuthenticated ? "/account/profile" : "/login";
  const label = isAuthenticated && user?.name ? user.name.split(" ")[0] : "Account";
  const ariaLabel = isAuthenticated ? "View your account profile" : "Sign in to your account";

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-block"
    >
      <Link
        href={href}
        aria-label={ariaLabel}
        onClick={() => setIsOpen(false)}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-xs sm:text-sm font-medium text-foreground transition-all hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">{label}</span>
        <ChevronDown
          className={`hidden sm:inline-block h-3 w-3 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180 text-foreground" : ""
          }`}
        />
      </Link>

      {/* Floating Quiet Luxury Account Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-2xl border border-border bg-card p-2 shadow-2xl backdrop-blur-xl animate-in fade-in-50 zoom-in-95 duration-150">
          {isAuthenticated ? (
            <>
              {/* User Identity Header */}
              <div className="border-b border-border/60 px-3 py-2.5">
                <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-muted-foreground">
                  Signed in as
                </p>
                <p className="truncate text-xs font-semibold text-foreground">
                  {user?.name || "Valued Patron"}
                </p>
                {user?.email && (
                  <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
                )}
              </div>

              {/* Navigation Items */}
              <div className="py-1 space-y-0.5">
                <Link
                  href="/account/orders"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Package className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>My Orders</span>
                </Link>
                <Link
                  href="/account/addresses"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Saved Addresses</span>
                </Link>
                <Link
                  href="/account/wishlist"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Saved Wishlist</span>
                </Link>
                <Link
                  href="/account/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Profile Settings</span>
                </Link>
                {user?.role === "ADMIN" && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
              </div>

              {/* Sign Out Action */}
              <div className="border-t border-border/60 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    signOut({ callbackUrl: "/login" });
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Unauthenticated Options */}
              <div className="border-b border-border/60 px-3 py-2">
                <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-muted-foreground">
                  Atelier Account
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Sign in for orders, addresses, and wishlist.
                </p>
              </div>

              <div className="py-1 space-y-0.5">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <LogIn className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Create Account</span>
                </Link>
                <div className="border-t border-border/60 my-1" />
                <Link
                  href="/account/orders"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Package className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Track Orders</span>
                </Link>
                <Link
                  href="/account/addresses"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Saved Addresses</span>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
