import type { NextRequest } from "next/server";
import { redirectWithCookies, updateSession } from "@kiloclub/shared/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { response, userId } = await updateSession(request);

  // The account page needs a signed-in user.
  if (!userId && request.nextUrl.pathname.startsWith("/account")) {
    return redirectWithCookies(request, response, "/login", { next: request.nextUrl.pathname });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
