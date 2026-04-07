import { createClient } from "@supabase/supabase-js";

import { getEnv } from "@/lib/env";

let supabaseAdminClient: ReturnType<typeof createClient<any>> | null = null;

export function getSupabaseAdminClient() {
  if (supabaseAdminClient) {
    return supabaseAdminClient;
  }

  const env = getEnv();

  supabaseAdminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return supabaseAdminClient;
}
