'use client';

/**
 * TeaserClient — the results teaser page rendered after a channel analysis completes.
 *
 * Zones:
 *   R-A  Grade Hero      — Avatar, channel name, giant grade letter, scroll chevron
 *   R-B  Score Cards     — Top 3 visible / bottom 3 blurred + radar chart
 *   R-C  Insight         — First sentence visible, rest blurred
 *   R-D  Blur Wall       — 3 locked deep-dive cards
 *   R-E  CTA             — "Book a Free Strategy Call"
 */

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { TeaserData, TeaserScore } from '@/lib/actions/results';
import styles from './teaser.module.css';
import RadarChart from './RadarChart';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  data: TeaserData;
  publicId: string;
}

// ── Grade helpers ─────────────────────────────────────────────────────────────

const GRADE_COLORS: Record<string, string> = {
  'S': '#c8ff2e',
  'A+': '#34D399', 'A': '#34D399', 'A-': '#34D399',
  'B+': '#FBBF24', 'B': '#FBBF24', 'B-': '#FBBF24',
  'C+': '#FB923C', 'C': '#FB923C', 'C-': '#FB923C',
  'D+': '#F87171', 'D': '#F87171', 'D-': '#F87171',
  'F':  '#F87171',
};

function gradeColor(grade: string): string {
  return GRADE_COLORS[grade] ?? '#c8ff2e';
}

// ── Score helpers ─────────────────────────────────────────────────────────────

function scoreLetter(value: number): string {
  if (value >= 90) return 'S';
  if (value >= 80) return 'A';
  if (value >= 70) return 'A-';
  if (value >= 60) return 'B';
  if (value >= 50) return 'B-';
  if (value >= 40) return 'C';
  if (value >= 30) return 'D';
  return 'F';
}

function scoreBadgeColor(value: number): string {
  if (value >= 90) return '#c8ff2e';
  if (value >= 70) return '#34D399';
  if (value >= 50) return '#FBBF24';
  if (value >= 30) return '#FB923C';
  return '#F87171';
}

// ── Score dimension icons (inline SVG) ───────────────────────────────────────

const SCORE_ICONS: Record<string, React.ReactNode> = {
  score_content_consistency: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="4" height="18" rx="1"/>
      <rect x="10" y="8" width="4" height="13" rx="1"/>
      <rect x="17" y="12" width="4" height="9" rx="1"/>
    </svg>
  ),
  score_title_quality: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7V4h16v3"/>
      <path d="M9 20h6"/>
      <path d="M12 4v16"/>
    </svg>
  ),
  score_thumbnail_patterns: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <path d="M21 15l-5-5L5 21"/>
    </svg>
  ),
  score_engagement_health: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  score_growth_trajectory: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 6l-9.5 9.5-5-5L1 18"/>
      <path d="M17 6h6v6"/>
    </svg>
  ),
  score_outlier_detection: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
};

const SCORE_DESCRIPTIONS: Record<string, string> = {
  score_content_consistency: 'Upload frequency, format cohesion, and topic focus.',
  score_title_quality:       'SEO potency, curiosity gap, and click-through power.',
  score_thumbnail_patterns:  'Visual consistency, text legibility, and CTR signals.',
  score_engagement_health:   'Like ratio, comment depth, and audience interaction.',
  score_growth_trajectory:   'Subscriber velocity, view momentum, and trend alignment.',
  score_outlier_detection:   'Breakout video detection and repeatability potential.',
};

// ── Scroll reveal hook ────────────────────────────────────────────────────────

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// ── Radar scores mapper ───────────────────────────────────────────────────────

