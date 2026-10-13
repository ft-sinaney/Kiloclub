export type Role = "customer" | "admin";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export interface Highlight {
  label: string;
  value: string;
}

export interface Variant {
  id: string;
  product_id: string;
  size: string;
  flavour: string | null;
  price: number;
  mrp: number | null;
  in_stock: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand_id: string | null;
  category_id: string | null;
  description: string | null;
  highlights: Highlight[];
  images: string[];
  badge: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  brand: Brand | null;
  category: Category | null;
  variants: Variant[];
}

export interface SiteSettings {
  whatsapp_number: string;
  product_template: string;
  cart_template: string;
  price_notice: string;
}

/** One line of an enquiry — a snapshot, so it survives product edits. */
export interface EnquiryItem {
  product_id: string;
  variant_id?: string;
  name: string;
  brand?: string | null;
  size: string;
  flavour?: string | null;
  price?: number;
  qty: number;
}

export interface Enquiry {
  id: string;
  user_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  items: EnquiryItem[];
  message: string;
  source: "product" | "cart";
  created_at: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  whatsapp_number: "919037009229",
  product_template: "Heyy, I'm looking to buy {items}. Is the product available for sale?",
  cart_template: "Heyy, I want to buy:\n{items}\nAre they available?",
  price_notice: "Prices may vary, so please enquire to confirm!",
};

/** Columns to select for a product with its relations. */
export const PRODUCT_SELECT =
  "*, brand:brands(*), category:categories(*), variants:product_variants(*)";
