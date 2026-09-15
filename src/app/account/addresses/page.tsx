import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/services/auth-service";
import { AddressesView } from "@/components/account/addresses-view";
import { BackButton } from "@/components/ui/back-button";
import AccountLoading from "@/app/account/loading";

export const instant = false;

export const metadata: Metadata = {
  title: "Saved Shipping Addresses — E-Commerce Store",
  description: "Manage your saved shipping addresses for checkout",
};

export default function AddressesPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <BackButton fallbackUrl="/account/profile" label="Back" />
      </div>
      <Suspense fallback={<AccountLoading />}>
        <AddressesContent />
      </Suspense>
    </div>
  );
}

async function AddressesContent() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login?callbackUrl=/account/addresses");
  }

  const result = await getCurrentUser(session.user.id);

  if (!result.success || !result.data) {
    redirect("/login?callbackUrl=/account/addresses");
  }

  return <AddressesView initialAddresses={result.data.user.addresses} />;
}

