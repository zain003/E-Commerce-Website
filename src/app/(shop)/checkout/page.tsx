import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/services/auth-service";
import { CheckoutWizard } from "@/components/checkout/checkout-wizard";
import { Address } from "@/types";

export const metadata: Metadata = {
  title: "Checkout — E-Commerce Store",
  description: "Secure, mobile-first multi-step checkout",
};

export default async function CheckoutPage() {
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
    <main className="min-h-[calc(100vh-4rem)] pb-16">
      <CheckoutWizard
        isGuest={isGuest}
        userEmail={userEmail}
        initialAddresses={savedAddresses}
      />
    </main>
  );
}
