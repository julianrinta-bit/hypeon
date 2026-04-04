'use client';

import type { ChannelSnapshot } from '@/lib/actions/snapshot';
import styles from './SnapshotCard.module.css';

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatSubscribers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M subs`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K subs`;
  return `${n} subs`;
}

function formatAge(months: number): string {
  if (months >= 24) return `${(months / 12).toFixed(1)} years`;
  if (months >= 12) return `${Math.floor(months / 12)}yr ${months % 12}mo`;
  return `${months} months`;
}

function formatViewsPerSub(ratio: number): string {
  return `${ratio.toLocaleString()}:1`;
}

function formatPace(videosPerMonth: number, label: string): string {
  const weekly = videosPerMonth / 4.33;
  if (weekly >= 1) return `${weekly.toFixed(1)}/wk · ${label}`;
  return `${videosPerMonth.toFixed(1)}/mo · ${label}`;
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
    channelAgeMonths,
    videosPerMonth,
    viewsPerSubscriber,
    paceLabel,
    recencyLabel,
  } = snapshot;

  const pacePillClass = [
    styles.pacePill,
    styles[paceLabel.toLowerCase()],
  ].join(' ');

  const recencyPillClass = [
    styles.pacePill,
    styles[recencyLabel.toLowerCase()],
  ].join(' ');

  return (
    <div className={styles.card}>
      {/* Top row */}
      <div className={styles.topRow}>
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
          <div className={styles.avatar} aria-hidden="true" />
        )}
        <div className={styles.channelInfo}>
          <div className={styles.channelName}>{name}</div>
          {handle && <div className={styles.channelHandle}>{handle}</div>}
        </div>
        <div className={styles.subCount}>{formatSubscribers(subscriberCount)}</div>
      </div>

      {/* 2x2 metric grid */}
      <div className={styles.metricGrid}>
        {/* Channel Age */}
        <div className={styles.metricCell}>
          <div className={styles.metricLabel}>Channel Age</div>
          <div className={styles.metricValue}>{formatAge(channelAgeMonths)}</div>
        </div>

        {/* Upload Pace */}
        <div className={styles.metricCell}>
          <div className={styles.metricLabel}>Upload Pace</div>
          <div className={styles.metricValue}>
            {videosPerMonth >= 4.33
              ? `${(videosPerMonth / 4.33).toFixed(1)}/wk`
              : `${videosPerMonth.toFixed(1)}/mo`}
          </div>
          <div className={styles.metricSub}>
            <span className={pacePillClass}>{paceLabel}</span>
          </div>
        </div>

        {/* Views / Sub */}
        <div className={styles.metricCell}>
          <div className={styles.metricLabel}>Views / Subscriber</div>
          <div className={styles.metricValue}>{formatViewsPerSub(viewsPerSubscriber)}</div>
        </div>

        {/* Recency */}
        <div className={styles.metricCell}>
          <div className={styles.metricLabel}>Channel Status</div>
          <div className={styles.metricValue}>{recencyLabel}</div>
          <div className={styles.metricSub}>
            <span className={recencyPillClass}>{recencyLabel}</span>
          </div>
        </div>
      </div>

      <p className={styles.footerNote}>
        Surface-level snapshot based on public data.
      </p>
    </div>
  );
}
