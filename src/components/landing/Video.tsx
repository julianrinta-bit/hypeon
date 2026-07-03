'use client';

/**
 * Video.tsx — Fase 2.2
 * Replaces Showreel.tsx (file kept intact).
 * Layout: .section--white, 2-col (headline left + video right).
 * Video: YouTube embed via click-to-load pattern (poster placeholder,
 * click replaces with iframe) — same approach as dc.html §43.
 *
 * WCAG contraste:
 *  - Headline: --fg-dark (#111) over white → ~17:1 ✓
 *  - Body:     --fg-dark-mid (#444) over white → ~9.7:1 ✓
 *  - Eyebrow:  --fg-dark-muted (#888) — decorative/label use only ✓
 *
 * TODO: replace YouTube embed ID with final video if different from Showreel's /video/hypeon-vsl.mp4
 */

import { useRef, useCallback, useState } from 'react';

export default function Video() {
  const [playing, setPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePlay = useCallback(() => {
    setPlaying(true);
  }, []);

  return (
    <section className="section section--white vid-section" id="video">
      <div className="container">
        <div className="vid-grid">
          {/* Left: headline + body + CTA */}
          <div className="vid-copy">
            <p className="eyebrow vid-eyebrow">Watch how we think</p>
            <h2 className="vid-headline">
              4-minute channel audit, live.
            </h2>
            <p className="vid-body">
              A real breakdown of how we approach a channel — what we find, what we fix,
              what we scale. Our actual thinking, applied to a real channel.
            </p>
            <a href="#contact" className="btn-dark vid-cta">
              Book a Discovery Call <span className="arrow">→</span>
            </a>
          </div>

          {/* Right: video */}
          <div className="vid-media" ref={containerRef}>
            {playing ? (
              <iframe
                className="vid-iframe"
                src="https://www.youtube.com/embed/loSABT0E1Mc?autoplay=1"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="Hype On Media — 4-minute channel audit"
              />
            ) : (
              <div
                className="vid-poster"
                onClick={handlePlay}
                role="button"
                tabIndex={0}
                aria-label="Play: 4-minute channel audit"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePlay();
                  }
                }}
              >
                {/* Poster gradient placeholder — no external CDN image */}
                {/* TODO: reemplazar por asset real (thumbnail del video) */}
                <div className="vid-poster__bg" aria-hidden="true" />

                {/* Overlay text */}
                <div className="vid-poster__meta">
                  <p className="vid-poster__channel eyebrow">Hype On Media</p>
                  <p className="vid-poster__title">
                    How we turn a dying YouTube channel into a revenue engine
                  </p>
                </div>

                {/* Play button */}
                <div className="vid-play-btn" aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M6 3.5L15.5 10L6 16.5V3.5Z" fill="#111" />
                  </svg>
                </div>

                {/* Duration badge */}
                <div className="vid-poster__duration" aria-hidden="true">
                  <span className="eyebrow">4:00</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
