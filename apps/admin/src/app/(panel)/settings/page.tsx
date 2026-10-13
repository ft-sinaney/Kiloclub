import { DEFAULT_SETTINGS, type SiteSettings } from "@kiloclub/shared";
import { PageHeader } from "@/components/page-header";
import { SettingsForm } from "@/components/settings-form";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("site_settings")
    .select("whatsapp_number, product_template, cart_template, price_notice")
    .eq("id", 1)
    .maybeSingle();
  return (
    <>
      <PageHeader title="Settings" description="WhatsApp number, enquiry messages and the price notice." />
      <SettingsForm settings={{ ...DEFAULT_SETTINGS, ...((data as SiteSettings | null) ?? {}) }} />
    </>
  );
}
