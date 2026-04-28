import { createBrowserClient } from "@supabase/ssr";

const globalForSupabase = globalThis as unknown as {
  supabaseClient: ReturnType<typeof createBrowserClient> | undefined;
};

export function createClient() {
  if (globalForSupabase.supabaseClient) {
    return globalForSupabase.supabaseClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  globalForSupabase.supabaseClient = createBrowserClient(url, key);
  return globalForSupabase.supabaseClient;
}
