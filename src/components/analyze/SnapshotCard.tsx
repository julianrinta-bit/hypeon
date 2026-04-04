'use client';

import { useState, useEffect } from 'react';
import type { ChannelSnapshot } from '@/lib/actions/snapshot';
import styles from './SnapshotCard.module.css';

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1_000)}K`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatSubscribers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M subscribers`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K subscribers`;
  return `${n} subscribers`;
}

// ── Component ────────────────────────────────────────────────────────────────

interface SnapshotCardProps {
  snapshot: ChannelSnapshot;
  onEmailSubmit: (email: string) => void;
  emailSubmitting?: boolean;
  promoCode?: string | null;
}

export default function SnapshotCard({ snapshot, onEmailSubmit, emailSubmitting, promoCode }: SnapshotCardProps) {
  const {
    name,
    handle,
    thumbnail,
    subscriberCount,
    contentLeverageFormatted,
    subscriberConversion,
    uploadVelocityPerMonth,
    totalVideos,
    channelAgeFormatted,
    painLabel,
    painValue,
    painSubLabel,
    insightDiagnosis,
    insightQuestion,
  } = snapshot;

  // Subscriber conversion: "1 per X views"
  const conversionDivisor = subscriberConversion > 0
    ? Math.round(subscriberConversion)
    : 0;

  // Delayed reveal — creates the perception of analysis
  const [showInsights, setShowInsights] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setShowInsights(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.card}>

      {/* Header: avatar + channel info */}
      <div className={styles.header}>
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={`${name} channel avatar`}
            className={styles.avatar}
            width={48}
            height={48}
          />
        ) : (
          <div className={styles.avatarPlaceholder} aria-hidden="true" />
        )}
        <div className={styles.channelInfo}>
          <div className={styles.channelName}>{name}</div>
          <div className={styles.channelMeta}>
            {handle && <span>{handle}</span>}
            {handle && <span className={styles.metaDot}> · </span>}
            <span>{formatSubscribers(subscriberCount)}</span>
          </div>
        </div>
      </div>

      {/* 2x2 metrics grid */}
      <div className={styles.metricsGrid}>

        {/* Tile 1: Content Leverage */}
        <div className={styles.metricTile}>
          <div className={styles.metricLabel}>Content Leverage</div>
          <div className={styles.metricValue}>{contentLeverageFormatted}</div>
          <div className={styles.metricSub}>avg views per upload</div>
        </div>

        {/* Tile 2: Subscriber Conversion */}
        <div className={styles.metricTile}>
          <div className={styles.metricLabel}>Subscriber Conversion</div>
          <div className={styles.metricValue}>
            {conversionDivisor > 0 ? (
              <>1 per <span className={styles.metricValueUnit}>{formatNumber(conversionDivisor)}</span></>
            ) : '—'}
          </div>
          <div className={styles.metricSub}>views to gain a subscriber</div>
        </div>

        {/* Tile 3: Upload Velocity */}
        <div className={styles.metricTile}>
          <div className={styles.metricLabel}>Upload Velocity</div>
          <div className={styles.metricValue}>
            {uploadVelocityPerMonth >= 1
              ? `${uploadVelocityPerMonth}/mo`
              : `${(uploadVelocityPerMonth * 4.33).toFixed(1)}/wk`}
          </div>
          <div className={styles.metricSub}>
            {formatNumber(totalVideos)} vids · {channelAgeFormatted}
          </div>
        </div>

        {/* Tile 4: Pain indicator */}
        <div className={styles.painTile}>
          <div className={styles.painLabel}>{painLabel}</div>
          <div className={styles.painValue}>{painValue}</div>
          <div className={styles.painSub}>{painSubLabel}</div>
        </div>

      </div>

      {/* Loading indicator before insights appear */}
      {!showInsights && (
        <div className={styles.insightsLoading}>
          <span className={styles.insightsSpinner} aria-hidden="true" />
          <span>Reviewing channel patterns...</span>
        </div>
      )}

      {/* Expert insights — revealed 6 seconds after render */}
      {showInsights && (
        <div className={styles.insightsBlock}>
          <span className={styles.insightsLabel}>Quick take:</span>
          <p className={styles.insightDiagnosis}>
            &ldquo;{insightDiagnosis}&rdquo;
          </p>
          <p className={styles.insightQuestion}>
            &ldquo;{insightQuestion}&rdquo;
          </p>

          {/* Inline email capture — appears with insights */}
          <div className={styles.emailCapture}>
            <div className={styles.emailRow}>
              <input
                type="email"
                className={styles.emailInput}
                value={emailValue}
                onChange={e => setEmailValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') onEmailSubmit(emailValue); }}
                placeholder="you@company.com"
                autoComplete="email"
                aria-label="Email for your audit"
                disabled={emailSubmitting}
              />
              <button
                className={styles.emailBtn}
                onClick={() => onEmailSubmit(emailValue)}
                disabled={emailSubmitting}
                type="button"
              >
                {emailSubmitting ? 'Sending...' : 'Send Me the Full Audit'}
              </button>
            </div>
            {promoCode && (
              <p className={styles.promoBadge}>Complimentary access — code {promoCode}</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
