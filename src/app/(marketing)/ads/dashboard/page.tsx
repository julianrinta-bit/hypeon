'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAdPerformance,
  getCampaignStatus,
  toggleAdStatus,
  getAdInsightsDaily,
  listAdImages,
  createFullCampaign,
  type AdPerformance,
  type CampaignStatus,
  type DailyInsight,
  type AdImage,
  type CreateCampaignData,
  KRW_TO_USD,
} from '@/lib/actions/ads';
import { analyzeAds } from '@/lib/ads-analyzer';
import Sparkline, { type SparklinePoint } from '@/components/ads/Sparkline';
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

type ActionLogEntry = {
  id: string;
  timestamp: string;
  action: 'pause' | 'activate' | 'budget_change' | 'campaign_created' | 'analysis_run';
  target: string;
  details: string;
  result: 'success' | 'error';
};

// Campaign wizard data shape
type WizardData = {
  campaignName:   string;
  dailyBudgetUSD: number;
  geoPreset:      'MENA' | 'Europe' | 'Both';
  ageMin:         number;
  ageMax:         number;
  imageHash:      string;
  primaryText:    string;
  headline:       string;
  linkUrl:        string;
  promoCode:      string;
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

function relativeTime(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const ACTION_ICONS: Record<ActionLogEntry['action'], string> = {
  pause:            '⏸',
  activate:         '▶',
  budget_change:    '💰',
  campaign_created: '🆕',
  analysis_run:     '🔍',
};

const LOG_STORAGE_KEY = 'ads_action_log';

function loadLog(): ActionLogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ActionLogEntry[]) : [];
  } catch {
    return [];
  }
}

function saveLog(entries: ActionLogEntry[]): void {
  try {
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(entries.slice(0, 20)));
  } catch {
    // ignore storage errors
  }
}

