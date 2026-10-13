import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeader({ title, href, linkLabel = "View all" }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="section-title">{title}</h2>
      {href && (
        <Link href={href} className="flex shrink-0 items-center gap-1 text-sm font-medium text-ink-300 hover:text-gold-300">
          {linkLabel} <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
