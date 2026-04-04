/**
 * ads-cron.mjs
 *
 * Periodic monitoring script for Meta Ads performance.
 * Runs every 4 hours via PM2 cron:
 *
 *   {
 *     name: 'ads-cron',
 *     script: 'scripts/ads-cron.mjs',
 *     cron_restart: '0 *\/4 * * *',
 *     watch: false,
 *     autorestart: false,
 *   }
 *
 * Env vars required:
 *   META_ACCESS_TOKEN
 *   (Optional) SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY — for snapshot persistence
 *
 * Future: save snapshots to ad_performance_snapshots and log decisions to ad_decisions.
 */

import 'dotenv/config'; // load .env.local / .env in dev

// ── Constants ──────────────────────────────────────────────────────────────

const AD_ACCOUNT_ID = 'act_465018329259806';
const CAMPAIGN_ID   = '120241484421670480';
const META_API_BASE = 'https://graph.facebook.com/v21.0';
const KRW_TO_USD    = 1370;

// Thresholds for auto-action
const CTR_AUTO_PAUSE_THRESHOLD    = 0.5;  // below this after 2000 impressions → auto-pause
const CTR_AUTO_PAUSE_MIN_IMPR     = 2000;
const CTR_WARN_THRESHOLD          = 0.8;  // warn but don't auto-act
const CTR_GREAT_THRESHOLD         = 2.5;
const CPC_WARN_MULTIPLIER         = 2.0;  // warn if CPC > 2× average

// ── Logging ───────────────────────────────────────────────────────────────

function log(level, msg, data) {
  const ts = new Date().toISOString();
  const prefix = { INFO: '[ INFO ]', WARN: '[ WARN ]', ERROR: '[ERROR ]', ACTION: '[ACTION]' }[level] ?? '[DEBUG]';
  if (data !== undefined) {
    console.log(`${ts} ${prefix} ${msg}`, data);
  } else {
    console.log(`${ts} ${prefix} ${msg}`);
  }
}

// ── Meta API helpers ──────────────────────────────────────────────────────

function getToken() {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error('META_ACCESS_TOKEN is not set');
  return token;
}

async function metaGet(path, params) {
  const token = getToken();
  const url = new URL(`${META_API_BASE}/${path}`);
  url.searchParams.set('access_token', token);
  for (const [k, v] of Object.entries(params ?? {})) {
    url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  }
  const res = await fetch(url.toString());
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message ?? `Meta API HTTP ${res.status}`);
  }
  return json;
}

