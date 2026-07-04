'use client';

/**
 * WhatWeMake.tsx — SESSION 2026-07-03 FIX 2
 * dc.html calco: fondo #111, grid fijo 3×2 (6 cards, 280px height), SIN carrusel.
 * Fuente de verdad: "CONTENT TYPES — dark, hover-alive cards" en dc.html línea 633.
 *
 * WCAG:
 *  - Cards: dark overlay → white text sobre dark bg → ~10:1+ ✓
 *  - Eyebrow verde rgba(200,255,46,.6) sobre #111 → suficiente contraste para decorative label ✓
 *
 * Placeholders: gradient backgrounds (dc.html card 3 es gradient; resto usan imgs de Webflow CDN
 * que no disponemos → gradientes oscuros + TODO). Hover→tag se vuelve verde, body sube.
 */

import { useRef, useCallback } from 'react';

interface ContentCard {
  category: string;
  headline: string;
  body: string;
  gradient: string;
  image?: string;
  emoji?: string;
  video?: string;
}

const CATEGORIES: ContentCard[] = [
  {
    category: 'Influencers & Creators',
    headline: 'Short & long-form for creator-led channels',
    body: 'Scripted series, vlogs, reaction content — built to grow audiences, not just fill a calendar.',
    gradient: 'linear-gradient(135deg, #1a0a2e, #3d1a6e)',
    image: '/images/whatwemake/influencers.jpg',
    video: '/video/productions/bamboo-clip.mp4',
  },
  {
    category: 'Documentaries',
    headline: 'Narrative docs & investigative series',
    body: 'From history to science to human interest — documentary formats that hold attention at scale.',
    gradient: 'linear-gradient(135deg, #0d1a0d, #1a3a2a)',
    image: '/images/whatwemake/documentaries.jpg',
    video: '/video/productions/unscripted-clip.mp4',
  },
  {
    category: 'Kids & Family',
    headline: 'Animated & live-action kids programming',
    body: 'Educational, entertaining, and designed to keep young audiences coming back.',
    gradient: 'linear-gradient(135deg, #1a2a4a, #2d1a6e)',
    image: '/images/whatwemake/kidsfamily.jpg',
  },
  {
    category: 'Podcasts & Talk Shows',
    headline: 'Podcasts & talk shows',
    body: 'Full production — recording, editing, clips, thumbnails — optimized for discovery on YouTube.',
    gradient: 'linear-gradient(135deg, #1a0a08, #3d1a10)',
    image: '/images/whatwemake/podcasts.jpg',
    video: '/video/productions/realidades-clip.mp4',
  },
  {
    category: 'Live Action',
    headline: 'On-location & studio production',
    body: 'Automotive, travel, lifestyle, sport — we handle full production from shoot to publish.',
    gradient: 'linear-gradient(135deg, #0d1525, #1a2a40)',
    image: '/images/whatwemake/liveaction.jpg',
  },
  {
    category: 'Multi-Language',
    headline: 'Content for global audiences in 15 languages',
    body: 'Dubbing, localization, and market-specific production — built to scale internationally.',
    gradient: 'linear-gradient(135deg, #1a1a0a, #2a2a14)',
    image: '/images/whatwemake/multilanguage.jpg',
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
      {/* Background: real image (if available) or gradient placeholder */}
      <div
        className="wmm-card__bg"
        style={
          card.image
            ? {
                backgroundImage: `url(${card.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
              }
            : { background: card.gradient }
        }
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

      {/* Gradient overlay — stronger bottom fade when real image is present */}
      <div
        className={`wmm-card__overlay${card.image ? ' wmm-card__overlay--photo' : ''}`}
        aria-hidden="true"
      />

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
  return (
    <section className="wmm-section wmm-section--dark" id="work">
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
          <a href="/#contact" className="wmm-cta-link">Work with us →</a>
        </div>
      </div>

      {/* Fixed 3×2 grid — no carousel, no arrows */}
      <div className="container">
        <div className="wmm-grid">
          {CATEGORIES.map((card, i) => (
            <ContentCard key={i} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
