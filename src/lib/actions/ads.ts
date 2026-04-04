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

/**
 * Fetch per-ad daily insights for sparklines (last N days).
 */
export async function getAdInsightsDaily(
  adIds: string[],
  days: number = 7
): Promise<{ data: DailyInsight[]; error?: string }> {
  if (adIds.length === 0) return { data: [] };
  try {
    const token = getToken();
    const fields = ['ad_id', 'ad_name', 'date_start', 'clicks', 'impressions', 'spend', 'ctr', 'cpc'].join(',');

    const params = new URLSearchParams({
      access_token: token,
      level: 'ad',
      fields,
      date_preset: days === 7 ? 'last_7d' : 'last_30d',
      time_increment: '1',
      filtering: JSON.stringify([{ field: 'ad.id', operator: 'IN', value: adIds }]),
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
      ad_id: string;
      ad_name: string;
      date_start: string;
      clicks: string;
      impressions: string;
      spend: string;
      ctr: string;
      cpc: string;
    }[] = json.data ?? [];

    const data: DailyInsight[] = raw.map(r => ({
      ad_id:       r.ad_id,
      ad_name:     r.ad_name,
      date:        r.date_start,
      clicks:      parseInt(r.clicks, 10) || 0,
      impressions: parseInt(r.impressions, 10) || 0,
      spend:       parseFloat(r.spend) || 0,
      ctr:         parseFloat(r.ctr) || 0,
      cpc:         parseFloat(r.cpc) || 0,
    }));

    return { data };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { data: [], error: msg };
  }
}

/**
 * List ad images (creatives) from the ad account.
 */
export async function listAdImages(): Promise<{ data: AdImage[]; error?: string }> {
  try {
    const token = getToken();
    const params = new URLSearchParams({
      access_token: token,
      fields: 'id,name,url_128,url,status',
      limit: '20',
    });

    const url = `${META_API_BASE}/${AD_ACCOUNT_ID}/adimages?${params}`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const msg = errBody?.error?.message ?? `Meta API HTTP ${res.status}`;
      return { data: [], error: msg };
    }

    const json = await res.json();
    const raw: { hash: string; name: string; url_128?: string; url?: string; status?: string }[] = json.data ?? [];

    const data: AdImage[] = raw.map(r => ({
      hash:   r.hash,
      name:   r.name,
      url:    r.url_128 ?? r.url ?? '',
      status: r.status ?? 'ACTIVE',
    }));

    return { data };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { data: [], error: msg };
  }
}

/**
 * Create a full campaign chain: campaign → adset → creative → ad.
 * The campaign is created in PAUSED state.
 */
