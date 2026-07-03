'use client';

/**
 * WhatWeMake.tsx — Fase 2.3
 * Replaces ContentProduction.tsx (file kept intact).
 * .section--cream. Horizontal-scroll 6-card carousel.
 * Reuses useDragScroll + useAutoScroll from ContentProduction.
 * Cards: image-bg + hover→silent video (same pattern as ContentProduction).
 *
 * WCAG:
 *  - Cards have dark overlay → white text on dark = ~10:1+ ✓
 *  - Section headline: --fg-dark over --bg-cream → ~14:1 ✓
 *
 * Placeholders: gradient backgrounds used for all 6 categories
 * since Webflow CDN images are not available.
 * TODO: reemplazar gradientes por assets reales en /public/images/whatwemake/
 */

import { useRef, useCallback } from 'react';
import { useDragScroll } from '@/hooks/useDragScroll';
import { useAutoScroll } from '@/hooks/useAutoScroll';

interface ContentCard {
  category: string;
  headline: string;
  body: string;
  gradient: string;
  emoji?: string;
  video?: string;
}

const CATEGORIES: ContentCard[] = [
  {
    category: 'Influencers & Creators',
    headline: 'Short & long-form for creator-led channels',
    body: 'Scripted series, vlogs, reaction content — built to grow audiences, not just fill a calendar.',
    gradient: 'linear-gradient(135deg, #1a0a2e, #3d1a6e)',
    // TODO: reemplazar por asset real en /public/images/whatwemake/influencers.jpg
    video: '/video/productions/bamboo-clip.mp4',
  },
  {
    category: 'Documentaries',
    headline: 'Narrative docs & investigative series',
    body: 'From history to science to human interest — documentary formats that hold attention at scale.',
    gradient: 'linear-gradient(135deg, #0d1a0d, #1a3a2a)',
    // TODO: reemplazar por asset real en /public/images/whatwemake/docs.jpg
    video: '/video/productions/unscripted-clip.mp4',
  },
  {
    category: 'Kids & Family',
    headline: 'Animated & live-action kids programming',
    body: 'Educational, entertaining, and designed to keep young audiences coming back.',
    gradient: 'linear-gradient(135deg, #1a2a4a, #2d1a6e)',
    emoji: '🎨',
    // TODO: reemplazar por asset real en /public/images/whatwemake/kids.jpg
  },
  {
    category: 'Podcasts & Talk Shows',
    headline: 'Audio-first content adapted for YouTube',
    body: 'Full production — recording, editing, clips, thumbnails — optimized for discovery on YouTube.',
    gradient: 'linear-gradient(135deg, #1a0a08, #3d1a10)',
    // TODO: reemplazar por asset real en /public/images/whatwemake/podcasts.jpg
    video: '/video/productions/realidades-clip.mp4',
  },
  {
    category: 'Live Action',
    headline: 'On-location & studio production',
    body: 'Automotive, travel, lifestyle, sport — we handle full production from shoot to publish.',
    gradient: 'linear-gradient(135deg, #0d1525, #1a2a40)',
    // TODO: reemplazar por asset real en /public/images/whatwemake/live-action.jpg
  },
  {
    category: 'Brand Content',
    headline: 'Content for global audiences in 15 languages',
    body: 'Dubbing, localization, and market-specific production — built to scale internationally.',
    gradient: 'linear-gradient(135deg, #1a1a0a, #2a2a14)',
    // TODO: reemplazar por asset real en /public/images/whatwemake/brand.jpg
  },
];

function ContentCard({ card }: { card: ContentCard }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  }, []);

  const handleMouseLeave = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  }, []);

  return (
    <div
      className="wmm-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background: gradient placeholder (+ video on hover if available) */}
      <div
        className="wmm-card__bg"
        style={{ background: card.gradient }}
        aria-hidden="true"
      />
      {/* Subtle noise/grid texture overlay */}
      <div className="wmm-card__texture" aria-hidden="true" />

      {/* Silent hover-video (if available) */}
      {card.video && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          ref={videoRef}
          src={card.video}
          muted
          playsInline
          loop
          preload="none"
          className="wmm-card__video"
          aria-hidden="true"
        />
      )}

      {/* Gradient overlay */}
      <div className="wmm-card__overlay" aria-hidden="true" />

      {/* Card body */}
      <div className="wmm-card__body">
        {/* Top: EQ bars + tag */}
        <div className="wmm-card__top">
          <div className="wmm-eq" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="wmm-tag eyebrow">{card.category}</div>
        </div>

        {/* Bottom: headline + body */}
        <div className="wmm-card__bottom">
          {card.emoji && (
            <div className="wmm-emoji" aria-hidden="true">
              {card.emoji}
            </div>
          )}
          <h3 className="wmm-card__headline">{card.headline}</h3>
          <p className="wmm-card__desc">{card.body}</p>
        </div>
      </div>
    </div>
  );
}

export default function WhatWeMake() {
  const trackRef = useRef<HTMLDivElement>(null);
  useDragScroll(trackRef);
  useAutoScroll(trackRef, 0.4);

  const scrollLeft = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: -320, behavior: 'smooth' });
  }, []);

  const scrollRight = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: 320, behavior: 'smooth' });
  }, []);

  return (
    <section className="section section--cream wmm-section" id="work">
      <div className="container wmm-header-container">
        <div className="wmm-header">
          <div>
            <p className="eyebrow wmm-eyebrow">What we produce</p>
            <h2 className="wmm-headline">The content we make.</h2>
            <p className="wmm-subhead">
              As a full-stack production company, we produce across every format and vertical —
              from kids to podcasts to live action.
            </p>
          </div>

          {/* Scroll arrows */}
          <div className="wmm-arrows">
            <button
              className="wmm-arrow"
              onClick={scrollLeft}
              aria-label="Scroll left"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              className="wmm-arrow"
              onClick={scrollRight}
              aria-label="Scroll right"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Carousel track — full-bleed horizontal scroll */}
      <div className="wmm-track" ref={trackRef}>
        {CATEGORIES.map((card, i) => (
          <ContentCard key={i} card={card} />
        ))}
      </div>
    </section>
  );
}
