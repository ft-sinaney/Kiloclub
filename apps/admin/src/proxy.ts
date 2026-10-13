import type { NextRequest } from "next/server";
import { redirectWithCookies, updateSession } from "@kiloclub/shared/supabase/proxy";

const PUBLIC_PATHS = ["/login", "/auth", "/no-access"];

export async function proxy(request: NextRequest) {
  const { response, userId, supabase } = await updateSession(request);
  if (!supabase) return response; // Supabase not configured — the layout shows setup steps.

  const path = request.nextUrl.pathname;
  if (PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`))) return response;

  if (!userId) return redirectWithCookies(request, response, "/login", { next: path });

  // Only admins get past this point. (The database enforces this too, via row level security.)
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (profile?.role !== "admin") return redirectWithCookies(request, response, "/no-access");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
