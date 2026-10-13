"use client";

import { Info } from "lucide-react";
import { useSettings } from "./providers/settings";

export function PriceNotice({ className = "" }: { className?: string }) {
  const { settings } = useSettings();
  if (!settings.price_notice) return null;
  return (
    <p className={`flex items-start gap-2 text-xs text-gold-300/90 ${className}`}>
      <Info className="mt-px size-3.5 shrink-0" />
      <span>{settings.price_notice}</span>
    </p>
  );
}
