import type { Metadata, Viewport } from "next";
import "@fontsource/anton/400.css";
import "@fontsource-variable/inter";
import "./globals.css";
import { isSupabaseConfigured } from "@kiloclub/shared/supabase/config";
import { SetupNotice } from "@/components/setup-notice";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Kilo Club Admin", template: "%s | Kilo Club Admin" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#060607" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{isSupabaseConfigured ? children : <SetupNotice />}</body>
    </html>
  );
}
