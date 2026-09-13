import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "403 — Access Denied",
  description: "You do not have permission to access this administration area.",
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
        <ShieldAlert className="h-8 w-8" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mb-2">
        403 — Access Denied
      </h1>

      <p className="max-w-md text-sm text-muted-foreground mb-6">
        You do not have administrative privileges to access this area. If you
        believe this is an error, please sign in with an authorized
        administrator account.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button variant="outline" className="inline-flex items-center gap-2 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            Back to Storefront
          </Button>
        </Link>

        <Link href="/login?callbackUrl=/admin/products">
          <Button className="inline-flex items-center gap-2 cursor-pointer">
            <LogIn className="h-4 w-4" />
            Sign in as Admin
          </Button>
        </Link>
      </div>
    </div>
  );
}