function addLogEntry(
  prev: ActionLogEntry[],
  entry: Omit<ActionLogEntry, 'id' | 'timestamp'>
): ActionLogEntry[] {
  const newEntry: ActionLogEntry = {
    ...entry,
    id:        crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  const updated = [newEntry, ...prev].slice(0, 20);
  saveLog(updated);
  return updated;
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
  const avgCPC = ads.length > 0
    ? ads.reduce((s, a) => s + a.cpc, 0) / ads.length
    : 0;

  for (const ad of ads) {
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
  const match = adsetName.match(/\b([A-Z]{2})\b/);
  return match ? match[1] : '—';
}

const DATE_OPTIONS: { label: string; value: DatePreset }[] = [
  { label: 'Today',     value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: '7 days',    value: 'last_7d' },
  { label: '30 days',   value: 'last_30d' },
];

const DATE_LABELS: Record<DatePreset, string> = {
  today:     'today',
  yesterday: 'yesterday',
  last_7d:   'the last 7 days',
  last_30d:  'the last 30 days',
};

// ── Wizard Step Components ─────────────────────────────────────────────────────

function WizardStep1({
  data,
  onChange,
}: {
  data: WizardData;
  onChange: (d: Partial<WizardData>) => void;
}) {
  return (
    <div className={styles.wizardFields}>
      <div className={styles.wizardField}>
        <label className={styles.wizardLabel}>Campaign name</label>
        <input
          type="text"
          className={styles.wizardInput}
          value={data.campaignName}
          onChange={e => onChange({ campaignName: e.target.value })}
          placeholder="e.g. Hypeon Q2 MENA"
          autoFocus
        />
      </div>

      <div className={styles.wizardField}>
        <label className={styles.wizardLabel}>Objective</label>
        <div className={styles.wizardInfo}>
          <span className={styles.wizardInfoIcon}>ℹ</span>
          OUTCOME_TRAFFIC — drive clicks to your landing page
        </div>
      </div>

      <div className={styles.wizardField}>
        <label className={styles.wizardLabel}>Daily budget per ad set (USD)</label>
        <div className={styles.wizardInputRow}>
          <input
            type="number"
            className={styles.wizardInput}
            value={data.dailyBudgetUSD}
            min={1}
            step={0.5}
            onChange={e => onChange({ dailyBudgetUSD: parseFloat(e.target.value) || 5 })}
          />
          <span className={styles.wizardInputSub}>
            ≈ {formatKRW(data.dailyBudgetUSD * KRW_TO_USD)} / day
          </span>
        </div>
      </div>
    </div>
  );
}

function WizardStep2({
  data,
  onChange,
}: {
  data: WizardData;
  onChange: (d: Partial<WizardData>) => void;
}) {
  return (
    <div className={styles.wizardFields}>
      <div className={styles.wizardField}>
        <label className={styles.wizardLabel}>Geo preset</label>
        <div className={styles.wizardRadioGroup}>
          {(['MENA', 'Europe', 'Both'] as const).map(geo => (
            <label key={geo} className={styles.wizardRadio}>
              <input
                type="radio"
                name="geo"
                value={geo}
                checked={data.geoPreset === geo}
                onChange={() => onChange({ geoPreset: geo })}
              />
              <span className={styles.wizardRadioLabel}>{geo}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.wizardField}>
        <label className={styles.wizardLabel}>Age range</label>
        <div className={styles.wizardAgeRow}>
          <input
            type="number"
            className={styles.wizardInput}
            value={data.ageMin}
            min={18}
            max={64}
            onChange={e => onChange({ ageMin: parseInt(e.target.value, 10) || 25 })}
            style={{ width: '80px' }}
          />
          <span className={styles.wizardInputSub}>to</span>
          <input
            type="number"
            className={styles.wizardInput}
            value={data.ageMax}
            min={19}
            max={65}
            onChange={e => onChange({ ageMax: parseInt(e.target.value, 10) || 65 })}
            style={{ width: '80px' }}
          />
        </div>
      </div>

      <div className={styles.wizardField}>
        <label className={styles.wizardLabel}>Interests (pre-filled)</label>
        <div className={styles.wizardInfo}>
          <span className={styles.wizardInfoIcon}>✓</span>
          YouTube · Video editing · Adobe Premiere Pro
        </div>
      </div>
    </div>
  );
}

function WizardStep3({
  data,
  images,
  imagesLoading,
  onChange,
}: {
  data: WizardData;
  images: AdImage[];
  imagesLoading: boolean;
  onChange: (d: Partial<WizardData>) => void;
}) {
  return (
    <div className={styles.wizardFields}>
      <div className={styles.wizardField}>
        <label className={styles.wizardLabel}>Select image</label>
        {imagesLoading ? (
          <div className={styles.wizardInfo}>Loading images...</div>
        ) : images.length === 0 ? (
          <div className={styles.wizardInfo}>No images found in ad account. Upload one first.</div>
        ) : (
          <div className={styles.wizardImageGrid}>
            {images.map(img => (
              <button
                key={img.hash}
                type="button"
                className={`${styles.wizardImageItem} ${data.imageHash === img.hash ? styles.wizardImageSelected : ''}`}
                onClick={() => onChange({ imageHash: img.hash })}
                title={img.name}
              >
                {img.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt={img.name} className={styles.wizardImageThumb} />
                ) : (
                  <span className={styles.wizardImageFallback}>{img.name.slice(0, 8)}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.wizardField}>
        <label className={styles.wizardLabel}>Primary text</label>
        <textarea
          className={`${styles.wizardInput} ${styles.wizardTextarea}`}
          value={data.primaryText}
          onChange={e => onChange({ primaryText: e.target.value })}
          placeholder="Get a free YouTube channel audit — see exactly what's killing your views."
          rows={3}
        />
      </div>

      <div className={styles.wizardField}>
        <label className={styles.wizardLabel}>Headline</label>
        <input
          type="text"
          className={styles.wizardInput}
          value={data.headline}
          onChange={e => onChange({ headline: e.target.value })}
          placeholder="Your YouTube Is Leaving Money on the Table"
        />
      </div>

      <div className={styles.wizardField}>
        <label className={styles.wizardLabel}>Link URL</label>
        <input
          type="url"
          className={styles.wizardInput}
          value={data.linkUrl}
          onChange={e => onChange({ linkUrl: e.target.value })}
        />
      </div>

      <div className={styles.wizardField}>
        <label className={styles.wizardLabel}>Promo code (optional)</label>
        <div className={styles.wizardInputRow}>
          <input
            type="text"
            className={styles.wizardInput}
            value={data.promoCode}
            onChange={e => onChange({ promoCode: e.target.value })}
            placeholder="MENA25"
          />
          {data.promoCode && (
            <span className={styles.wizardInputSub} style={{ fontSize: '11px' }}>
              → URL: {data.linkUrl}{data.linkUrl.includes('?') ? '&' : '?'}code={data.promoCode}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function WizardStep4({
  data,
  launching,
  launchResult,
  onLaunch,
}: {
  data: WizardData;
  launching: boolean;
  launchResult: { success?: boolean; error?: string } | null;
  onLaunch: () => void;
}) {
  const rows = [
    ['Campaign name',   data.campaignName],
    ['Objective',       'OUTCOME_TRAFFIC'],
    ['Daily budget',    `$${data.dailyBudgetUSD}/ad set (≈ ${formatKRW(data.dailyBudgetUSD * KRW_TO_USD)})`],
    ['Geo',             data.geoPreset],
    ['Age range',       `${data.ageMin}–${data.ageMax}`],
    ['Image hash',      data.imageHash || '(none selected)'],
    ['Primary text',    data.primaryText || '(empty)'],
    ['Headline',        data.headline    || '(empty)'],
    ['Link URL',        data.linkUrl],
    ['Promo code',      data.promoCode   || '(none)'],
  ];

  return (
    <div className={styles.wizardFields}>
      <div className={styles.wizardReviewTable}>
        {rows.map(([label, value]) => (
          <div key={label} className={styles.wizardReviewRow}>
            <span className={styles.wizardReviewLabel}>{label}</span>
            <span className={styles.wizardReviewValue}>{value}</span>
          </div>
        ))}
      </div>

      {launchResult?.error && (
        <div className={styles.wizardError}>{launchResult.error}</div>
      )}

      {launchResult?.success && (
        <div className={styles.wizardSuccess}>
          Campaign created successfully (paused). Activate it from the Meta Ads Manager when ready.
        </div>
      )}

      {!launchResult && (
        <button
          type="button"
          className={styles.wizardLaunchBtn}
          onClick={onLaunch}
          disabled={launching || !data.campaignName || !data.imageHash}
        >
          {launching ? 'Creating...' : 'Create Campaign (Paused)'}
        </button>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

const WIZARD_STEPS = ['Campaign', 'Targeting', 'Creative', 'Review'];

const DEFAULT_WIZARD: WizardData = {
  campaignName:   '',
  dailyBudgetUSD: 5,
  geoPreset:      'MENA',
  ageMin:         25,
  ageMax:         65,
  imageHash:      '',
  primaryText:    '',
  headline:       '',
  linkUrl:        'https://hypeon.media/analyze?code=',
  promoCode:      '',
};

export default function AdsDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const hasCookie = document.cookie
      .split(';')
      .some(c => c.trim().startsWith('ads_auth='));
    if (!hasCookie) router.replace('/ads');
  }, [router]);

  // ── Core state ──────────────────────────────────────────────────────────────

  const [datePreset, setDatePreset]     = useState<DatePreset>('today');
  const [loading, setLoading]           = useState(true);
  const [refreshSpin, setRefreshSpin]   = useState(false);
  const [apiError, setApiError]         = useState<string | null>(null);
  const [lastUpdated, setLastUpdated]   = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo]     = useState(0);

  const [performance, setPerformance]   = useState<AdPerformance[]>([]);
  const [campaign, setCampaign]         = useState<CampaignStatus | null>(null);

  const [adStatuses, setAdStatuses]     = useState<Record<string, string>>({});
  const [pendingToggle, setPendingToggle] = useState<string | null>(null);
  const [isPending, startTransition]    = useTransition();

  // ── Sparkline state ─────────────────────────────────────────────────────────

  const [sparklines, setSparklines]     = useState<Record<string, SparklinePoint[]>>({});
  const [sparklinesLoading, setSparklinesLoading] = useState(false);

  // ── Analyze state ────────────────────────────────────────────────────────────

  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [analyzing, setAnalyzing]       = useState(false);

  // ── Campaign wizard state ────────────────────────────────────────────────────

  const [wizardOpen, setWizardOpen]     = useState(false);
  const [wizardStep, setWizardStep]     = useState(0);
  const [wizardData, setWizardData]     = useState<WizardData>(DEFAULT_WIZARD);
  const [wizardImages, setWizardImages] = useState<AdImage[]>([]);
  const [wizardImagesLoading, setWizardImagesLoading] = useState(false);
  const [wizardLaunching, setWizardLaunching] = useState(false);
  const [wizardLaunchResult, setWizardLaunchResult] = useState<{ success?: boolean; error?: string } | null>(null);

  // ── Action log state ─────────────────────────────────────────────────────────

  const [actionLog, setActionLog]       = useState<ActionLogEntry[]>([]);

  // Load log from localStorage on mount
  useEffect(() => {
    setActionLog(loadLog());
  }, []);

  // Ticker for relative time in log
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 10_000);
    return () => clearInterval(t);
  }, []);

  // ── Data fetch ──────────────────────────────────────────────────────────────

  const fetchData = useCallback(async (preset: DatePreset = datePreset) => {
    setLoading(true);
    setRefreshSpin(true);
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
      const statusMap: Record<string, string> = {};
      for (const ad of statusResult.data.ads) {
        statusMap[ad.id] = ad.effective_status ?? ad.status;
      }
      setAdStatuses(statusMap);
    }

    setLastUpdated(new Date());
    setSecondsAgo(0);
    setLoading(false);

    // Stop spin after a beat
    setTimeout(() => setRefreshSpin(false), 600);
  }, [datePreset]);

  useEffect(() => {
    fetchData(datePreset);
  }, [datePreset, fetchData]);

  // Auto-refresh every 60s
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

  // ── Sparklines fetch ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (performance.length === 0) return;
    const adIds = performance.map(a => a.ad_id);
    setSparklinesLoading(true);

    getAdInsightsDaily(adIds, 7).then(result => {
      if (!result.error && result.data.length > 0) {
        // Group by ad_id, sorted by date
        const grouped: Record<string, SparklinePoint[]> = {};
        for (const row of result.data) {
          if (!grouped[row.ad_id]) grouped[row.ad_id] = [];
          grouped[row.ad_id].push({ date: row.date, value: row.ctr });
        }
        for (const id of Object.keys(grouped)) {
          grouped[id].sort((a, b) => a.date.localeCompare(b.date));
        }
        setSparklines(grouped);
      }
      setSparklinesLoading(false);
    });
  }, [performance]);

  // ── Toggle ad status ─────────────────────────────────────────────────────────

  function handleToggle(adId: string, currentStatus: string) {
    const newStatus = currentStatus.toUpperCase() === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setPendingToggle(adId);
    setAdStatuses(prev => ({ ...prev, [adId]: newStatus }));

    const adName = performance.find(a => a.ad_id === adId)?.ad_name ?? adId;

    startTransition(async () => {
      const result = await toggleAdStatus(adId, newStatus);
      if (result.error) {
        setAdStatuses(prev => ({ ...prev, [adId]: currentStatus }));
        setApiError(`Toggle failed: ${result.error}`);
        setActionLog(prev =>
          addLogEntry(prev, {
            action: newStatus === 'PAUSED' ? 'pause' : 'activate',
            target: adName,
            details: `Failed to ${newStatus.toLowerCase()} ${adName}: ${result.error}`,
            result: 'error',
          })
        );
      } else {
        setActionLog(prev =>
          addLogEntry(prev, {
            action: newStatus === 'PAUSED' ? 'pause' : 'activate',
            target: adName,
            details: `${newStatus === 'PAUSED' ? 'Paused' : 'Activated'} ${adName}`,
            result: 'success',
          })
        );
      }
      setPendingToggle(null);
    });
  }

  // ── Analyze ──────────────────────────────────────────────────────────────────

  function handleAnalyze() {
    setAnalyzing(true);
    // Small delay for UX feedback
    setTimeout(() => {
      const result = analyzeAds(performance, DATE_LABELS[datePreset]);
      setAnalysisText(result.prose);
      setAnalyzing(false);
      setActionLog(prev =>
        addLogEntry(prev, {
          action:  'analysis_run',
          target:  `${performance.length} ads`,
          details: `Ran analysis for ${DATE_LABELS[datePreset]}`,
          result:  'success',
        })
      );
    }, 400);
  }

  // ── Wizard ────────────────────────────────────────────────────────────────────

  function openWizard() {
    setWizardOpen(true);
    setWizardStep(0);
    setWizardData(DEFAULT_WIZARD);
    setWizardLaunchResult(null);

    // Fetch images when opening
    setWizardImagesLoading(true);
    listAdImages().then(result => {
      setWizardImages(result.data);
      setWizardImagesLoading(false);
    });
  }

  function closeWizard() {
    setWizardOpen(false);
    document.body.style.overflow = '';
  }

  useEffect(() => {
    if (wizardOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [wizardOpen]);

  async function handleLaunchCampaign() {
    setWizardLaunching(true);
    const payload: CreateCampaignData = {
      campaignName:   wizardData.campaignName,
      dailyBudgetUSD: wizardData.dailyBudgetUSD,
      geoPreset:      wizardData.geoPreset,
      ageMin:         wizardData.ageMin,
      ageMax:         wizardData.ageMax,
      imageHash:      wizardData.imageHash,
      primaryText:    wizardData.primaryText,
      headline:       wizardData.headline,
      linkUrl:        wizardData.linkUrl,
      promoCode:      wizardData.promoCode,
    };

    const res = await createFullCampaign(payload);

    if (res.error) {
      setWizardLaunchResult({ error: res.error });
      setActionLog(prev =>
        addLogEntry(prev, {
          action:  'campaign_created',
          target:  wizardData.campaignName,
          details: `Failed to create campaign "${wizardData.campaignName}": ${res.error}`,
          result:  'error',
        })
      );
    } else {
      setWizardLaunchResult({ success: true });
      setActionLog(prev =>
        addLogEntry(prev, {
          action:  'campaign_created',
          target:  wizardData.campaignName,
          details: `Created campaign "${wizardData.campaignName}" (paused) — ${wizardData.geoPreset} geo`,
          result:  'success',
        })
      );
      // Refresh data after short delay
      setTimeout(() => fetchData(datePreset), 2000);
    }

    setWizardLaunching(false);
  }

  // ── Derived stats ─────────────────────────────────────────────────────────────

  const totalSpend    = performance.reduce((s, a) => s + a.spend, 0);
  const totalClicks   = performance.reduce((s, a) => s + a.clicks, 0);
  const avgCTR        = performance.length > 0
    ? performance.reduce((s, a) => s + a.ctr, 0) / performance.length
    : 0;
  const avgCPC        = performance.length > 0
    ? performance.reduce((s, a) => s + a.cpc, 0) / performance.length
    : 0;
  const bestPerformer = performance.length > 0
    ? performance.reduce((best, a) => a.ctr > best.ctr ? a : best, performance[0])
    : null;

  const recommendations = buildRecommendations(performance, adStatuses);

  // ── Render ────────────────────────────────────────────────────────────────────

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
              {/* Feature 1: Last updated indicator */}
              {lastUpdated && (
                <span className={styles.lastUpdated} aria-live="polite">
                  Updated {secondsAgo}s ago
                </span>
              )}

              {/* Feature 1: Refresh button with spin */}
              <button
                className={`${styles.refreshBtn} ${refreshSpin ? styles.refreshBtnSpin : ''}`}
                onClick={() => fetchData(datePreset)}
                disabled={loading}
                type="button"
                aria-label="Refresh data"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 13 13"
                  fill="none"
                  aria-hidden="true"
                  className={refreshSpin ? styles.spinIcon : ''}
                >
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

              {/* Feature 2: New Campaign button */}
              <button
                type="button"
                className={styles.newCampaignBtn}
                onClick={openWizard}
                aria-label="Create new campaign"
              >
                <span aria-hidden="true">＋</span>
                New Campaign
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
                      <th>7d Trend</th>
                      <th>CPC</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 10 }).map((_, j) => (
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
                        <td colSpan={10} className={styles.tableEmpty}>
                          No data available for this date range. Meta may still be in the learning phase.
                        </td>
                      </tr>
                    )}

                    {!loading && performance.map(ad => {
                      const liveStatus = adStatuses[ad.ad_id] ?? 'UNKNOWN';
                      const isActive   = liveStatus.toUpperCase() === 'ACTIVE';
                      const sparkData  = sparklines[ad.ad_id] ?? [];

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
                          {/* Feature 4: Sparkline */}
                          <td className={styles.cellSparkline}>
                            {sparklinesLoading ? (
                              <span className={styles.skeleton} style={{ width: '80px', height: '24px', display: 'block' }} />
                            ) : (
                              <Sparkline data={sparkData} width={80} height={24} />
                            )}
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
                    <span className={styles.skeleton} style={{ width: '150px', height: '14px', display: 'block', marginBottom: '10px' }} />
                    <span className={styles.skeleton} style={{ width: '100%', height: '50px', display: 'block' }} />
                  </div>
                )}

                {!loading && performance.length === 0 && (
                  <div className={styles.mobileCard}>
                    <p className={styles.tableEmpty}>No data available for this date range.</p>
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
              {/* Feature 3: Analyze button */}
              <button
                type="button"
                className={styles.analyzeBtn}
                onClick={handleAnalyze}
                disabled={analyzing || loading || performance.length === 0}
                aria-label="Run AI analysis"
              >
                {analyzing ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className={styles.spinIcon}>
                      <path d="M10 6A4 4 0 1 1 6 2M6 2l1.5 1.5L6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <><span aria-hidden="true">🔍</span> Analyze</>
                )}
              </button>
            </div>
            <div className={styles.panelBody}>
              {/* Feature 3: Prose analysis result */}
              {analysisText && (
                <div className={styles.analysisProse} aria-live="polite">
                  <p>{analysisText}</p>
                </div>
              )}

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

          {/* ── ACTION LOG ────────────────────────────────────────────────── */}
          <section className={styles.panel} aria-label="Action log">
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>
                <span className={styles.panelTitleIcon} aria-hidden="true">&#9679;</span>
                Action Log
              </h2>
              <span className={styles.lastUpdated}>{actionLog.length} entries</span>
            </div>
            <div className={styles.panelBody}>
              {actionLog.length === 0 ? (
                <div className={styles.recEmpty}>
                  No actions recorded yet. Pause an ad, run analysis, or create a campaign.
                </div>
              ) : (
                <>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left' }}>Time</th>
                          <th style={{ textAlign: 'left' }}>Action</th>
                          <th style={{ textAlign: 'left' }}>Description</th>
                          <th style={{ textAlign: 'center' }}>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {actionLog.map(entry => (
                          <tr key={entry.id}>
                            <td className={styles.cellMono} style={{ textAlign: 'left', whiteSpace: 'nowrap', fontSize: '12px', color: 'var(--d-text-dim)' }}>
                              {relativeTime(entry.timestamp)}
                            </td>
                            <td style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
                              <span className={styles.logActionBadge}>
                                <span aria-hidden="true">{ACTION_ICONS[entry.action]}</span>
                                <span className={styles.logActionLabel}>{entry.action.replace('_', ' ')}</span>
                              </span>
                            </td>
                            <td style={{ fontSize: '13px', color: 'var(--d-text)' }}>
                              {entry.details}
                            </td>
                            <td className={styles.cellAction}>
                              <span className={entry.result === 'success' ? styles.logResultSuccess : styles.logResultError}>
                                {entry.result === 'success' ? '✓' : '✗'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className={styles.logFooter}>
                    <button
                      type="button"
                      className={styles.clearLogBtn}
                      onClick={() => {
                        setActionLog([]);
                        saveLog([]);
                      }}
                    >
                      Clear log
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>

        </div>
      </div>

      {/* ── CAMPAIGN WIZARD OVERLAY ────────────────────────────────────── */}
      {wizardOpen && (
        <div
          className={styles.wizardOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="New campaign wizard"
          onClick={e => { if (e.target === e.currentTarget) closeWizard(); }}
        >
          <div className={styles.wizardPanel}>
            {/* Header */}
            <div className={styles.wizardHeader}>
              <h2 className={styles.wizardTitle}>New Campaign</h2>
              <button
                type="button"
                className={styles.wizardClose}
                onClick={closeWizard}
                aria-label="Close wizard"
              >
                ✕
              </button>
            </div>

            {/* Step dots */}
            <div className={styles.wizardSteps} role="tablist">
              {WIZARD_STEPS.map((step, i) => (
                <div
                  key={step}
                  className={`${styles.wizardStepDot} ${i === wizardStep ? styles.wizardStepDotActive : ''} ${i < wizardStep ? styles.wizardStepDotDone : ''}`}
                  role="tab"
                  aria-selected={i === wizardStep}
                  aria-label={`Step ${i + 1}: ${step}`}
                >
                  <span className={styles.wizardStepNum}>{i < wizardStep ? '✓' : i + 1}</span>
                  <span className={styles.wizardStepLabel}>{step}</span>
                </div>
              ))}
            </div>

            {/* Step content */}
            <div className={styles.wizardBody}>
              {wizardStep === 0 && (
                <WizardStep1
                  data={wizardData}
                  onChange={d => setWizardData(prev => ({ ...prev, ...d }))}
                />
              )}
              {wizardStep === 1 && (
                <WizardStep2
                  data={wizardData}
                  onChange={d => setWizardData(prev => ({ ...prev, ...d }))}
                />
              )}
              {wizardStep === 2 && (
                <WizardStep3
                  data={wizardData}
                  images={wizardImages}
                  imagesLoading={wizardImagesLoading}
                  onChange={d => setWizardData(prev => ({ ...prev, ...d }))}
                />
              )}
              {wizardStep === 3 && (
                <WizardStep4
                  data={wizardData}
                  launching={wizardLaunching}
                  launchResult={wizardLaunchResult}
                  onLaunch={handleLaunchCampaign}
                />
              )}
            </div>

            {/* Footer nav */}
            <div className={styles.wizardFooter}>
              {wizardStep > 0 && !wizardLaunchResult && (
                <button
                  type="button"
                  className={styles.wizardBackBtn}
                  onClick={() => setWizardStep(s => s - 1)}
                  disabled={wizardLaunching}
                >
                  ← Back
                </button>
              )}
              <div style={{ flex: 1 }} />
              {wizardStep < WIZARD_STEPS.length - 1 && (
                <button
                  type="button"
                  className={styles.wizardNextBtn}
                  onClick={() => setWizardStep(s => s + 1)}
                  disabled={wizardStep === 0 && !wizardData.campaignName.trim()}
                >
                  Next →
                </button>
              )}
              {wizardLaunchResult && (
                <button
                  type="button"
                  className={styles.wizardNextBtn}
                  onClick={closeWizard}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
