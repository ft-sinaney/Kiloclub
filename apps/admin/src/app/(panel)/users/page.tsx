import type { Profile } from "@kiloclub/shared";
import { PageHeader } from "@/components/page-header";
import { UsersTable } from "@/components/users-table";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Users" };

export default async function UsersPage() {
  const { supabase, user } = await requireAdmin();
  const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  return (
    <>
      <PageHeader title="Users" description="Everyone who has signed up on the store. Only admins can open this panel." />
      <UsersTable users={(data as Profile[]) ?? []} currentUserId={user.id} />
    </>
  );
}
