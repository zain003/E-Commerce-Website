import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/services/auth-service";
import { ProfileView } from "@/components/account/profile-view";
import AccountLoading from "@/app/account/loading";

export const instant = false;

export const metadata: Metadata = {
  title: "My Account Profile — E-Commerce Store",
  description: "View and manage your customer account profile",
};

export default function ProfilePage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<AccountLoading />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}

async function ProfileContent() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login?callbackUrl=/account/profile");
  }

  const result = await getCurrentUser(session.user.id);

  if (!result.success || !result.data) {
    redirect("/login?callbackUrl=/account/profile");
  }

  return <ProfileView user={result.data.user} />;
}
