import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
      <Suspense>
        <AuthForm />
      </Suspense>
    </div>
  );
}
