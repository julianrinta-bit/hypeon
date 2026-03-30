'use client';

/**
 * TeaserClient — the results teaser page rendered after a channel analysis completes.
 *
 * Zones:
 *   R-A  Grade Hero      — Avatar, channel name, giant grade letter, scroll chevron
 *   R-B  Score Cards     — All 6 visible (testing mode) + radar chart
 *   R-C  Insight         — Full recommendation visible
 *   R-F  Outlier Analysis — Overperformers + underperformers
 *   R-G  Hook Mastery    — Deep dive: hook rewrites
 *   R-H  Title Lab       — Deep dive: title alternatives
 *   R-I  Content Gaps    — Deep dive: content gap grid
 *   R-J  Competitor PB   — Deep dive: competitor breakdowns
 *   R-E  CTA             — "Book a Free Strategy Call"
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import type {
  TeaserData,
  TeaserScore,
  OutlierVideo,
  HookRewrite,
  TitleAlternative,
  CompetitorBreakdown,
  ContentGap,
} from '@/lib/actions/results';
import styles from './teaser.module.css';
import RadarChart from './RadarChart';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  data: TeaserData;
  publicId: string;
}

// ── Countdown hook ────────────────────────────────────────────────────────────

function useCountdown(expiresAt: string) {
  const getRemaining = useCallback(() => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return null;
    const totalMinutes = Math.floor(diff / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
  }, [expiresAt]);

  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining()), 60000);
    return () => clearInterval(id);
  }, [getRemaining]);

  return remaining;
}

// ── CTA Button (shared) ───────────────────────────────────────────────────────

function CtaButton({ label }: { label: string }) {
  return (
    <a
      href="#"
      className={styles.ctaBtn}
      aria-label="Book a free strategy call to receive the full PDF"
    >
      {label}
      <svg className={styles.ctaBtnArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </a>
  );
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

// ── Markdown renderer (inline bold + line breaks) ─────────────────────────────

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
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

// ── Outlier card ──────────────────────────────────────────────────────────────

function OutlierCard({ video, type }: { video: OutlierVideo; type: 'over' | 'under' }) {
  const pct = type === 'over' ? video.percent_above_avg : video.percent_below_avg;
  const color = type === 'over' ? '#34D399' : '#F87171';
  const sign = type === 'over' ? '+' : '-';

  return (
    <div className={styles.outlierCard}>
      <div className={styles.outlierCardHead}>
        <p className={styles.outlierTitle}>{video.title}</p>
        {pct != null && (
          <span
            className={styles.outlierBadge}
            style={{ '--outlier-color': color } as React.CSSProperties}
          >
            {sign}{Math.round(pct)}% avg
          </span>
        )}
      </div>
      <p
        className={styles.outlierExplanation}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(video.explanation) }}
      />
    </div>
  );
}

// ── Hook rewrite row ──────────────────────────────────────────────────────────

function HookRow({ rewrite, index }: { rewrite: HookRewrite; index: number }) {
  return (
    <div className={styles.hookRow} style={{ animationDelay: `${index * 60}ms` }}>
      <div className={styles.hookOriginal}>
        <span className={styles.hookLabel}>Original</span>
        <p
          className={styles.hookOriginalText}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(rewrite.original_hook) }}
        />
      </div>
      <div className={styles.hookArrow} aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
      <div className={styles.hookRewritten}>
        <span className={styles.hookLabel}>Rewritten</span>
        <p
          className={styles.hookRewrittenText}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(rewrite.rewritten_hook) }}
        />
      </div>
      <div className={styles.hookRationale}>
        <span className={styles.hookRationaleLabel}>Why it works</span>
        <p
          dangerouslySetInnerHTML={{ __html: renderMarkdown(rewrite.improvement_rationale) }}
        />
      </div>
    </div>
  );
}

// ── Title alternative card ────────────────────────────────────────────────────

function TitleCard({ item }: { item: TitleAlternative }) {
  return (
    <div className={styles.titleCard}>
      <div className={styles.titleCardOriginal}>
        <span className={styles.titleCardOriginalLabel}>Original</span>
        <p className={styles.titleCardOriginalText}>{item.original_title}</p>
      </div>
      <ul className={styles.titleAltList}>
        {item.alternatives.map((alt, i) => (
          <li key={i} className={styles.titleAltItem}>
            <svg className={styles.titleAltIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <span dangerouslySetInnerHTML={{ __html: renderMarkdown(alt) }} />
          </li>
        ))}
      </ul>
      {item.predicted_improvement && (
        <span className={styles.titleImprovementBadge}>
          {item.predicted_improvement}
        </span>
      )}
    </div>
  );
}

// ── Content gap card ──────────────────────────────────────────────────────────

function ContentGapCard({ gap }: { gap: ContentGap }) {
  const priorityColor = gap.priority >= 8 ? '#F87171' : gap.priority >= 5 ? '#FBBF24' : '#34D399';
  const difficultyColor = gap.difficulty?.toLowerCase() === 'hard' ? '#F87171'
    : gap.difficulty?.toLowerCase() === 'medium' ? '#FBBF24' : '#34D399';

  return (
    <div className={styles.gapCard}>
      <div className={styles.gapCardBadges}>
        <span
          className={styles.gapPriorityBadge}
          style={{ '--priority-color': priorityColor } as React.CSSProperties}
        >
          P{gap.priority}
        </span>
        <span
          className={styles.gapDifficultyBadge}
          style={{ '--difficulty-color': difficultyColor } as React.CSSProperties}
        >
          {gap.difficulty}
        </span>
        {gap.estimated_monthly_views > 0 && (
          <span className={styles.gapViewsBadge}>
            ~{gap.estimated_monthly_views >= 1000
              ? `${Math.round(gap.estimated_monthly_views / 1000)}K`
              : gap.estimated_monthly_views} views/mo
          </span>
        )}
      </div>
      <p className={styles.gapTopic}>{gap.topic}</p>
      <p
        className={styles.gapAngle}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(gap.content_angle) }}
      />
    </div>
  );
}

// ── Competitor breakdown card ─────────────────────────────────────────────────

function CompetitorCard({ breakdown }: { breakdown: CompetitorBreakdown }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.competitorCard}>
      <div className={styles.competitorCardHead}>
        <span className={styles.competitorName}>{breakdown.competitor_name}</span>
        <p className={styles.competitorVideoTitle}>{breakdown.video_title}</p>
      </div>
      <p
        className={styles.competitorTakeaway}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(breakdown.key_takeaway) }}
      />
      {breakdown.applicable_to_user && (
        <div className={styles.competitorApplicable}>
          <span className={styles.competitorApplicableLabel}>Applies to you</span>
          <p dangerouslySetInnerHTML={{ __html: renderMarkdown(breakdown.applicable_to_user) }} />
        </div>
      )}
      {breakdown.structure_analysis && (
        <div className={styles.competitorExpand}>
          <button
            className={styles.competitorExpandBtn}
            onClick={() => setExpanded(e => !e)}
            aria-expanded={expanded}
          >
            {expanded ? 'Hide' : 'Show'} structure analysis
            <svg
              className={[styles.competitorExpandChevron, expanded ? styles.competitorExpandChevronOpen : ''].filter(Boolean).join(' ')}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          {expanded && (
            <p
              className={styles.competitorStructureText}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(breakdown.structure_analysis) }}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Section wrapper with reveal ───────────────────────────────────────────────

function RevealSection({ children, className, 'aria-label': ariaLabel }: { children: React.ReactNode; className?: string; 'aria-label'?: string }) {
  const { ref, visible } = useReveal(0.08);
  return (
    <section
      ref={ref}
      className={[styles.section, className].filter(Boolean).join(' ')}
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s var(--az-ease) 0.05s' }}
      aria-label={ariaLabel}
    >
      {children}
    </section>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TeaserClient({ data, publicId: _publicId }: Props) {
  const color = gradeColor(data.overallGrade);
  const radarScores = mapScoresToRadar(data.scores);
  const remaining = useCountdown(data.expiresAt);

  const { ref: scoresRef, visible: scoresVisible } = useReveal();
  const { ref: insightRef, visible: insightVisible } = useReveal();
  const { ref: ctaRef, visible: ctaVisible } = useReveal();

  // Tab visibility blur
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    const handleVisibility = () => setIsBlurred(document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const hasOutliers = data.outliers &&
    ((data.outliers.overperformers?.length ?? 0) > 0 ||
     (data.outliers.underperformers?.length ?? 0) > 0);

  const hasHooks = (data.deepDives.hook_mastery?.rewrites?.length ?? 0) > 0;
  const hasTitles = (data.deepDives.title_laboratory?.alternatives?.length ?? 0) > 0;
  const hasGaps = (data.deepDives.content_gaps?.gaps?.length ?? 0) > 0;
  const hasCompetitors = (data.deepDives.competitor_playbook?.breakdowns?.length ?? 0) > 0;

  // Watermark rows: repeat the email in a grid pattern
  const watermarkText = data.userEmail ?? 'hypeon.media';
  const watermarkRepeat = Array.from({ length: 80 }, (_, i) => (
    <span key={i} className={styles.watermarkItem}>{watermarkText}</span>
  ));

  // Countdown display — null means expired (client-side)
  const countdownLabel = remaining
    ? `Report expires in ${remaining.hours}h ${remaining.minutes}m`
    : 'Report has expired';

  return (
    <div
      className={[
        styles.page,
        isBlurred ? styles.pageBlurred : '',
      ].filter(Boolean).join(' ')}
      style={{ '--grade-color': color } as React.CSSProperties}
      onContextMenu={e => e.preventDefault()}
      onCopy={e => e.preventDefault()}
    >

      {/* ── Watermark overlay ─────────────────────────────────────────── */}
      <div className={styles.watermarkOverlay} aria-hidden="true">
        {watermarkRepeat}
      </div>

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

          {/* Countdown timer */}
          <p className={styles.countdownTimer} aria-live="polite">
            {countdownLabel}
          </p>

          {/* Top CTA */}
          <CtaButton label="To discuss your strategy and receive the full PDF — Book a Free Call" />

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
              __html: renderMarkdown(data.insight)
            }}
          />
        </div>
      </div>

      {/* ── Zone R-F: Outlier Analysis ───────────────────────────────────── */}
      {hasOutliers && (
        <RevealSection aria-label="Outlier analysis">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>
              <span className={styles.sectionEyebrowDot} aria-hidden="true" />
              Outlier Analysis
            </div>
          </div>

          <div className={styles.outlierGrid}>
            {/* Overperformers */}
            <div className={styles.outlierColumn}>
              <h3 className={styles.outlierColumnTitle}>
                <span className={styles.outlierColumnDot} style={{ background: '#34D399' }} />
                Overperformers
              </h3>
              <div className={styles.outlierList}>
                {(data.outliers!.overperformers ?? []).map((v, i) => (
                  <OutlierCard key={i} video={v} type="over" />
                ))}
                {(data.outliers!.overperformers ?? []).length === 0 && (
                  <p className={styles.outlierEmpty}>No overperformers detected.</p>
                )}
              </div>
            </div>

            {/* Underperformers */}
            <div className={styles.outlierColumn}>
              <h3 className={styles.outlierColumnTitle}>
                <span className={styles.outlierColumnDot} style={{ background: '#F87171' }} />
                Underperformers
              </h3>
              <div className={styles.outlierList}>
                {(data.outliers!.underperformers ?? []).map((v, i) => (
                  <OutlierCard key={i} video={v} type="under" />
                ))}
                {(data.outliers!.underperformers ?? []).length === 0 && (
                  <p className={styles.outlierEmpty}>No underperformers detected.</p>
                )}
              </div>
            </div>
          </div>
        </RevealSection>
      )}

      {/* ── Zone R-G: Hook Mastery ───────────────────────────────────────── */}
      {hasHooks && (
        <RevealSection aria-label="Hook mastery deep dive">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>
              <span className={styles.sectionEyebrowDot} aria-hidden="true" />
              Hook Mastery
            </div>
          </div>
          <p className={styles.sectionSubhead}>
            Your existing hooks, rewritten for maximum retention.
          </p>
          <div className={styles.hookList}>
            {data.deepDives.hook_mastery!.rewrites.map((r, i) => (
              <HookRow key={i} rewrite={r} index={i} />
            ))}
          </div>
        </RevealSection>
      )}

      {/* ── Zone R-H: Title Laboratory ───────────────────────────────────── */}
      {hasTitles && (
        <RevealSection aria-label="Title laboratory deep dive">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>
              <span className={styles.sectionEyebrowDot} aria-hidden="true" />
              Title Laboratory
            </div>
          </div>
          <p className={styles.sectionSubhead}>
            Alternative titles engineered for higher click-through rate.
          </p>
          <div className={styles.titleGrid}>
            {data.deepDives.title_laboratory!.alternatives.map((item, i) => (
              <TitleCard key={i} item={item} />
            ))}
          </div>
        </RevealSection>
      )}

      {/* ── Zone R-I: Content Gaps ───────────────────────────────────────── */}
      {hasGaps && (
        <RevealSection aria-label="Content gaps deep dive">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>
              <span className={styles.sectionEyebrowDot} aria-hidden="true" />
              Content Gaps
            </div>
          </div>
          <p className={styles.sectionSubhead}>
            High-opportunity topics your channel is not covering yet.
          </p>
          <div className={styles.gapGrid}>
            {data.deepDives.content_gaps!.gaps.map((gap, i) => (
              <ContentGapCard key={i} gap={gap} />
            ))}
          </div>
        </RevealSection>
      )}

      {/* ── Zone R-J: Competitor Playbook ────────────────────────────────── */}
      {hasCompetitors && (
        <RevealSection aria-label="Competitor playbook deep dive">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>
              <span className={styles.sectionEyebrowDot} aria-hidden="true" />
              Competitor Playbook
            </div>
          </div>
          <p className={styles.sectionSubhead}>
            What your competitors are doing — and how to outmaneuver them.
          </p>
          <div className={styles.competitorList}>
            {data.deepDives.competitor_playbook!.breakdowns.map((b, i) => (
              <CompetitorCard key={i} breakdown={b} />
            ))}
          </div>
        </RevealSection>
      )}

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

          <CtaButton label="To discuss your strategy and receive the full PDF — Book a Free Call" />

          <p className={styles.ctaTrust}>
            Free. 30 minutes. No pitch unless you ask.
          </p>
        </div>
      </section>

    </div>
  );
}
