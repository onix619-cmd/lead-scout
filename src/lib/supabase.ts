import { createClient } from "@supabase/supabase-js";

// Storage is optional for this phase. If the env vars aren't set, the app
// still works — results just won't be saved between searches.
export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}
