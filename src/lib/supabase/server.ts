import "server-only";

import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
    throw new Error("Supabase is not configured.");
  }

  return { url, anonKey };
}

/**
 * A server-only client for public reads. It deliberately uses the anonymous
 * key: this project does not use a service-role key or expose one to clients.
 */
export async function createServerClient() {
  const { url, anonKey } = getPublicSupabaseConfig();
  const cookieStore = await cookies();

  return createSupabaseServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot write response cookies. src/proxy.ts
          // refreshes sessions and writes cookies before pages render.
        }
      },
    },
  });
}
