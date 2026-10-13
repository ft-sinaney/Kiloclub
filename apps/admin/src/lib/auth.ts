import { cache } from "react";
import { redirect } from "next/navigation";
import type { Profile } from "@kiloclub/shared";
import { createClient } from "@kiloclub/shared/supabase/server";

/** Returns the signed-in admin, or redirects. Every admin page and action calls this. */
export const requireAdmin = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
  if (!profile || profile.role !== "admin") redirect("/no-access");
  return { supabase, user: data.user, profile: profile as Profile };
});
