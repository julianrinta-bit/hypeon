'use client';

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
}

export default function SnapshotCard({ snapshot }: SnapshotCardProps) {
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
  } = snapshot;

  // Subscriber conversion: "1 per X views"
  const conversionDivisor = subscriberConversion > 0
    ? Math.round(subscriberConversion)
    : 0;

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

      {/* Footer */}
      <p className={styles.footer}>
        Surface-level snapshot. Your full audit goes deeper.
      </p>

    </div>
  );
}