async function metaPost(path, body) {
  const token = getToken();
  const res = await fetch(`${META_API_BASE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, access_token: token }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message ?? `Meta API HTTP ${res.status}`);
  }
  return json;
}

// ── Fetch current insights ────────────────────────────────────────────────

async function fetchInsights(datePreset = 'today') {
  log('INFO', `Fetching insights for date_preset=${datePreset}`);

  const data = await metaGet(`${AD_ACCOUNT_ID}/insights`, {
    level: 'ad',
    fields: 'ad_id,ad_name,adset_id,adset_name,spend,impressions,clicks,ctr,cpc,actions',
    date_preset: datePreset,
    filtering: [{ field: 'campaign.id', operator: 'EQUAL', value: CAMPAIGN_ID }],
  });

  const rows = (data.data ?? []).map(r => ({
    ad_id:       r.ad_id,
    ad_name:     r.ad_name,
    adset_id:    r.adset_id,
    adset_name:  r.adset_name,
    spend:       parseFloat(r.spend) || 0,
    impressions: parseInt(r.impressions, 10) || 0,
    clicks:      parseInt(r.clicks, 10) || 0,
    ctr:         parseFloat(r.ctr) || 0,
    cpc:         parseFloat(r.cpc) || 0,
    conversions: extractConversions(r.actions),
    fetched_at:  new Date().toISOString(),
  }));

  log('INFO', `Fetched ${rows.length} ad row(s)`);
  return rows;
}

function extractConversions(actions) {
  if (!actions?.length) return 0;
  const purchaseTypes = ['offsite_conversion.fb_pixel_purchase', 'omni_purchase', 'purchase'];
  for (const a of actions) {
    if (purchaseTypes.some(t => a.action_type === t)) return parseInt(a.value, 10) || 0;
  }
  return 0;
}

// ── Fetch current ad statuses ─────────────────────────────────────────────

async function fetchAdStatuses() {
  log('INFO', 'Fetching ad statuses');
  const data = await metaGet(`${CAMPAIGN_ID}/ads`, {
    fields: 'id,name,status,effective_status',
  });
  return (data.data ?? []).map(a => ({
    id:               a.id,
    name:             a.name,
    status:           a.status,
    effective_status: a.effective_status,
  }));
}

// ── Rule engine ───────────────────────────────────────────────────────────

function runRules(insights, statuses) {
  const decisions = [];

  if (insights.length === 0) {
    log('INFO', 'No insight data — skipping rule engine');
    return decisions;
  }

  const avgCPC = insights.reduce((s, a) => s + a.cpc, 0) / insights.length;

  const statusMap = Object.fromEntries(statuses.map(s => [s.id, s.effective_status ?? s.status]));

  for (const ad of insights) {
    const effectiveStatus = statusMap[ad.ad_id] ?? 'UNKNOWN';
    const isActive = effectiveStatus.toUpperCase() === 'ACTIVE';

    // Auto-pause: CTR below 0.5% after 2000+ impressions
    if (isActive && ad.impressions >= CTR_AUTO_PAUSE_MIN_IMPR && ad.ctr < CTR_AUTO_PAUSE_THRESHOLD) {
      decisions.push({
        type: 'AUTO_PAUSE',
        reason: `CTR ${ad.ctr.toFixed(2)}% below ${CTR_AUTO_PAUSE_THRESHOLD}% after ${ad.impressions.toLocaleString()} impressions`,
        ad_id: ad.ad_id,
        ad_name: ad.ad_name,
        auto_approved: true,
      });
    }

    // Warn: CTR below 0.8% (but above auto-pause threshold)
    else if (isActive && ad.impressions >= 1000 && ad.ctr < CTR_WARN_THRESHOLD) {
      decisions.push({
        type: 'WARN_CTR_LOW',
        reason: `CTR ${ad.ctr.toFixed(2)}% below warning threshold ${CTR_WARN_THRESHOLD}%`,
        ad_id: ad.ad_id,
        ad_name: ad.ad_name,
        auto_approved: false,
      });
    }

    // Warn: CPC more than 2× average
    if (avgCPC > 0 && ad.cpc > avgCPC * CPC_WARN_MULTIPLIER) {
      decisions.push({
        type: 'WARN_CPC_HIGH',
        reason: `CPC $${ad.cpc.toFixed(2)} is ${(ad.cpc / avgCPC).toFixed(1)}× avg $${avgCPC.toFixed(2)}`,
        ad_id: ad.ad_id,
        ad_name: ad.ad_name,
        auto_approved: false,
      });
    }

    // Positive signal
    if (ad.ctr > CTR_GREAT_THRESHOLD) {
      decisions.push({
        type: 'GREAT_CTR',
        reason: `CTR ${ad.ctr.toFixed(2)}% — strong performer`,
        ad_id: ad.ad_id,
        ad_name: ad.ad_name,
        auto_approved: false,
      });
    }
  }

  return decisions;
}

// ── Execute auto-approved actions ─────────────────────────────────────────

async function executeAutoActions(decisions) {
  const autoActions = decisions.filter(d => d.auto_approved && d.type === 'AUTO_PAUSE');

  if (autoActions.length === 0) {
    log('INFO', 'No auto-approved actions to execute');
    return;
  }

  for (const decision of autoActions) {
    log('ACTION', `Auto-pausing ad: ${decision.ad_name} (${decision.ad_id}) — ${decision.reason}`);
    try {
      const result = await metaPost(decision.ad_id, { status: 'PAUSED' });
      if (result.success) {
        log('ACTION', `Successfully paused ${decision.ad_name}`);
      } else {
        log('WARN', `Pause returned success=false for ${decision.ad_name}`);
      }
    } catch (err) {
      log('ERROR', `Failed to pause ${decision.ad_name}: ${err.message}`);
    }
  }
}

// ── Persist to Supabase (stub — ready for wiring) ─────────────────────────

async function saveSnapshot(insights, decisions) {
  const supabaseUrl  = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    log('INFO', 'Supabase credentials not set — skipping snapshot persistence');
    return;
  }

  // TODO: Wire Supabase client here
  // Tables:
  //   ad_performance_snapshots (id, ad_id, ad_name, spend, impressions, clicks, ctr, cpc, conversions, fetched_at, date_preset)
  //   ad_decisions             (id, ad_id, ad_name, type, reason, auto_approved, executed_at)

  log('INFO', `[STUB] Would save ${insights.length} snapshot rows and ${decisions.length} decision rows to Supabase`);
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  log('INFO', '=== Ads Cron Job Started ===');

  const [insights, statuses] = await Promise.all([
    fetchInsights('today'),
    fetchAdStatuses(),
  ]);

  // Summary
  const totalSpend  = insights.reduce((s, a) => s + a.spend, 0);
  const totalClicks = insights.reduce((s, a) => s + a.clicks, 0);
  const avgCTR      = insights.length > 0
    ? (insights.reduce((s, a) => s + a.ctr, 0) / insights.length).toFixed(2)
    : '0.00';

  log('INFO', 'Today Summary', {
    ads:      insights.length,
    spend:    `₩${totalSpend.toLocaleString()} ($${(totalSpend / KRW_TO_USD).toFixed(2)})`,
    clicks:   totalClicks.toLocaleString(),
    avg_ctr:  `${avgCTR}%`,
  });

  // Per-ad log
  for (const ad of insights) {
    log('INFO', `  ${ad.ad_name}`, {
      spend: `₩${ad.spend.toLocaleString()}`,
      ctr:   `${ad.ctr.toFixed(2)}%`,
      cpc:   `$${ad.cpc.toFixed(2)}`,
      clicks: ad.clicks,
    });
  }

  // Run rules
  const decisions = runRules(insights, statuses);
  if (decisions.length > 0) {
    log('INFO', `Rule engine produced ${decisions.length} decision(s):`);
    for (const d of decisions) {
      const marker = d.auto_approved ? '[AUTO]' : '[WARN]';
      log(d.auto_approved ? 'ACTION' : 'WARN', `${marker} ${d.ad_name}: ${d.reason}`);
    }
  } else {
    log('INFO', 'All ads within normal thresholds — no actions');
  }

  // Execute auto-approved actions
  await executeAutoActions(decisions);

  // Persist snapshots (stub)
  await saveSnapshot(insights, decisions);

  log('INFO', '=== Ads Cron Job Complete ===');
}

main().catch(err => {
  log('ERROR', `Cron job failed: ${err.message}`);
  process.exit(1);
});
