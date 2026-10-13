"use client";

import type { SiteSettings } from "@kiloclub/shared";
import { AuthProvider } from "./auth";
import { CartProvider } from "./cart";
import { SettingsProvider } from "./settings";
import { ToastProvider } from "./toast";
import { WishlistProvider } from "./wishlist";

export function Providers({
  settings,
  isDemo,
  children,
}: {
  settings: SiteSettings;
  isDemo: boolean;
  children: React.ReactNode;
}) {
  return (
    <SettingsProvider settings={settings} isDemo={isDemo}>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>{children}</CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </SettingsProvider>
  );
}
