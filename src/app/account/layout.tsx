import React from "react";
import ShopLayout from "@/app/(shop)/layout";

export const instant = false;

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return await ShopLayout({ children });
}

