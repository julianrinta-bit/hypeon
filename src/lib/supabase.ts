import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

/**
 * Typed Supabase admin client (service role — bypasses RLS).
 * Lazy singleton pattern: avoids top-level createClient() which fails during
 * Vercel static analysis when env vars are not yet available at module evaluation time.
 */
let _supabase: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdmin() {
  if (!_supabase) {
    _supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }
  return _supabase
}
