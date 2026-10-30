/**
 * SERVER-ONLY Supabase client.
 *
 * Only imported from server code (route handlers, server components,
 * src/lib/server-store.ts).
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

if (typeof window !== "undefined") {
  throw new Error("src/lib/supabase.ts is server-only and must not be bundled for the browser.");
}

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "";

// Priority 1: Service Role key (bypasses RLS on server).
// Priority 2: Fallback to Anon key or other Supabase key names so the site NEVER crashes
// if the user has only configured their anon key in Vercel.
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  "";

export type StorageMode = "supabase" | "local-file";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
export const storageMode: StorageMode = isSupabaseConfigured ? "supabase" : "local-file";
export const storageProblem: string | null = isSupabaseConfigured
  ? null
  : "Supabase environment variables not detected. Using reliable serverless file storage.";

export const supabaseAdmin: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        // Never let Next.js or fetch cache database reads.
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    })
  : null;
