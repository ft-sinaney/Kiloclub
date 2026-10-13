import { Info } from "lucide-react";

export function AnnouncementBar({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="bg-gold px-4 py-1.5 text-center text-[11px] font-semibold tracking-wide text-ink-950 sm:text-xs">
      <Info className="mr-1.5 -mt-0.5 inline size-3.5" />
      {text}
    </div>
  );
}
