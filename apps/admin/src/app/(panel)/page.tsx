import Link from "next/link";
import { ArrowRight, MessageSquareText, Package, Plus, Tags, Users } from "lucide-react";
import { describeItem, formatINR, type Enquiry } from "@kiloclub/shared";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { supabase, profile } = await requireAdmin();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [products, activeProducts, categories, customers, weekEnquiries, recent] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("enquiries").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("enquiries").select("*").order("created_at", { ascending: false }).limit(300),
  ]);

  const enquiries = (recent.data as Enquiry[] | null) ?? [];
  const tally = new Map<string, { name: string; count: number }>();
  for (const e of enquiries) {
    for (const item of e.items) {
      const key = item.product_id;
      const entry = tally.get(key) ?? { name: item.name, count: 0 };
      entry.count += item.qty || 1;
      tally.set(key, entry);
    }
  }
  const top = [...tally.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  const topMax = top[0]?.count ?? 1;

  const stats = [
    { label: "Products", value: products.count ?? 0, sub: `${activeProducts.count ?? 0} live on store`, icon: Package, href: "/products" },
    { label: "Categories", value: categories.count ?? 0, sub: "Shop sections", icon: Tags, href: "/categories" },
    { label: "Enquiries", value: weekEnquiries.count ?? 0, sub: "Last 7 days", icon: MessageSquareText, href: "/enquiries" },
    { label: "Accounts", value: customers.count ?? 0, sub: "Signed-up users", icon: Users, href: "/users" },
  ];

  return (
    <>
      <PageHeader
        title={`Hey, ${(profile.full_name || "Admin").split(" ")[0]}`}
        description="Here's what's happening at Kilo Club."
        action={
          <Link href="/products/new" className="btn-gold">
            <Plus className="size-4" /> Add product
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, href }) => (
          <Link key={label} href={href} className="card group p-5 transition hover:border-gold-500/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink-400">{label}</p>
              <Icon className="size-4 text-gold-400" />
            </div>
            <p className="mt-3 text-3xl font-bold text-white tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-ink-500">{sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent enquiries</h2>
            <Link href="/enquiries" className="flex items-center gap-1 text-xs text-ink-400 hover:text-gold-300">
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
          {enquiries.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-500">No enquiries yet. They&apos;ll appear here when customers tap Enquire.</p>
          ) : (
            <ul className="divide-y divide-ink-700">
              {enquiries.slice(0, 6).map((e) => {
                const total = e.items.reduce((sum, i) => sum + (i.price ?? 0) * (i.qty || 1), 0);
                return (
                  <li key={e.id} className="flex items-start justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-white">
                        {e.items.length === 1 ? describeItem(e.items[0]) : `${e.items.length} products — ${e.items.map((i) => i.name).join(", ")}`}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-500">
                        {e.customer_name || e.customer_email || "Guest"} · {formatDateTime(e.created_at)}
                      </p>
                    </div>
                    {total > 0 && <p className="shrink-0 text-sm font-semibold text-gold-300">{formatINR(total)}</p>}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <h2 className="mb-4 font-semibold text-white">Most enquired products</h2>
          {top.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-500">Nothing yet.</p>
          ) : (
            <ul className="space-y-4">
              {top.map((t) => (
                <li key={t.name}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="truncate text-ink-200">{t.name}</span>
                    <span className="shrink-0 text-ink-400 tabular-nums">{t.count}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-ink-800">
                    <div className="bg-gold h-full rounded-full" style={{ width: `${(t.count / topMax) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
