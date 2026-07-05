import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// This client uses the SERVICE ROLE key, which has full access to the
// database and bypasses Row Level Security. That's intentional here: the
// app keeps its own cookie-based session (lib/auth.ts) and every query in
// lib/db.ts is already scoped by professional_id, so Postgres RLS is not the
// enforcement layer for this app. NEVER import this file from a client
// component, and NEVER send this key to the browser.
//
// Typed as SupabaseClient<any> (rather than generating a full Database
// type from the schema) to keep this MVP simple — table/column names are
// still checked at the SQL level in supabase/schema.sql.
// ---------------------------------------------------------------------------

let cachedClient: SupabaseClient<any> | null = null;

export function getSupabaseAdmin(): SupabaseClient<any> {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar configurados nas variáveis de ambiente."
    );
  }

  cachedClient = createClient<any>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}
