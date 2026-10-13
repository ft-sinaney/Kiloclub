"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "./config";

let browserClient: SupabaseClient | undefined;

/** Supabase client for Client Components. Uses the signed-in user's session. */
export function createClient(): SupabaseClient {
  browserClient ??= createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  return browserClient;
}
