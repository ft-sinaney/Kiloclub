"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, User } from "lucide-react";
import { useAuth } from "./providers/auth";
import { useCart } from "./providers/cart";

export function MobileNav() {
  const pathname = usePathname();
  const { count } = useCart();
  const { user } = useAuth();
  const items = [
    { href: "/", label: "Home", icon: Home, active: pathname === "/" },
    { href: "/shop", label: "Shop", icon: LayoutGrid, active: pathname.startsWith("/shop") || pathname.startsWith("/product") },
    { href: "/cart", label: "Cart", icon: ShoppingBag, active: pathname === "/cart", badge: count },
    { href: user ? "/account" : "/login", label: user ? "Account" : "Log in", icon: User, active: pathname === "/account" || pathname === "/login" },
  ];
  return (
    <nav
      aria-label="Bottom"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-800 bg-ink-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="grid grid-cols-4">
        {items.map(({ href, label, icon: Icon, active, badge }) => (
          <Link key={label} href={href} className={`relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${active ? "text-gold-300" : "text-ink-400"}`}>
            <Icon className="size-5" />
            {label}
            {badge ? (
              <span className="bg-gold absolute top-1.5 left-1/2 ml-2 grid min-w-[16px] place-items-center rounded-full px-1 text-[9px] leading-4 font-bold text-ink-950">
                {badge}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </nav>
  );
}
