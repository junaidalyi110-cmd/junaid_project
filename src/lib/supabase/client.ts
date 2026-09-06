"use client";

import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

import type { Database } from "../../types";

function getPublicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !url ||
    !anonKey ||
    url === "YOUR_SUPABASE_URL" ||
    anonKey === "YOUR_SUPABASE_ANON_KEY"
  ) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    );
  }

  return { url, anonKey };
}

export function createBrowserClient() {
  const { url, anonKey } = getPublicSupabaseConfig();
  return createSupabaseBrowserClient<Database>(url, anonKey);
}
