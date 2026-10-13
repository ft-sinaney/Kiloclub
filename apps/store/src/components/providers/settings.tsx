"use client";

import { createContext, useContext } from "react";
import { DEFAULT_SETTINGS, type SiteSettings } from "@kiloclub/shared";

const SettingsContext = createContext<{ settings: SiteSettings; isDemo: boolean }>({
  settings: DEFAULT_SETTINGS,
  isDemo: false,
});

export function SettingsProvider({
  settings,
  isDemo,
  children,
}: {
  settings: SiteSettings;
  isDemo: boolean;
  children: React.ReactNode;
}) {
  return <SettingsContext value={{ settings, isDemo }}>{children}</SettingsContext>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