export async function createFullCampaign(data: CreateCampaignData): Promise<{ result?: CreateCampaignResult; error?: string }> {
  try {
    const token = getToken();

    // Step 1: Create campaign
    const campaignBody = new URLSearchParams({
      access_token: token,
      name: data.campaignName,
      objective: 'OUTCOME_TRAFFIC',
      status: 'PAUSED',
      special_ad_categories: '[]',
    });

    const campaignRes = await fetch(`${META_API_BASE}/${AD_ACCOUNT_ID}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: campaignBody.toString(),
    });

    if (!campaignRes.ok) {
      const e = await campaignRes.json().catch(() => ({}));
      return { error: e?.error?.message ?? `Campaign creation failed: HTTP ${campaignRes.status}` };
    }

    const campaignJson = await campaignRes.json();
    const newCampaignId: string = campaignJson.id;

    // Step 2: Create ad set(s)
    const geos = data.geoPreset === 'Both' ? ['MENA', 'EU'] : [data.geoPreset];
    const MENA_COUNTRIES = ['AE', 'SA', 'EG', 'KW', 'QA', 'BH', 'OM', 'JO', 'LB'];
    const EU_COUNTRIES   = ['DE', 'FR', 'ES', 'IT', 'NL', 'SE', 'NO', 'DK', 'FI', 'PL'];

    const adsetIds: string[] = [];

    for (const geo of geos) {
      const countries = geo === 'MENA' ? MENA_COUNTRIES : EU_COUNTRIES;
      const budgetKRW = data.dailyBudgetUSD * KRW_TO_USD;
      const budgetCents = Math.round(budgetKRW * 100);

      const targeting = {
        geo_locations: { countries },
        age_min: data.ageMin,
        age_max: data.ageMax,
        flexible_spec: [{
          interests: [
            { id: '6003486767788', name: 'YouTube' },
            { id: '6003107902433', name: 'Video editing' },
            { id: '6003349442621', name: 'Adobe Premiere Pro' },
          ],
        }],
      };

      const adsetBody = new URLSearchParams({
        access_token: token,
        campaign_id: newCampaignId,
        name: `${data.campaignName} — ${geo}`,
        status: 'PAUSED',
        daily_budget: budgetCents.toString(),
        billing_event: 'IMPRESSIONS',
        optimization_goal: 'LINK_CLICKS',
        targeting: JSON.stringify(targeting),
      });

      const adsetRes = await fetch(`${META_API_BASE}/${AD_ACCOUNT_ID}/adsets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: adsetBody.toString(),
      });

      if (!adsetRes.ok) {
        const e = await adsetRes.json().catch(() => ({}));
        return { error: e?.error?.message ?? `Ad set creation failed for ${geo}` };
      }

      const adsetJson = await adsetRes.json();
      adsetIds.push(adsetJson.id);
    }

    // Step 3: Create ad creative
    const linkUrl = data.promoCode
      ? `${data.linkUrl}${data.linkUrl.includes('?') ? '&' : '?'}code=${data.promoCode}`
      : data.linkUrl;

    const objectStorySpec = {
      page_id: '1085640007961416',
      link_data: {
        image_hash: data.imageHash,
        link: linkUrl,
        message: data.primaryText,
        name: data.headline,
        call_to_action: { type: 'LEARN_MORE', value: { link: linkUrl } },
      },
    };

    const creativeBody = new URLSearchParams({
      access_token: token,
      name: `${data.campaignName} — Creative`,
      object_story_spec: JSON.stringify(objectStorySpec),
    });

    const creativeRes = await fetch(`${META_API_BASE}/${AD_ACCOUNT_ID}/adcreatives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: creativeBody.toString(),
    });

    if (!creativeRes.ok) {
      const e = await creativeRes.json().catch(() => ({}));
      return { error: e?.error?.message ?? `Creative creation failed` };
    }

    const creativeJson = await creativeRes.json();
    const creativeId: string = creativeJson.id;

    // Step 4: Create ads
    const adIds: string[] = [];

    for (const adsetId of adsetIds) {
      const adBody = new URLSearchParams({
        access_token: token,
        adset_id: adsetId,
        name: `${data.campaignName} — Ad`,
        status: 'PAUSED',
        creative: JSON.stringify({ creative_id: creativeId }),
      });

      const adRes = await fetch(`${META_API_BASE}/${AD_ACCOUNT_ID}/ads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: adBody.toString(),
      });

      if (!adRes.ok) {
        const e = await adRes.json().catch(() => ({}));
        return { error: e?.error?.message ?? `Ad creation failed` };
      }

      const adJson = await adRes.json();
      adIds.push(adJson.id);
    }

    return {
      result: {
        campaignId: newCampaignId,
        adsetIds,
        creativeId,
        adIds,
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { error: msg };
  }
}

// ── Additional Types ──────────────────────────────────────────────────────────

export type DailyInsight = {
  ad_id:       string;
  ad_name:     string;
  date:        string;
  clicks:      number;
  impressions: number;
  spend:       number;
  ctr:         number;
  cpc:         number;
};

export type AdImage = {
  hash:   string;
  name:   string;
  url:    string;
  status: string;
};

export type CreateCampaignData = {
  campaignName:  string;
  dailyBudgetUSD: number;
  geoPreset:     'MENA' | 'Europe' | 'Both';
  ageMin:        number;
  ageMax:        number;
  imageHash:     string;
  primaryText:   string;
  headline:      string;
  linkUrl:       string;
  promoCode:     string;
};

export type CreateCampaignResult = {
  campaignId: string;
  adsetIds:   string[];
  creativeId: string;
  adIds:      string[];
};

// Export constant for use in other modules
export { KRW_TO_USD };
