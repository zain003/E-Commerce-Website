import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminRootPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect("/login?callbackUrl=/admin/dashboard");
    return;
  }

  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
    return;
  }

  redirect("/admin/dashboard");
}
