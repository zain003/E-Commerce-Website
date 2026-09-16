"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null;
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/admin/dashboard",
      badge: "Live",
    },
    {
      name: "Products & Stock",
      href: "/admin/products",
      icon: Package,
      isActive: pathname.startsWith("/admin/products"),
    },
    {
      name: "Orders & Fulfillment",
      href: "/admin/orders",
      icon: ShoppingBag,
      isActive: pathname.startsWith("/admin/orders"),
    },
  ];

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 relative z-30 shrink-0 select-none",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Collapse Toggle Button */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-7 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-xs hover:bg-muted hover:text-foreground cursor-pointer z-40 transition-transform active:scale-95"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-border/80 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
          <ShieldCheck className="h-5 w-5" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm font-bold tracking-[0.15em] uppercase text-foreground truncate">
                Atelier
              </span>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                Staff
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground truncate">
              Admin Operations
            </span>
          </div>
        )}
      </div>

      {/* Navigation Cluster */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2">
              Management
            </p>
          )}
          <nav className="space-y-1" aria-label="Admin Sidebar Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all",
                    item.isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                      item.isActive ? "text-primary-foreground" : "text-muted-foreground"
                    )}
                  />
                  {!isCollapsed && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}
                  {!isCollapsed && item.badge && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        item.isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick External Actions */}
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground mb-2">
              Shortcuts
            </p>
          )}
          <div className="space-y-1">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              title={isCollapsed ? "View Live Storefront" : undefined}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors group"
            >
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
              {!isCollapsed && (
                <>
                  <span className="truncate flex-1">Live Storefront</span>
                  <span className="text-[10px] text-muted-foreground/80 font-mono">↗</span>
                </>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* User Footer Profile & Sign Out */}
      <div className="border-t border-border/80 p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl p-2 bg-muted/40",
            isCollapsed && "justify-center"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary font-serif">
            {user?.name ? user.name[0].toUpperCase() : "A"}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold text-foreground">
                {user?.name || "Admin Staff"}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {user?.email || "admin@atelier.com"}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              aria-label="Sign out of admin account"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
