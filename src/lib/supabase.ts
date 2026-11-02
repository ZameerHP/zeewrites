/**
 * SERVER-ONLY Supabase client.
 *
 * Only imported from server code (route handlers, server components,
 * src/lib/server-store.ts). Never bundled for the browser.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

if (typeof window !== "undefined") {
  throw new Error(
    "src/lib/supabase.ts is server-only and must not be bundled for the browser."
  );
}

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "";

// Server-only Service Role key (bypasses RLS for verified server-side admin mutations).
// Never read service role keys from NEXT_PUBLIC_ or VITE_ variables.
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  "";

const anonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  "";

const supabaseKey = serviceRoleKey || anonKey;

export type StorageMode = "supabase" | "local-file";

export const hasServiceRoleKey = Boolean(serviceRoleKey);
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
export const storageMode: StorageMode = isSupabaseConfigured
  ? "supabase"
  : "local-file";
export const storageProblem: string | null = !isSupabaseConfigured
  ? "Supabase environment variables not detected. Using local development file storage."
  : !hasServiceRoleKey
  ? "SUPABASE_SERVICE_ROLE_KEY is not set; using anon key (RLS may block writes unless service role key is configured)."
  : null;

export const supabaseAdmin: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        // Never let Next.js or fetch cache database reads.
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    })
  : null;
