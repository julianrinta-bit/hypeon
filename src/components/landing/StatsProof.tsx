'use client';

/**
 * StatsProof.tsx — Fase 2.1
 * Replaces AnalyticsDashboard.tsx (file kept intact).
 * Uses .section--white, CountUp + IntersectionObserver from AnalyticsDashboard,
 * and a scaleX border-top animation on each card.
 *
 * WCAG contraste:
 *  - Numbers: --fg-dark (#111) over white → ~17:1 ✓
 *  - Labels:  --fg-dark-mid (#444) over white → ~9.7:1 ✓
 *  - Sub-labels: --fg-dark-muted (#888) over white → ~3.5:1 — used only
 *    on decorative eyebrow labels (< 18px bold is WCAG "large text" at 14px bold)
 *  - Accent (#c8ff2e) NEVER as text on white; used only as border/icon accent
 */

import { useState, useRef, useEffect } from 'react';
import CountUp from '@/components/ui/CountUp';

const CARDS = [
  {
    num: 22,
    suffix: 'B+',
    prefix: '',
    label: 'Organic Views',
    sub: 'Lifetime across all channels',
    accentColor: '#818CF8',
    eyebrow: 'Views',
    icon: null,
  },
  {
    num: 4,
    suffix: 'M+',
    prefix: '$',
    label: 'Monthly Revenue Built',
    sub: 'Current across active clients',
    accentColor: 'var(--accent)',
    eyebrow: 'Revenue',
    icon: null,
  },
  {
    num: 75,
    suffix: '+',
    prefix: '',
    label: 'Channels Scaled',
    sub: 'Across 15 languages and 6 countries',
    accentColor: '#F59E0B',
    eyebrow: 'Scale',
    icon: null,
  },
  {
    num: 15,
    suffix: '',
    prefix: '',
    label: 'Languages',
    sub: 'EN ES FR PT RU + 10 more',
    accentColor: '#2DD4BF',
    eyebrow: 'Global',
    icon: null,
  },
  {
    num: 48,
    suffix: 'h',
    prefix: '',
    label: 'Audit Turnaround',
    sub: 'Expert-reviewed within 48 hours',
    accentColor: '#A78BFA',
    eyebrow: 'Efficiency',
    icon: null,
  },
  {
    num: 20,
    suffix: '+',
    prefix: '',
    label: 'Gold & Silver Play Buttons',
    sub: 'Earned by Hype On clients',
    accentColor: '#FF0000',
    eyebrow: 'Awards',
    isYouTube: true,
  },
];

export default function StatsProof() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      className="section section--white sp-section"
      id="proof"
      ref={ref}
    >
      <div className="container">
        {/* Header */}
        <div className="sp-header">
          <p className="eyebrow sp-eyebrow">Results</p>
          <h2 className="sp-headline">Proof, not promises.</h2>
          <p className="sp-subhead">
            Not claims. Actual results — across 75+ channels, 15 languages, and a decade of data.
          </p>
        </div>

        {/* 3×2 grid */}
        <div className="sp-grid">
          {CARDS.map((card, i) => (
            <div
              key={i}
              className={`sp-card${visible ? ' sp-card--animate' : ''}`}
              style={{ '--sp-accent': card.accentColor } as React.CSSProperties}
            >
              {/* Top accent border that draws L→R on scroll */}
              <div className="sp-card__border" />

              {/* Card header row */}
              <div className="sp-card__head">
                {card.isYouTube ? (
                  <svg width="16" height="11" viewBox="0 0 16 11" fill="none" aria-hidden="true">
                    <rect width="16" height="11" rx="2" fill="#FF0000" />
                    <path d="M6.5 3.5L10.5 5.5L6.5 7.5V3.5Z" fill="white" />
                  </svg>
                ) : (
                  <span className="sp-card__dot" />
                )}
                <span className="sp-card__eyebrow">{card.eyebrow}</span>
              </div>

              {/* Number */}
              <div className="sp-card__num">
                <CountUp
                  end={card.num}
                  start={visible}
                  prefix={card.prefix}
                  dur={1400}
                />
                <span className="sp-card__suffix">{card.suffix}</span>
              </div>

              {/* Labels */}
              <p className="sp-card__label">{card.label}</p>
              <p className="sp-card__sub">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* YouTube Certified badge */}
        <div className="sp-badge-row">
          <div className="sp-yt-badge">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect width="18" height="18" rx="4" fill="#FF0000" />
              <path d="M7.2 5.4L12.6 9L7.2 12.6V5.4Z" fill="white" />
            </svg>
            <span className="eyebrow sp-yt-badge__label">Team YouTube Certified</span>
          </div>
        </div>
      </div>
    </section>
  );
}
