import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, MessageSquareText } from "lucide-react";
import { PRODUCT_SELECT, describeItem, type Enquiry, type Product } from "@kiloclub/shared";
import { isSupabaseConfigured } from "@kiloclub/shared/supabase/config";
import { createClient } from "@kiloclub/shared/supabase/server";
import { ProductCard } from "@/components/product-card";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata: Metadata = { title: "My account" };

const dateFormat = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

export default async function AccountPage() {
  if (!isSupabaseConfigured) redirect("/login");
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) redirect("/login?next=/account");

  const [{ data: profile }, { data: enquiries }, { data: wishlist }] = await Promise.all([
    supabase.from("profiles").select("full_name, email, role").eq("id", user.id).maybeSingle(),
    supabase.from("enquiries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("wishlist_items").select(`product:products(${PRODUCT_SELECT})`).eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const saved = (wishlist ?? [])
    .map((row) => (row as unknown as { product: Product | null }).product)
    .filter((p): p is Product => Boolean(p))
    .map((p) => ({ ...p, variants: p.variants.map((v) => ({ ...v, price: Number(v.price), mrp: v.mrp == null ? null : Number(v.mrp) })) }));
  const name = profile?.full_name || (user.user_metadata?.full_name as string) || user.email;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="card flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] text-gold-400 uppercase">My account</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Hey, {name}</h1>
          <p className="text-sm text-ink-400">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Heart className="size-5 text-gold-400" /> Wishlist
        </h2>
        {saved.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {saved.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink-400">
            Nothing saved yet. Tap the heart on any product to save it. <Link href="/shop" className="text-gold-300 hover:underline">Browse</Link>
          </p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <MessageSquareText className="size-5 text-gold-400" /> My enquiries
        </h2>
        {(enquiries as Enquiry[] | null)?.length ? (
          <ul className="mt-4 space-y-3">
            {(enquiries as Enquiry[]).map((e) => (
              <li key={e.id} className="card p-4">
                <p className="text-xs text-ink-500">{dateFormat.format(new Date(e.created_at))}</p>
                <ul className="mt-2 space-y-1 text-sm text-ink-200">
                  {e.items.map((item, i) => <li key={i}>• {describeItem(item)}</li>)}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ink-400">Enquiries you send on WhatsApp while logged in will show up here.</p>
        )}
      </section>
    </div>
  );
}
