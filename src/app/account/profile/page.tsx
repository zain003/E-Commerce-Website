import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/services/auth-service";
import { ProfileView } from "@/components/account/profile-view";

export const metadata: Metadata = {
  title: "My Account Profile — E-Commerce Store",
  description: "View and manage your customer account profile",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login?callbackUrl=/account/profile");
  }

  const result = await getCurrentUser(session.user.id);

  if (!result.success || !result.data) {
    redirect("/login?callbackUrl=/account/profile");
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <ProfileView user={result.data.user} />
    </div>
  );
}
