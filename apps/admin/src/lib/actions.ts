"use server";

import { revalidatePath } from "next/cache";
import { slugify, type Highlight, type Role } from "@kiloclub/shared";
import { requireAdmin } from "./auth";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

const text = (value: unknown, max = 500) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const optionalText = (value: unknown, max = 500) => text(value, max) || null;
const money = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
};

function friendly(error: { message: string; code?: string }): string {
  if (error.code === "23505") return "That slug is already used — pick a different one.";
  return error.message;
}

function done(id?: string): ActionResult {
  revalidatePath("/", "layout");
  return { ok: true, id };
}

// ---------- Products ----------

export interface ProductInput {
  id?: string;
  name: string;
  slug: string;
  brand_id: string | null;
  category_id: string | null;
  description: string;
  badge: string;
  is_active: boolean;
  is_featured: boolean;
  images: string[];
  highlights: Highlight[];
  variants: {
    id?: string;
    size: string;
    flavour: string;
    price: number | string;
    mrp: number | string;
    in_stock: boolean;
  }[];
}

export async function saveProduct(input: ProductInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const name = text(input.name, 200);
  const slug = slugify(text(input.slug, 200) || name);
  if (!name) return { ok: false, error: "Product name is required." };
  if (!slug) return { ok: false, error: "Slug is required." };

  const variants = (input.variants ?? [])
    .map((v, i) => ({
      id: v.id,
      size: text(v.size, 60),
      flavour: optionalText(v.flavour, 80),
      price: money(v.price),
      mrp: v.mrp === "" || v.mrp == null ? null : money(v.mrp),
      in_stock: Boolean(v.in_stock),
      sort_order: i,
    }))
    .filter((v) => v.size || v.price !== null);
  if (variants.length === 0) return { ok: false, error: "Add at least one size with a price." };
  for (const v of variants) {
    if (!v.size) return { ok: false, error: "Every variant needs a size (e.g. 1 kg)." };
    if (v.price === null) return { ok: false, error: `Enter a valid price for ${v.size}.` };
  }
  const combos = new Set(variants.map((v) => `${v.size.toLowerCase()}|${(v.flavour ?? "").toLowerCase()}`));
  if (combos.size !== variants.length) return { ok: false, error: "Two variants have the same size and flavour." };

  const row = {
    name,
    slug,
    brand_id: input.brand_id || null,
    category_id: input.category_id || null,
    description: optionalText(input.description, 5000),
    badge: optionalText(input.badge, 30),
    is_active: Boolean(input.is_active),
    is_featured: Boolean(input.is_featured),
    images: (input.images ?? []).filter((u) => typeof u === "string" && /^https?:\/\//.test(u)).slice(0, 12),
    highlights: (input.highlights ?? [])
      .map((h) => ({ label: text(h.label, 40), value: text(h.value, 40) }))
      .filter((h) => h.label && h.value)
      .slice(0, 6),
  };

  let productId = input.id;
  if (productId) {
    const { error } = await supabase.from("products").update(row).eq("id", productId);
    if (error) return { ok: false, error: friendly(error) };
  } else {
    const { data, error } = await supabase.from("products").insert(row).select("id").single();
    if (error) return { ok: false, error: friendly(error) };
    productId = data.id as string;
  }

  // Sync variants: update kept ones, insert new ones, delete removed ones.
  const { data: existing } = await supabase.from("product_variants").select("id").eq("product_id", productId);
  const keep = new Set(variants.map((v) => v.id).filter(Boolean));
  const removed = (existing ?? []).map((v) => v.id as string).filter((id) => !keep.has(id));
  if (removed.length) {
    const { error } = await supabase.from("product_variants").delete().in("id", removed);
    if (error) return { ok: false, error: error.message };
  }
  for (const { id, ...v } of variants) {
    const payload = { ...v, product_id: productId };
    const { error } = id
      ? await supabase.from("product_variants").update(payload).eq("id", id).eq("product_id", productId)
      : await supabase.from("product_variants").insert(payload);
    if (error) return { ok: false, error: error.message };
  }

  return done(productId);
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return done();
}

export async function setProductActive(id: string, isActive: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("products").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return done();
}

// ---------- Categories & brands ----------

export interface TaxonomyInput {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string | null;
  sort_order?: number | string;
}

export async function saveTaxonomy(table: "categories" | "brands", input: TaxonomyInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (table !== "categories" && table !== "brands") return { ok: false, error: "Unknown table" };
  const name = text(input.name, 100);
  const slug = slugify(text(input.slug, 100) || name);
  if (!name || !slug) return { ok: false, error: "Name is required." };

  const image = optionalText(input.image_url, 1000);
  const row: Record<string, unknown> =
    table === "categories"
      ? {
          name,
          slug,
          description: optionalText(input.description, 200),
          image_url: image,
          sort_order: Number.parseInt(String(input.sort_order ?? 0), 10) || 0,
        }
      : { name, slug, logo_url: image };

  const { data, error } = input.id
    ? await supabase.from(table).update(row).eq("id", input.id).select("id").single()
    : await supabase.from(table).insert(row).select("id").single();
  if (error) return { ok: false, error: friendly(error) };
  return done(data.id as string);
}

export async function deleteTaxonomy(table: "categories" | "brands", id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (table !== "categories" && table !== "brands") return { ok: false, error: "Unknown table" };
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return done();
}

// ---------- Enquiries, users, settings ----------

export async function deleteEnquiry(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("enquiries").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return done();
}

export async function setUserRole(userId: string, role: Role): Promise<ActionResult> {
  const { supabase, user } = await requireAdmin();
  if (role !== "admin" && role !== "customer") return { ok: false, error: "Invalid role" };
  if (userId === user.id) return { ok: false, error: "You can't change your own role." };
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { ok: false, error: error.message };
  return done();
}

export interface SettingsInput {
  whatsapp_number: string;
  product_template: string;
  cart_template: string;
  price_notice: string;
}

export async function saveSettings(input: SettingsInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const digits = text(input.whatsapp_number, 30).replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    return { ok: false, error: "Enter the WhatsApp number with country code, e.g. 919037009229." };
  }
  const productTemplate = text(input.product_template, 1000);
  const cartTemplate = text(input.cart_template, 1000);
  if (!/\{items?\}/.test(productTemplate) || !/\{items?\}/.test(cartTemplate)) {
    return { ok: false, error: "Both message templates must include {items}." };
  }
  const { error } = await supabase
    .from("site_settings")
    .update({
      whatsapp_number: digits,
      product_template: productTemplate,
      cart_template: cartTemplate,
      price_notice: text(input.price_notice, 200),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) return { ok: false, error: error.message };
  return done();
}
