'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAdPerformance,
  getCampaignStatus,
  toggleAdStatus,
  type AdPerformance,
  type CampaignStatus,
  KRW_TO_USD,
} from '@/lib/actions/ads';
import styles from './dashboard.module.css';

// ── Types ─────────────────────────────────────────────────────────────────────

type DatePreset = 'today' | 'yesterday' | 'last_7d' | 'last_30d';

type Recommendation = {
  id: string;
  icon: string;
  text: React.ReactNode;
  type: 'warning' | 'success' | 'info';
  action?: {
    label: string;
    adId?: string;
    newStatus?: 'ACTIVE' | 'PAUSED';
  };
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatKRW(krw: number): string {
  return `₩${krw.toLocaleString('ko-KR')}`;
}

function formatUSD(krw: number): string {
  return `$${(krw / KRW_TO_USD).toFixed(2)}`;
}

function ctrClass(ctr: number): string {
  if (ctr > 1.5) return styles.ctrGood;
  if (ctr >= 1.0) return styles.ctrMid;
  return styles.ctrBad;
}

function cpcClass(cpc: number): string {
  if (cpc < 0.30) return styles.cpcGood;
  if (cpc <= 0.60) return styles.cpcMid;
  return styles.cpcBad;
}

function getAdStatusClass(status: string): string {
  const s = status.toUpperCase();
  if (s === 'ACTIVE') return `${styles.adStatusDot} ${styles.adActive}`;
  if (s === 'PAUSED') return `${styles.adStatusDot} ${styles.adPaused}`;
  return `${styles.adStatusDot} ${styles.adOther}`;
}

function getCampaignStatusClass(status: string): string {
  const s = status.toUpperCase();
  if (s === 'ACTIVE') return `${styles.statusBadge} ${styles.active}`;
  if (s === 'PAUSED') return `${styles.statusBadge} ${styles.paused}`;
  return `${styles.statusBadge} ${styles.error}`;
}

function buildRecommendations(
  ads: AdPerformance[],
  adStatuses: Record<string, string>
): Recommendation[] {
  if (ads.length === 0) {
    return [
      {
        id: 'no-data',
        icon: '⏳',
        type: 'info',
        text: 'Waiting for data. Meta needs 24–48h learning phase.',
      },
    ];
  }

  const recs: Recommendation[] = [];
  const totalSpend = ads.reduce((s, a) => s + a.spend, 0);
  const avgCPC = ads.length > 0
    ? ads.reduce((s, a) => s + a.cpc, 0) / ads.length
    : 0;

  for (const ad of ads) {
    // CTR below threshold after sufficient impressions
    if (ad.impressions >= 1000 && ad.ctr < 0.8) {
      recs.push({
        id: `ctr-low-${ad.ad_id}`,
        icon: '⚠',
        type: 'warning',
        text: (
          <>
            Consider pausing <span className={styles.recTextStrong}>{ad.ad_name}</span> — CTR below 0.8% threshold ({ad.ctr.toFixed(2)}%)
          </>
        ),
        action: {
          label: 'Pause Ad',
          adId: ad.ad_id,
          newStatus: 'PAUSED',
        },
      });
    }

    // CPC more than 2x average
    if (avgCPC > 0 && ad.cpc > avgCPC * 2) {
      recs.push({
        id: `cpc-high-${ad.ad_id}`,
        icon: '⚠',
        type: 'warning',
        text: (
          <>
            <span className={styles.recTextStrong}>{ad.ad_name}</span> CPC is {(ad.cpc / avgCPC).toFixed(1)}x above average — consider pausing (${ad.cpc.toFixed(2)} vs avg ${avgCPC.toFixed(2)})
          </>
        ),
        action: {
          label: 'Pause Ad',
          adId: ad.ad_id,
          newStatus: 'PAUSED',
        },
      });
    }

    // High performer
    if (ad.ctr > 2.5 && adStatuses[ad.ad_id] !== 'PAUSED') {
      recs.push({
        id: `ctr-great-${ad.ad_id}`,
        icon: '✓',
        type: 'success',
        text: (
          <>
            <span className={styles.recTextStrong}>{ad.ad_name}</span> is performing well with {ad.ctr.toFixed(2)}% CTR — consider increasing budget
          </>
        ),
      });
    }
  }

  if (recs.length === 0) {
    recs.push({
      id: 'all-clear',
      icon: '✓',
      type: 'success',
      text: 'All ads are within normal performance thresholds.',
    });
  }

  return recs;
}

function extractGeo(adsetName: string): string {
  // Try to parse a 2-letter country code from the ad set name
  const match = adsetName.match(/\b([A-Z]{2})\b/);
  return match ? match[1] : '—';
}

const DATE_OPTIONS: { label: string; value: DatePreset }[] = [
  { label: 'Today',     value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: '7 days',    value: 'last_7d' },
  { label: '30 days',   value: 'last_30d' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdsDashboardPage() {
  const router = useRouter();

  // Auth check on mount — server-side redirect can't happen in client component,
  // so we redirect client-side if the cookie is missing.
  useEffect(() => {
    const hasCookie = document.cookie
      .split(';')
      .some(c => c.trim().startsWith('ads_auth='));
    if (!hasCookie) router.replace('/ads');
  }, [router]);

  const [datePreset, setDatePreset] = useState<DatePreset>('today');
  const [loading, setLoading]       = useState(true);
  const [apiError, setApiError]     = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const [performance, setPerformance] = useState<AdPerformance[]>([]);
  const [campaign, setCampaign]       = useState<CampaignStatus | null>(null);

  // Track optimistic ad statuses so toggle buttons update immediately
  const [adStatuses, setAdStatuses] = useState<Record<string, string>>({});
  const [pendingToggle, setPendingToggle] = useState<string | null>(null);
  const [isPending, startTransition]      = useTransition();

  // ── Data fetch ──────────────────────────────────────────────────────────────

  const fetchData = useCallback(async (preset: DatePreset = datePreset) => {
    setLoading(true);
    setApiError(null);

    const [perfResult, statusResult] = await Promise.all([
      getAdPerformance(preset),
      getCampaignStatus(),
    ]);

    if (perfResult.error) {
      setApiError(perfResult.error);
    } else {
      setPerformance(perfResult.data);
    }

    if (statusResult.data) {
      setCampaign(statusResult.data);
      // Build initial status map from real data
      const statusMap: Record<string, string> = {};
      for (const ad of statusResult.data.ads) {
        statusMap[ad.id] = ad.effective_status ?? ad.status;
      }
      setAdStatuses(statusMap);
    }

    setLastUpdated(new Date());
    setSecondsAgo(0);
    setLoading(false);
  }, [datePreset]);

  // Initial fetch
  useEffect(() => {
    fetchData(datePreset);
  }, [datePreset, fetchData]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchData(datePreset), 60_000);
    return () => clearInterval(interval);
  }, [datePreset, fetchData]);

  // "X seconds ago" counter
  useEffect(() => {
    if (!lastUpdated) return;
    const tick = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [lastUpdated]);

  // ── Toggle ad status ────────────────────────────────────────────────────────

  function handleToggle(adId: string, currentStatus: string) {
    const newStatus = currentStatus.toUpperCase() === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setPendingToggle(adId);

    // Optimistic update
    setAdStatuses(prev => ({ ...prev, [adId]: newStatus }));

    startTransition(async () => {
      const result = await toggleAdStatus(adId, newStatus);
      if (result.error) {
        // Roll back
        setAdStatuses(prev => ({ ...prev, [adId]: currentStatus }));
        setApiError(`Toggle failed: ${result.error}`);
      }
      setPendingToggle(null);
    });
  }

  // ── Derived stats ────────────────────────────────────────────────────────────

  const totalSpend   = performance.reduce((s, a) => s + a.spend, 0);
  const totalClicks  = performance.reduce((s, a) => s + a.clicks, 0);
  const avgCTR       = performance.length > 0
    ? performance.reduce((s, a) => s + a.ctr, 0) / performance.length
    : 0;
  const avgCPC       = performance.length > 0
    ? performance.reduce((s, a) => s + a.cpc, 0) / performance.length
    : 0;
  const bestPerformer = performance.length > 0
    ? performance.reduce((best, a) => a.ctr > best.ctr ? a : best, performance[0])
    : null;

  const recommendations = buildRecommendations(performance, adStatuses);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      <div className={styles.pageBg} aria-hidden="true" />
      <div className={styles.shell}>
        <div className={styles.contentWrap}>

          {/* ── TOP BAR ───────────────────────────────────────────────────── */}
          <div className={styles.topBar}>
            <div className={styles.topBarLeft}>
              <h1 className={styles.topBarTitle}>Ads Dashboard</h1>
              {campaign && (
                <span
                  className={getCampaignStatusClass(
                    campaign.campaign.effective_status ?? campaign.campaign.status
                  )}
                  role="status"
                >
                  <span className={styles.statusDot} aria-hidden="true" />
                  {campaign.campaign.effective_status ?? campaign.campaign.status}
                </span>
              )}
            </div>

            <div className={styles.topBarRight}>
              {lastUpdated && (
                <span className={styles.lastUpdated} aria-live="polite">
                  Updated {secondsAgo}s ago
                </span>
              )}

              <button
                className={styles.refreshBtn}
                onClick={() => fetchData(datePreset)}
                disabled={loading}
                type="button"
                aria-label="Refresh data"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                  <path
                    d="M11.5 6.5A5 5 0 1 1 6.5 1.5M6.5 1.5l2 2-2 2"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Refresh
              </button>

              {/* Date selector */}
              <nav className={styles.dateSelector} aria-label="Date range">
                {DATE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`${styles.datePill} ${datePreset === opt.value ? styles.datePillActive : ''}`}
                    onClick={() => setDatePreset(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* ── ERROR BANNER ──────────────────────────────────────────────── */}
          {apiError && (
            <div className={styles.errorBanner} role="alert">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="7" stroke="#FCA5A5" strokeWidth="1.4" />
                <path d="M8 5v4M8 11v.5" stroke="#FCA5A5" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              {apiError}
            </div>
          )}

          {/* ── STAT CARDS ────────────────────────────────────────────────── */}
          <section className={styles.statsGrid} aria-label="Campaign summary">
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Total Spend</p>
              {loading ? (
                <span className={`${styles.skeleton} ${styles.skeletonRow}`} style={{ width: '80px', height: '28px' }} />
              ) : (
                <>
                  <p className={styles.statValue}>{formatKRW(totalSpend)}</p>
                  <p className={styles.statValueSub}>{formatUSD(totalSpend)}</p>
                </>
              )}
            </div>

            <div className={styles.statCard}>
              <p className={styles.statLabel}>Total Clicks</p>
              {loading ? (
                <span className={`${styles.skeleton} ${styles.skeletonRow}`} style={{ width: '60px', height: '28px' }} />
              ) : (
                <p className={styles.statValue}>{totalClicks.toLocaleString()}</p>
              )}
            </div>

            <div className={styles.statCard}>
              <p className={styles.statLabel}>Best Performer</p>
              {loading ? (
                <span className={`${styles.skeleton} ${styles.skeletonRow}`} style={{ width: '120px', height: '28px' }} />
              ) : bestPerformer ? (
                <>
                  <p className={styles.statValue} style={{ fontSize: '1.1rem', lineHeight: 1.25 }}>
                    {bestPerformer.ctr.toFixed(2)}% CTR
                  </p>
                  <p className={styles.statMeta} title={bestPerformer.ad_name}>
                    {bestPerformer.ad_name.length > 28
                      ? bestPerformer.ad_name.slice(0, 28) + '…'
                      : bestPerformer.ad_name}
                  </p>
                </>
              ) : (
                <p className={styles.statValue}>—</p>
              )}
            </div>

            <div className={styles.statCard}>
              <p className={styles.statLabel}>Avg CPC</p>
              {loading ? (
                <span className={`${styles.skeleton} ${styles.skeletonRow}`} style={{ width: '70px', height: '28px' }} />
              ) : (
                <p className={`${styles.statValue} ${cpcClass(avgCPC)}`}>${avgCPC.toFixed(2)}</p>
              )}
            </div>
          </section>

          {/* ── PERFORMANCE TABLE ────────────────────────────────────────── */}
          <section className={styles.panel} aria-label="Ad performance table">
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>
                <span className={styles.panelTitleIcon} aria-hidden="true">&#9632;</span>
                Performance
              </h2>
              <span className={styles.lastUpdated}>
                {performance.length} ad{performance.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className={styles.panelBody}>
              {/* Desktop table */}
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Ad</th>
                      <th>Geo</th>
                      <th>Spend</th>
                      <th>Impressions</th>
                      <th>Clicks</th>
                      <th>CTR</th>
                      <th>CPC</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 9 }).map((_, j) => (
                            <td key={j}>
                              <span
                                className={styles.skeleton}
                                style={{ width: `${40 + Math.random() * 50}px`, height: '12px', display: 'block' }}
                              />
                            </td>
                          ))}
                        </tr>
                      ))
                    )}

                    {!loading && performance.length === 0 && (
                      <tr>
                        <td colSpan={9} className={styles.tableEmpty}>
                          No data available for this date range. Meta may still be in the learning phase.
                        </td>
                      </tr>
                    )}

                    {!loading && performance.map(ad => {
                      const liveStatus = adStatuses[ad.ad_id] ?? 'UNKNOWN';
                      const isActive   = liveStatus.toUpperCase() === 'ACTIVE';
                      return (
                        <tr key={ad.ad_id}>
                          <td className={styles.cellName}>
                            {ad.ad_name}
                            <div className={styles.cellNameSub}>{ad.adset_name}</div>
                          </td>
                          <td className={styles.cellGeo}>{extractGeo(ad.adset_name)}</td>
                          <td className={styles.cellMono}>
                            {formatKRW(ad.spend)}
                            <div className={styles.cellNameSub}>{formatUSD(ad.spend)}</div>
                          </td>
                          <td className={styles.cellMono}>{ad.impressions.toLocaleString()}</td>
                          <td className={styles.cellMono}>{ad.clicks.toLocaleString()}</td>
                          <td className={`${styles.cellMono} ${ctrClass(ad.ctr)}`}>
                            {ad.ctr.toFixed(2)}%
                          </td>
                          <td className={`${styles.cellMono} ${cpcClass(ad.cpc)}`}>
                            ${ad.cpc.toFixed(2)}
                          </td>
                          <td>
                            <span className={getAdStatusClass(liveStatus)}>
                              {liveStatus}
                            </span>
                          </td>
                          <td className={styles.cellAction}>
                            <button
                              type="button"
                              className={`${styles.toggleBtn} ${isActive ? styles.togglePause : styles.toggleActivate}`}
                              onClick={() => handleToggle(ad.ad_id, liveStatus)}
                              disabled={pendingToggle === ad.ad_id || isPending}
                              aria-label={isActive ? `Pause ${ad.ad_name}` : `Activate ${ad.ad_name}`}
                            >
                              {pendingToggle === ad.ad_id
                                ? '...'
                                : isActive ? 'Pause' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className={styles.mobileCards} role="list" aria-label="Ad performance cards">
                {loading && (
                  <div className={styles.mobileCard}>
                    <span className={`${styles.skeleton}`} style={{ width: '150px', height: '14px', display: 'block', marginBottom: '10px' }} />
                    <span className={`${styles.skeleton}`} style={{ width: '100%', height: '50px', display: 'block' }} />
                  </div>
                )}

                {!loading && performance.length === 0 && (
                  <div className={styles.mobileCard}>
                    <p className={styles.tableEmpty}>
                      No data available for this date range.
                    </p>
                  </div>
                )}

                {!loading && performance.map(ad => {
                  const liveStatus = adStatuses[ad.ad_id] ?? 'UNKNOWN';
                  const isActive   = liveStatus.toUpperCase() === 'ACTIVE';
                  return (
                    <div key={ad.ad_id} className={styles.mobileCard} role="listitem">
                      <div className={styles.mobileCardName}>{ad.ad_name}</div>
                      <div className={styles.mobileCardGrid}>
                        <div className={styles.mobileCardStat}>
                          <span className={styles.mobileCardStatLabel}>Spend</span>
                          <span className={styles.mobileCardStatValue}>{formatKRW(ad.spend)}</span>
                        </div>
                        <div className={styles.mobileCardStat}>
                          <span className={styles.mobileCardStatLabel}>CTR</span>
                          <span className={`${styles.mobileCardStatValue} ${ctrClass(ad.ctr)}`}>{ad.ctr.toFixed(2)}%</span>
                        </div>
                        <div className={styles.mobileCardStat}>
                          <span className={styles.mobileCardStatLabel}>CPC</span>
                          <span className={`${styles.mobileCardStatValue} ${cpcClass(ad.cpc)}`}>${ad.cpc.toFixed(2)}</span>
                        </div>
                        <div className={styles.mobileCardStat}>
                          <span className={styles.mobileCardStatLabel}>Clicks</span>
                          <span className={styles.mobileCardStatValue}>{ad.clicks.toLocaleString()}</span>
                        </div>
                        <div className={styles.mobileCardStat}>
                          <span className={styles.mobileCardStatLabel}>Impr.</span>
                          <span className={styles.mobileCardStatValue}>{ad.impressions.toLocaleString()}</span>
                        </div>
                        <div className={styles.mobileCardStat}>
                          <span className={styles.mobileCardStatLabel}>Conv.</span>
                          <span className={styles.mobileCardStatValue}>{ad.conversions}</span>
                        </div>
                      </div>
                      <div className={styles.mobileCardFooter}>
                        <span className={getAdStatusClass(liveStatus)}>{liveStatus}</span>
                        <button
                          type="button"
                          className={`${styles.toggleBtn} ${isActive ? styles.togglePause : styles.toggleActivate}`}
                          onClick={() => handleToggle(ad.ad_id, liveStatus)}
                          disabled={pendingToggle === ad.ad_id || isPending}
                          aria-label={isActive ? `Pause ${ad.ad_name}` : `Activate ${ad.ad_name}`}
                        >
                          {pendingToggle === ad.ad_id ? '...' : isActive ? 'Pause' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── AI RECOMMENDATIONS ───────────────────────────────────────── */}
          <section className={styles.panel} aria-label="AI Recommendations">
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>
                <span className={styles.panelTitleIcon} aria-hidden="true">&#10024;</span>
                AI Recommendations
              </h2>
            </div>
            <div className={styles.panelBody}>
              {loading ? (
                <div className={styles.recEmpty}>Analyzing performance data...</div>
              ) : (
                <div className={styles.recList}>
                  {recommendations.map(rec => (
                    <div key={rec.id} className={styles.recItem}>
                      <div className={styles.recItemLeft}>
                        <span className={styles.recIcon} aria-hidden="true">{rec.icon}</span>
                        <span className={styles.recText}>{rec.text}</span>
                      </div>
                      {rec.action && (
                        <button
                          type="button"
                          className={styles.applyBtn}
                          onClick={() => {
                            if (rec.action?.adId && rec.action?.newStatus) {
                              handleToggle(rec.action.adId, rec.action.newStatus === 'PAUSED' ? 'ACTIVE' : 'PAUSED');
                            }
                          }}
                          disabled={rec.action.adId ? pendingToggle === rec.action.adId : false}
                          aria-label={`Apply: ${rec.action.label}`}
                        >
                          {rec.action.label}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
