"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Package,
  Settings,
  Tags,
  Users,
  Award,
  X,
} from "lucide-react";
import { createClient } from "@kiloclub/shared/supabase/client";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/brands", label: "Brands", icon: Award },
  { href: "/enquiries", label: "Enquiries", icon: MessageSquareText },
  { href: "/users", label: "Users", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3000";

export function Sidebar({ name, email, avatar }: { name: string; email: string; avatar: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const content = (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-2.5 px-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-sm.webp" alt="" className="h-10 w-auto" />
        <span className="leading-none">
          <span className="text-gold block font-display text-xl tracking-wider">KILO CLUB</span>
          <span className="block text-[10px] font-semibold tracking-[0.25em] text-ink-400 uppercase">Admin panel</span>
        </span>
      </Link>

      <nav className="mt-8 flex flex-col gap-1" aria-label="Admin">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive(href) ? "bg-gold text-ink-950" : "text-ink-300 hover:bg-ink-800 hover:text-white"
            }`}
          >
            <Icon className="size-4" /> {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-3 pt-6">
        <a href={STORE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-300 hover:bg-ink-800 hover:text-white">
          <ExternalLink className="size-4" /> View store
        </a>
        <div className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-900 p-3">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" referrerPolicy="no-referrer" className="size-9 rounded-full" />
          ) : (
            <span className="bg-gold grid size-9 place-items-center rounded-full text-sm font-bold text-ink-950">
              {name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{name}</p>
            <p className="truncate text-xs text-ink-400">{email}</p>
          </div>
          <button
            type="button"
            aria-label="Log out"
            title="Log out"
            className="text-ink-400 hover:text-red-400"
            onClick={async () => {
              await createClient().auth.signOut();
              router.replace("/login");
              router.refresh();
            }}
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-800 bg-ink-950/90 px-4 py-3 backdrop-blur lg:hidden">
        <button type="button" aria-label="Open menu" onClick={() => setOpen(true)} className="grid size-10 place-items-center text-ink-200">
          <Menu className="size-5" />
        </button>
        <span className="text-gold font-display text-lg tracking-wider">KILO CLUB ADMIN</span>
        <span className="size-10" />
      </div>
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-ink-800 bg-ink-900 p-4 lg:block">{content}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-ink-700 bg-ink-900 p-4">
            <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="absolute top-4 right-4 text-ink-400">
              <X className="size-5" />
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
