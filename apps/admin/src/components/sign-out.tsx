"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@kiloclub/shared/supabase/client";

export function SignOut({ className = "btn-outline" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await createClient().auth.signOut();
        router.replace("/login");
        router.refresh();
      }}
    >
      Log out and switch account
    </button>
  );
}
