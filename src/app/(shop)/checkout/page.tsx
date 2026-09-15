import type { Metadata } from "next";
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/services/auth-service";
import { CheckoutWizard } from "@/components/checkout/checkout-wizard";
import { CheckoutSkeleton } from "@/components/checkout/checkout-skeleton";
import { Address } from "@/types";

export const metadata: Metadata = {
  title: "Checkout — E-Commerce Store",
  description: "Secure, mobile-first multi-step checkout",
};

export default function CheckoutPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] pb-16">
      <Suspense fallback={<CheckoutSkeleton />}>
        <CheckoutContent />
      </Suspense>
    </main>
  );
}

async function CheckoutContent() {
  const session = await getServerSession(authOptions);
  let savedAddresses: Address[] = [];

  if (session?.user?.id) {
    const userRes = await getCurrentUser(session.user.id);
    if (userRes.success && userRes.data) {
      savedAddresses = userRes.data.user.addresses;
    }
  }

  const isGuest = !session?.user?.id;
  const userEmail = session?.user?.email || null;

  return (
    <CheckoutWizard
      isGuest={isGuest}
      userEmail={userEmail}
      initialAddresses={savedAddresses}
    />
  );
}

