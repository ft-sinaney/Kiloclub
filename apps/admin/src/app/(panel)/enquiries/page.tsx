import type { Enquiry } from "@kiloclub/shared";
import { EnquiriesList } from "@/components/enquiries-list";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Enquiries" };

export default async function EnquiriesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("enquiries").select("*").order("created_at", { ascending: false }).limit(200);
  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Logged when a customer taps Enquire. The conversation itself happens on WhatsApp — a customer may open WhatsApp and not send."
      />
      <EnquiriesList enquiries={(data as Enquiry[]) ?? []} />
    </>
  );
}
