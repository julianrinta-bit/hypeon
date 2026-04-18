// src/lib/promo-codes.ts
//
// Promo code validation for the YouTube Analyzer.
//
// Fast path: checks the local valid_promo_codes table in the Analyzer DB.
// This table is populated by the promo-code-sync job running inside Units'
// sync-inbox cron (every minute on Vercel).
//
// Grace-period fallback: if the code isn't in the local cache (e.g. the
// cron hasn't run yet after a new code is added), we check the Units DB
// directly via a service-role client. This ensures newly-added codes work
// immediately without waiting for the next cron cycle.
//
// Returns the normalized (uppercased, trimmed) code string if valid,
// or undefined if the code is invalid, inactive, or expired.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ── Types ────────────────────────────────────────────────────────────────────

interface ValidPromoCode {
  code: string
  is_active: boolean
  valid_from: string | null
  valid_until: string | null
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function isWithinValidWindow(row: ValidPromoCode): boolean {
  const now = new Date()
  if (row.valid_from && new Date(row.valid_from) > now) return false
  if (row.valid_until && new Date(row.valid_until) < now) return false
  return true
}

function createUnitsClient(): SupabaseClient | null {
  const url = process.env.UNITS_SUPABASE_URL
  const key = process.env.UNITS_SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) return null

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ── Main export ──────────────────────────────────────────────────────────────

/**
 * Validates a promo code against the local cache, falling back to Units DB.
 *
 * @param code      Raw promo code string from form input
 * @param supabase  Analyzer Supabase client (caller provides — already initialized)
 * @returns         Normalized code string if valid, undefined otherwise
 */
export async function validatePromoCode(
  code: string,
  supabase: SupabaseClient,
): Promise<string | undefined> {
  if (!code) return undefined

  const normalized = code.toUpperCase().trim()
  if (!normalized) return undefined

  // ── Fast path: check local valid_promo_codes cache ──────────────────────

  const { data: localRow, error: localError } = await supabase
    .from('valid_promo_codes')
    .select('code, is_active, valid_from, valid_until')
    .eq('code', normalized)
    .maybeSingle()

  if (localError) {
    console.warn('[validatePromoCode] Local cache lookup error:', localError.message)
  }

  if (localRow) {
    if (!localRow.is_active) return undefined
    if (!isWithinValidWindow(localRow)) return undefined
    return localRow.code
  }

  // ── Grace-period fallback: check Units DB directly ───────────────────────
  // Handles the case where a new code was added to Units but the cron
  // hasn't run yet to sync it down to the local cache.

  try {
    const unitsClient = createUnitsClient()
    if (!unitsClient) {
      console.warn('[validatePromoCode] Units fallback unavailable: missing env vars')
      return undefined
    }

    const tenantId = process.env.UNITS_TENANT_ID_HYPEON
    if (!tenantId) {
      console.warn('[validatePromoCode] Units fallback unavailable: missing UNITS_TENANT_ID_HYPEON')
      return undefined
    }

    const { data: unitsRow, error: unitsError } = await unitsClient
      .from('promo_codes')
      .select('code, is_active, valid_from, valid_until')
      .eq('tenant_id', tenantId)
      .eq('code', normalized)
      .eq('is_active', true)
      .maybeSingle()

    if (unitsError) {
      console.warn('[validatePromoCode] Units fallback error:', unitsError.message)
      return undefined
    }

    if (!unitsRow) return undefined
    if (!isWithinValidWindow(unitsRow)) return undefined

    return unitsRow.code
  } catch (err) {
    console.warn('[validatePromoCode] Units fallback exception:', err instanceof Error ? err.message : String(err))
    return undefined
  }
}
