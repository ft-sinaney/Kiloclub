import type { Metadata, Viewport } from "next";
import "@fontsource/anton/400.css";
import "@fontsource-variable/inter";
import "./globals.css";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MobileNav } from "@/components/mobile-nav";
import { Providers } from "@/components/providers";
import { getCategories, getSettings, isDemoMode } from "@/lib/catalog";

// Always render with fresh data so admin edits show up immediately.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Kilo Club — Fight for Fitness | Premium Supplements",
    template: "%s | Kilo Club",
  },
  description:
    "Shop genuine whey protein, creatine, pre-workout, BCAAs and vitamins at Kilo Club. Enquire on WhatsApp to confirm price and availability.",
};

export const viewport: Viewport = {
  themeColor: "#060607",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col pb-16 md:pb-0">
        <Providers settings={settings} isDemo={isDemoMode}>
          <AnnouncementBar text={settings.price_notice} />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} categories={categories} />
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}
