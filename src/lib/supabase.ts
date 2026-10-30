/**
 * SERVER-ONLY Supabase client.
 *
 * Only imported from server code (route handlers, server components,
 * src/lib/server-store.ts). It uses the service-role key, which bypasses RLS,
 * so it must never be imported by a "use client" file and the key must never
 * carry a NEXT_PUBLIC_ prefix.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

if (typeof window !== "undefined") {
  throw new Error("src/lib/supabase.ts is server-only and must not be bundled for the browser.");
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const anonKeyPresent = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
);

export type StorageMode = "supabase" | "local-file" | "unconfigured";

/**
 * Storage selection (exactly one source of truth per environment):
 *  - "supabase"     : SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set (production / Vercel).
 *  - "local-file"   : local development only (NODE_ENV=development, or ZEEWRITES_LOCAL_DB=1
 *                     for a local `next start`). Never used on Vercel.
 *  - "unconfigured" : nothing usable. Reads return an empty list, writes fail loudly.
 */
function resolveMode(): { mode: StorageMode; problem: string | null } {
  if (supabaseUrl && serviceRoleKey) return { mode: "supabase", problem: null };

  const onVercel = Boolean(process.env.VERCEL);
  const localAllowed =
    !onVercel &&
    (process.env.NODE_ENV === "development" || process.env.ZEEWRITES_LOCAL_DB === "1");
  if (localAllowed) return { mode: "local-file", problem: null };

  if (supabaseUrl && !serviceRoleKey && anonKeyPresent) {
    return {
      mode: "unconfigured",
      problem:
        "SUPABASE_SERVICE_ROLE_KEY is missing. The anon key cannot write when RLS is enabled.",
    };
  }
  return {
    mode: "unconfigured",
    problem: "Database not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
  };
}

const resolved = resolveMode();

export const storageMode: StorageMode = resolved.mode;
export const storageProblem: string | null = resolved.problem;

export const supabaseAdmin: SupabaseClient | null =
  storageMode === "supabase"
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: {
          // Never let Next.js cache database reads.
          fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
        },
      })
    : null;
