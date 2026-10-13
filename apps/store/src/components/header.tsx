"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Logo } from "./logo";
import { useAuth } from "./providers/auth";
import { useCart } from "./providers/cart";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=proteins", label: "Proteins" },
  { href: "/shop?offers=1", label: "Offers" },
  { href: "/about", label: "About" },
];

function SearchBox({ autoFocus = false, onDone }: { autoFocus?: boolean; onDone?: () => void }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  return (
    <form
      role="search"
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop");
        onDone?.();
      }}
    >
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search supplements…"
        aria-label="Search supplements"
        autoFocus={autoFocus}
        className="input rounded-full py-2 pl-9"
      />
    </form>
  );
}

export function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href.split("?")[0] && !href.includes("?"));

  return (
    <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:h-[72px] sm:px-6 lg:gap-8">
        <button
          type="button"
          className="-ml-1 grid size-10 place-items-center rounded-lg text-ink-200 md:hidden"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="size-5" />
        </button>

        <Logo />

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative py-1 text-sm font-medium transition hover:text-gold-300 ${
                isActive(link.href) ? "text-gold-300" : "text-ink-300"
              }`}
            >
              {link.label}
              {isActive(link.href) && <span className="bg-gold absolute inset-x-0 -bottom-1 h-0.5 rounded-full" />}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden w-full max-w-xs lg:block">
          <Suspense>
            <SearchBox />
          </Suspense>
        </div>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <button
            type="button"
            className="grid size-10 place-items-center rounded-lg text-ink-200 hover:text-gold-300 lg:hidden"
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="size-5" />
          </button>
          <Link
            href={user ? "/account" : "/login"}
            className="hidden size-10 place-items-center rounded-lg text-ink-200 hover:text-gold-300 md:grid"
            aria-label={user ? "My account" : "Log in"}
          >
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="" className="size-7 rounded-full border border-gold-500/60" referrerPolicy="no-referrer" />
            ) : (
              <User className="size-5" />
            )}
          </Link>
          <Link href="/cart" className="relative grid size-10 place-items-center rounded-lg text-ink-200 hover:text-gold-300" aria-label={`Cart, ${count} items`}>
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="bg-gold absolute top-0.5 right-0.5 grid min-w-[18px] place-items-center rounded-full px-1 text-[10px] leading-[18px] font-bold text-ink-950">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-ink-800 px-4 py-3 lg:hidden">
          <Suspense>
            <SearchBox autoFocus onDone={() => setSearchOpen(false)} />
          </Suspense>
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col gap-6 border-r border-ink-700 bg-ink-900 p-5">
            <div className="flex items-center justify-between">
              <Logo />
              <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="grid size-9 place-items-center text-ink-300">
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex flex-col" aria-label="Mobile">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="border-b border-ink-800 py-3.5 text-base font-medium text-ink-200 hover:text-gold-300">
                  {link.label}
                </Link>
              ))}
              <Link href={user ? "/account" : "/login"} className="py-3.5 text-base font-medium text-gold-300">
                {user ? "My account" : "Log in / Sign up"}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
