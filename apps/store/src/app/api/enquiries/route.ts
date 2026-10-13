import { NextResponse } from "next/server";
import type { EnquiryItem } from "@kiloclub/shared";
import { isSupabaseConfigured } from "@kiloclub/shared/supabase/config";
import { createClient } from "@kiloclub/shared/supabase/server";

const str = (value: unknown, max = 200) => (typeof value === "string" ? value.slice(0, max) : undefined);

function sanitizeItems(raw: unknown): EnquiryItem[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 50) return null;
  const items: EnquiryItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") return null;
    const e = entry as Record<string, unknown>;
    const name = str(e.name);
    const size = str(e.size, 60);
    const productId = str(e.product_id, 80);
    if (!name || !size || !productId) return null;
    items.push({
      product_id: productId,
      variant_id: str(e.variant_id, 80),
      name,
      brand: str(e.brand, 100) ?? null,
      size,
      flavour: str(e.flavour, 80) ?? null,
      price: typeof e.price === "number" && Number.isFinite(e.price) ? e.price : undefined,
      qty: typeof e.qty === "number" && e.qty >= 1 && e.qty <= 99 ? Math.floor(e.qty) : 1,
    });
  }
  return items;
}

/** Logs a WhatsApp enquiry so it shows up in the admin panel. */
export async function POST(request: Request) {
  if (!isSupabaseConfigured) return NextResponse.json({ ok: true, demo: true });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const items = sanitizeItems(body.items);
  const message = str(body.message, 4000);
  if (!items || !message) return NextResponse.json({ error: "Invalid enquiry" }, { status: 400 });

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  // No .select() afterwards: guests may insert but not read enquiries back.
  const { error } = await supabase.from("enquiries").insert({
    user_id: user?.id ?? null,
    customer_name: (user?.user_metadata?.full_name as string) || (user?.user_metadata?.name as string) || null,
    customer_email: user?.email ?? null,
    items,
    message,
    source: body.source === "cart" ? "cart" : "product",
  });

  if (error) {
    console.error("Failed to log enquiry", error.message);
    return NextResponse.json({ error: "Could not save enquiry" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
