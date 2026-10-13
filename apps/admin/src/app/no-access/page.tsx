import { ShieldAlert } from "lucide-react";
import { SignOut } from "@/components/sign-out";

export const metadata = { title: "No access" };

export default function NoAccessPage() {
  const store = process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3000";
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card max-w-md p-8 text-center">
        <ShieldAlert className="mx-auto size-10 text-gold-400" />
        <h1 className="mt-4 font-display text-2xl tracking-wide text-white uppercase">Admins only</h1>
        <p className="mt-2 text-sm text-ink-400">
          Your account doesn&apos;t have admin access. Ask an existing admin to promote you from the Users page.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <SignOut />
          <a href={store} className="text-sm text-ink-400 hover:text-gold-300">Go to the store</a>
        </div>
      </div>
    </div>
  );
}
