import React from "react";
import Link from "next/link";
import { User } from "lucide-react";

export interface HeaderAccountButtonProps {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null;
}

export function HeaderAccountButton({ user }: HeaderAccountButtonProps) {
  const isAuthenticated = Boolean(user?.id);
  const href = isAuthenticated ? "/account/profile" : "/login";
  const label = isAuthenticated && user?.name ? user.name.split(" ")[0] : "Account";
  const ariaLabel = isAuthenticated ? "View your account profile" : "Sign in to your account";

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
    >
      <User className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