function mapScoresToRadar(scores: TeaserScore[]) {
  const get = (key: string) => scores.find(s => s.key === key)?.value ?? 50;
  return {
    content:    get('score_content_consistency'),
    titles:     get('score_title_quality'),
    thumbnails: get('score_thumbnail_patterns'),
    engagement: get('score_engagement_health'),
    growth:     get('score_growth_trajectory'),
    outliers:   get('score_outlier_detection'),
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreCard({ score, index }: { score: TeaserScore; index: number }) {
  const { ref, visible } = useReveal();
  const color = scoreBadgeColor(score.value);
  const letter = scoreLetter(score.value);

  if (!score.visible) {
    // Blurred card
    return (
      <div
        ref={ref}
        className={[
          styles.scoreCardWrapper,
          visible ? styles.scoreCardReveal : '',
        ].filter(Boolean).join(' ')}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className={`${styles.scoreCard} ${styles.scoreCardBlurred}`} aria-hidden="true">
          <div className={styles.scoreCardHead}>
            <div className={styles.scoreCardIcon}>
              {SCORE_ICONS[score.key]}
            </div>
            <div
              className={styles.scoreBadge}
              style={{ '--badge-color': color } as React.CSSProperties}
            >
              <span className={styles.scoreBadgeValue}>{score.value}</span>
              <span className={styles.scoreBadgeSep}>/100</span>
              <span className={styles.scoreBadgeLetter}>{letter}</span>
            </div>
          </div>
          <p className={styles.scoreCardTitle}>{score.label}</p>
          <p className={styles.scoreCardDesc}>
            {SCORE_DESCRIPTIONS[score.key] ?? 'Detailed analysis available in full report.'}
          </p>
        </div>
        <div className={styles.scoreCardLockOverlay} aria-label="Locked — full report required">
          <svg className={styles.scoreCardLockIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span className={styles.scoreCardLockText}>Full report</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={[
        styles.scoreCardWrapper,
        visible ? styles.scoreCardReveal : '',
      ].filter(Boolean).join(' ')}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={styles.scoreCard}>
        <div className={styles.scoreCardHead}>
          <div className={styles.scoreCardIcon}>
            {SCORE_ICONS[score.key]}
          </div>
          <div
            className={styles.scoreBadge}
            style={{ '--badge-color': color } as React.CSSProperties}
          >
            <span className={styles.scoreBadgeValue}>{score.value}</span>
            <span className={styles.scoreBadgeSep}>/100</span>
            <span className={styles.scoreBadgeLetter}>{letter}</span>
          </div>
        </div>
        <p className={styles.scoreCardTitle}>{score.label}</p>
        <p className={styles.scoreCardDesc}>
          {SCORE_DESCRIPTIONS[score.key] ?? 'Detailed analysis available in full report.'}
        </p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TeaserClient({ data, publicId: _publicId }: Props) {
  const color = gradeColor(data.overallGrade);
  const radarScores = mapScoresToRadar(data.scores);

  const { ref: scoresRef, visible: scoresVisible } = useReveal();
  const { ref: insightRef, visible: insightVisible } = useReveal();
  const { ref: blurRef, visible: blurVisible } = useReveal();
  const { ref: ctaRef, visible: ctaVisible } = useReveal();

  return (
    <div
      className={styles.page}
      style={{ '--grade-color': color } as React.CSSProperties}
    >

      {/* ── Zone R-A: Grade Hero ─────────────────────────────────────────── */}
      <section className={styles.gradeHero} aria-label="Channel grade">
        <div className={styles.gradeHeroBg} aria-hidden="true" />

        <div className={styles.gradeHeroInner}>

          {/* Channel avatar */}
          {data.channelThumbnail ? (
            <Image
              src={data.channelThumbnail}
              alt={`${data.channelName} channel avatar`}
              width={80}
              height={80}
              className={styles.channelAvatar}
              priority
            />
          ) : (
            <div className={styles.channelAvatarFallback} aria-hidden="true">
              <span className={styles.channelAvatarFallbackLetter}>
                {data.channelName.charAt(0)}
              </span>
            </div>
          )}

          {/* Channel name */}
          <p className={styles.channelName}>{data.channelName}</p>

          {/* The grade */}
          <div
            className={styles.gradeDisplay}
            style={{ '--grade-color': color } as React.CSSProperties}
            aria-label={`Overall grade: ${data.overallGrade}`}
          >
            {data.overallGrade}
          </div>

          <p className={styles.gradeLabel}>Overall Channel Grade</p>
        </div>

        {/* Scroll chevron */}
        <div className={styles.scrollIndicator} aria-hidden="true">
          <svg
            className={styles.scrollChevron}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </section>

      {/* ── Zone R-B: Score Cards ────────────────────────────────────────── */}
      <section
        className={`${styles.section} ${styles.scoresSection}`}
        ref={scoresRef}
        aria-label="Score breakdown"
        style={{ opacity: scoresVisible ? 1 : 0, transition: 'opacity 0.4s var(--az-ease)' }}
      >
        <div className={styles.sectionHeader}>
          <div className={styles.sectionEyebrow}>
            <span className={styles.sectionEyebrowDot} aria-hidden="true" />
            Your Scores
          </div>
        </div>

        <div className={styles.scoresGrid}>
          {data.scores.map((score, i) => (
            <ScoreCard key={score.key} score={score} index={i} />
          ))}
        </div>
      </section>

      {/* ── Radar + Insight row ──────────────────────────────────────────── */}
      <div
        className={`${styles.section} ${styles.radarInsightRow}`}
        ref={insightRef}
        style={{ opacity: insightVisible ? 1 : 0, transition: 'opacity 0.5s var(--az-ease) 0.1s' }}
      >
        {/* Radar chart */}
        <div className={styles.radarWrap} aria-label="Score radar chart">
          <RadarChart scores={radarScores} size={260} />
          <p className={styles.radarLabel}>Performance radar</p>
        </div>

        {/* Zone R-C: Insight card */}
        <div className={styles.insightCard} aria-label="Key insight">
          <span className={styles.insightEyebrow}>Key Insight</span>

          <div
            className={styles.insightTextVisible}
            dangerouslySetInnerHTML={{
              __html: data.insight
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br/>')
            }}
          />
        </div>
      </div>

      {/* Zone R-D: Blur Wall — hidden for testing */}

      {/* ── Zone R-E: CTA ────────────────────────────────────────────────── */}
      <section
        className={`${styles.section} ${styles.ctaSection}`}
        ref={ctaRef}
        aria-label="Book a strategy call"
        style={{ opacity: ctaVisible ? 1 : 0, transition: 'opacity 0.5s var(--az-ease) 0.15s' }}
      >
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaHeadline}>
            See Everything.<br />Fix What Matters.
          </h2>

          <ul className={styles.ctaChecklist} aria-label="What&apos;s in the full report">
            {[
              'All 6 scores with specific, actionable fixes',
              'Competitor breakdown and your positioning gap',
              'A 90-day content roadmap tailored to your channel',
            ].map(item => (
              <li key={item} className={styles.ctaCheckItem}>
                <svg className={styles.ctaCheckIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <a
            href="#"
            className={styles.ctaBtn}
            aria-label="Book a free 30-minute strategy call"
          >
            Book a Free Strategy Call
            <svg className={styles.ctaBtnArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>

          <p className={styles.ctaTrust}>
            Free. 30 minutes. No pitch unless you ask.
          </p>
        </div>
      </section>

    </div>
  );
}
