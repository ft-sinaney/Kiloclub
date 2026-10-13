import { Sidebar } from "@/components/sidebar";
import { requireAdmin } from "@/lib/auth";

export default async function PanelLayout({ children }: LayoutProps<"/">) {
  const { user, profile } = await requireAdmin();
  return (
    <>
      <Sidebar
        name={profile.full_name || user.email || "Admin"}
        email={user.email ?? ""}
        avatar={profile.avatar_url ?? (user.user_metadata?.avatar_url as string | undefined) ?? null}
      />
      <main className="px-4 py-6 sm:px-8 sm:py-8 lg:ml-64">{children}</main>
    </>
  );
}
