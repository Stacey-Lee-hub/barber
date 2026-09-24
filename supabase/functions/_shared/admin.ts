import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2'

// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically into every
// deployed Edge Function. The service-role key never leaves the server.
export function createAdminClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

/** PostgREST `not in` filter value for statuses that free up a slot. */
export const RELEASED_STATUS_FILTER = '("cancelled")'
