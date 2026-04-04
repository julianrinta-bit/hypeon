'use server';

// ── Constants ────────────────────────────────────────────────────────────────

const AD_ACCOUNT_ID  = 'act_465018329259806';
const CAMPAIGN_ID    = '120241484421670480';
const META_API_BASE  = 'https://graph.facebook.com/v21.0';
const KRW_TO_USD     = 1370;

// ── Types ────────────────────────────────────────────────────────────────────

export type AdPerformance = {
  ad_id:       string;
  ad_name:     string;
  adset_id:    string;
  adset_name:  string;
  spend:       number;  // KRW
  impressions: number;
  clicks:      number;
  ctr:         number;  // percent e.g. 1.52
  cpc:         number;  // USD
  conversions: number;
};

export type CampaignNode = {
  id:               string;
  name:             string;
  status:           string;
  effective_status: string;
};

export type AdSetNode = {
  id:               string;
  name:             string;
  status:           string;
  effective_status: string;
  daily_budget:     string; // raw string from Meta (KRW cents)
};

export type AdNode = {
  id:               string;
  name:             string;
  status:           string;
  effective_status: string;
  adset_id:         string;
};

export type CampaignStatus = {
  campaign: CampaignNode;
  adsets:   AdSetNode[];
  ads:      AdNode[];
};

export type MetaAction = {
  error?: string;
  success?: boolean;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getToken(): string {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error('META_ACCESS_TOKEN is not set in environment');
  return token;
}

function extractConversions(actions?: { action_type: string; value: string }[]): number {
  if (!actions?.length) return 0;
  const purchaseTypes = ['offsite_conversion.fb_pixel_purchase', 'omni_purchase', 'purchase'];
  for (const a of actions) {
    if (purchaseTypes.some(t => a.action_type === t)) {
      return parseInt(a.value, 10) || 0;
    }
  }
  return 0;
}

// ── Server Actions ───────────────────────────────────────────────────────────

/**
 * Fetch per-ad performance metrics from Meta Insights API.
 *
 * @param datePreset - 'today' | 'yesterday' | 'last_7d' | 'last_30d'
 */
export async function getAdPerformance(
  datePreset: 'today' | 'yesterday' | 'last_7d' | 'last_30d' = 'today'
): Promise<{ data: AdPerformance[]; error?: string }> {
  try {
    const token = getToken();
    const fields = [
      'ad_id',
      'ad_name',
      'adset_id',
      'adset_name',
      'spend',
      'impressions',
      'clicks',
      'ctr',
      'cpc',
      'actions',
    ].join(',');

    const params = new URLSearchParams({
      access_token: token,
      level: 'ad',
      fields,
      date_preset: datePreset,
      filtering: JSON.stringify([{ field: 'campaign.id', operator: 'EQUAL', value: CAMPAIGN_ID }]),
    });

    const url = `${META_API_BASE}/${AD_ACCOUNT_ID}/insights?${params}`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const msg = errBody?.error?.message ?? `Meta API HTTP ${res.status}`;
      return { data: [], error: msg };
    }

    const json = await res.json();
    const raw: {
      ad_id:       string;
      ad_name:     string;
      adset_id:    string;
      adset_name:  string;
      spend:       string;
      impressions: string;
      clicks:      string;
      ctr:         string;
      cpc:         string;
      actions?:    { action_type: string; value: string }[];
    }[] = json.data ?? [];

    const data: AdPerformance[] = raw.map(r => ({
      ad_id:       r.ad_id,
      ad_name:     r.ad_name,
      adset_id:    r.adset_id,
      adset_name:  r.adset_name,
      spend:       parseFloat(r.spend) || 0,        // KRW from Meta
      impressions: parseInt(r.impressions, 10) || 0,
      clicks:      parseInt(r.clicks, 10) || 0,
      ctr:         parseFloat(r.ctr) || 0,
      cpc:         parseFloat(r.cpc) || 0,          // USD
      conversions: extractConversions(r.actions),
    }));

    return { data };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { data: [], error: msg };
  }
}

/**
 * Fetch campaign, ad sets, and ads with their current status.
 */
export async function getCampaignStatus(): Promise<{ data: CampaignStatus | null; error?: string }> {
  try {
    const token = getToken();

    // Campaign
    const campaignParams = new URLSearchParams({
      access_token: token,
      fields: 'id,name,status,effective_status',
    });
    const campaignRes = await fetch(
      `${META_API_BASE}/${CAMPAIGN_ID}?${campaignParams}`,
      { cache: 'no-store' }
    );

    if (!campaignRes.ok) {
      const e = await campaignRes.json().catch(() => ({}));
      return { data: null, error: e?.error?.message ?? `Meta API HTTP ${campaignRes.status}` };
    }
    const campaign: CampaignNode = await campaignRes.json();

    // Ad Sets
    const adsetsParams = new URLSearchParams({
      access_token: token,
      fields: 'id,name,status,effective_status,daily_budget',
    });
    const adsetsRes = await fetch(
      `${META_API_BASE}/${CAMPAIGN_ID}/adsets?${adsetsParams}`,
      { cache: 'no-store' }
    );

    if (!adsetsRes.ok) {
      const e = await adsetsRes.json().catch(() => ({}));
      return { data: null, error: e?.error?.message ?? `Meta API HTTP ${adsetsRes.status}` };
    }
    const adsetsJson = await adsetsRes.json();
    const adsets: AdSetNode[] = adsetsJson.data ?? [];

    // Ads
    const adsParams = new URLSearchParams({
      access_token: token,
      fields: 'id,name,status,effective_status,adset_id',
    });
    const adsRes = await fetch(
      `${META_API_BASE}/${CAMPAIGN_ID}/ads?${adsParams}`,
      { cache: 'no-store' }
    );

    if (!adsRes.ok) {
      const e = await adsRes.json().catch(() => ({}));
      return { data: null, error: e?.error?.message ?? `Meta API HTTP ${adsRes.status}` };
    }
    const adsJson = await adsRes.json();
    const ads: AdNode[] = adsJson.data ?? [];

    return { data: { campaign, adsets, ads } };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { data: null, error: msg };
  }
}

/**
 * Toggle an ad's status between ACTIVE and PAUSED.
 */
export async function toggleAdStatus(
  adId: string,
  newStatus: 'ACTIVE' | 'PAUSED'
): Promise<MetaAction> {
  try {
    const token = getToken();

    const res = await fetch(`${META_API_BASE}/${adId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, access_token: token }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      return { error: e?.error?.message ?? `Meta API HTTP ${res.status}` };
    }

    const json = await res.json();
    if (json.success) return { success: true };
    return { error: 'Meta returned success=false' };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Update an ad set's daily budget.
 *
 * @param adsetId           - Meta ad set ID
 * @param dailyBudgetKRW    - Daily budget in Korean Won
 */
export async function updateBudget(
  adsetId: string,
  dailyBudgetKRW: number
): Promise<MetaAction> {
  try {
    const token = getToken();

    // Meta expects budget in the account's currency's smallest unit.
    // For KRW (no subdivisions) that means the integer value × 100 per Meta's convention.
    const budgetCents = Math.round(dailyBudgetKRW * 100);

    const res = await fetch(`${META_API_BASE}/${adsetId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ daily_budget: budgetCents, access_token: token }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      return { error: e?.error?.message ?? `Meta API HTTP ${res.status}` };
    }

    const json = await res.json();
    if (json.success) return { success: true };
    return { error: 'Meta returned success=false' };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// Export constant for use in other modules
export { KRW_TO_USD };
