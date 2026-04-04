/**
 * ads-analyzer.ts
 * Pure JS rule-based analysis of ad performance data.
 * No external API calls — deterministic, runs client-side.
 */

import type { AdPerformance } from '@/lib/actions/ads';

export type AnalysisResult = {
  prose: string;
  generatedAt: string;
};

function extractGeo(adsetName: string): string {
  if (/mena/i.test(adsetName)) return 'MENA';
  if (/eu\b|europ/i.test(adsetName)) return 'EU';
  const match = adsetName.match(/\b([A-Z]{2})\b/);
  return match ? match[1] : 'Unknown';
}

function formatUSD(v: number): string {
  return `$${v.toFixed(2)}`;
}

export function analyzeAds(ads: AdPerformance[], dateLabel: string): AnalysisResult {
  if (ads.length === 0) {
    return {
      prose: `No performance data available for ${dateLabel}. Meta may still be in the learning phase — check back in 24–48 hours.`,
      generatedAt: new Date().toISOString(),
    };
  }

  const totalSpend      = ads.reduce((s, a) => s + a.spend, 0);
  const totalClicks     = ads.reduce((s, a) => s + a.clicks, 0);
  const totalImpressions= ads.reduce((s, a) => s + a.impressions, 0);
  const avgCTR          = ads.reduce((s, a) => s + a.ctr, 0) / ads.length;
  const avgCPC          = ads.reduce((s, a) => s + a.cpc, 0) / ads.length;

  const sorted          = [...ads].sort((a, b) => b.ctr - a.ctr);
  const winner          = sorted[0];
  const loser           = sorted[sorted.length - 1];

  // Group by geo
  const byGeo: Record<string, AdPerformance[]> = {};
  for (const ad of ads) {
    const geo = extractGeo(ad.adset_name);
    if (!byGeo[geo]) byGeo[geo] = [];
    byGeo[geo].push(ad);
  }

  const geoSummaries: string[] = [];
  for (const [geo, geoAds] of Object.entries(byGeo)) {
    const geoCTR = geoAds.reduce((s, a) => s + a.ctr, 0) / geoAds.length;
    const relation = geoCTR > avgCTR * 1.1 ? 'above average' : geoCTR < avgCTR * 0.9 ? 'below average' : 'near average';
    geoSummaries.push(`${geo} is ${relation} at ${geoCTR.toFixed(2)}% CTR`);
  }

  // Learning phase check
  const learningAds = ads.filter(a => a.impressions < 100);
  const learningNote = learningAds.length > 0
    ? ` ${learningAds.length} ad${learningAds.length > 1 ? 's are' : ' is'} still in the learning phase (<100 impressions).`
    : '';

  // Spend rate vs budget (rough estimate: ₩700,000/day = $511)
  const ESTIMATED_DAILY_BUDGET_USD = 511;
  const spendUSD = totalSpend / 1370;
  let spendNote = '';
  if (spendUSD > ESTIMATED_DAILY_BUDGET_USD * 1.1) {
    spendNote = ' Spend is running above budget — monitor closely.';
  } else if (spendUSD < ESTIMATED_DAILY_BUDGET_USD * 0.7) {
    spendNote = ' Spend is underpacing — Meta may still be optimizing delivery.';
  }

  // High CPC outlier
  const highCPCAd = ads.filter(a => a.cpc > avgCPC * 1.8 && a.impressions >= 100);
  const cpcWarning = highCPCAd.length > 0
    ? ` ${highCPCAd.map(a => a.ad_name).join(', ')} ${highCPCAd.length > 1 ? 'have' : 'has'} a high CPC (${highCPCAd.map(a => formatUSD(a.cpc)).join(', ')} vs avg ${formatUSD(avgCPC)}) — monitor for another 24h before pausing.`
    : '';

  // Best geo recommendation
  let geoRec = '';
  if (Object.keys(byGeo).length >= 2) {
    const geoEntries = Object.entries(byGeo).map(([geo, geoAds]) => ({
      geo,
      avgCTR: geoAds.reduce((s, a) => s + a.ctr, 0) / geoAds.length,
    }));
    geoEntries.sort((a, b) => b.avgCTR - a.avgCTR);
    const bestGeo  = geoEntries[0];
    const worstGeo = geoEntries[geoEntries.length - 1];
    if (bestGeo.avgCTR > worstGeo.avgCTR * 1.3) {
      geoRec = ` ${worstGeo.geo} is underperforming vs ${bestGeo.geo} — consider shifting budget toward ${bestGeo.geo}.`;
    }
  }

  // Cost per landing page view estimate (clicks × 0.65 rough LP rate)
  const estLPViews   = Math.round(totalClicks * 0.65);
  const costPerLP    = estLPViews > 0 ? (spendUSD / estLPViews) : 0;
  const lpNote       = estLPViews > 0
    ? ` Estimated cost per landing page view: ${formatUSD(costPerLP)}.`
    : '';

  const geoSection = geoSummaries.length > 0 ? ` ${geoSummaries.join('; ')}.` : '';

  const prose = [
    `After analyzing ${ads.length} ad${ads.length !== 1 ? 's' : ''} across ${Object.keys(byGeo).length} geo${Object.keys(byGeo).length !== 1 ? 's' : ''} for ${dateLabel}:`,
    ` ${winner.ad_name} is the top performer with ${winner.ctr.toFixed(2)}% CTR (avg: ${avgCTR.toFixed(2)}%).`,
    geoSection,
    geoRec,
    cpcWarning,
    learningNote,
    lpNote,
    spendNote,
    totalImpressions > 0
      ? ` Total: ${totalImpressions.toLocaleString()} impressions, ${totalClicks.toLocaleString()} clicks.`
      : '',
  ]
    .filter(Boolean)
    .join('')
    .trim();

  return {
    prose,
    generatedAt: new Date().toISOString(),
  };
}
