"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@kiloclub/shared/supabase/client";
import { useAuth } from "./auth";
import { useToast } from "./toast";

interface WishlistContextValue {
  ids: Set<string>;
  toggle: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue>({ ids: new Set(), toggle: () => {} });

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();

  useEffect(() => {
    if (!user) {
      setIds(new Set());
      return;
    }
    createClient()
      .from("wishlist_items")
      .select("product_id")
      .then(({ data }) => setIds(new Set((data ?? []).map((row) => row.product_id as string))));
  }, [user]);

  const toggle = useCallback(
    async (productId: string) => {
      if (!user) {
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      const supabase = createClient();
      const has = ids.has(productId);
      setIds((current) => {
        const next = new Set(current);
        if (has) next.delete(productId);
        else next.add(productId);
        return next;
      });
      const { error } = has
        ? await supabase.from("wishlist_items").delete().eq("user_id", user.id).eq("product_id", productId)
        : await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: productId });
      if (error) {
        toast("Couldn't update wishlist");
        setIds((current) => {
          const next = new Set(current);
          if (has) next.add(productId);
          else next.delete(productId);
          return next;
        });
      } else {
        toast(has ? "Removed from wishlist" : "Saved to wishlist");
      }
    },
    [user, ids, router, pathname, toast],
  );

  return <WishlistContext value={{ ids, toggle }}>{children}</WishlistContext>;
}

export function useWishlist() {
  return useContext(WishlistContext);
}
