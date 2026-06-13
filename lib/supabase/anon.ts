import { createClient } from "@supabase/supabase-js";

// Plain anon client — no SSR cookie context, for unauthenticated server-side operations.
export function createAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
