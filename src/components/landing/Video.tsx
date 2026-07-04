'use client';

/**
 * Video.tsx — Fase 2.2 (updated: native video, self-hosted VSL)
 * Replaces Showreel.tsx (file kept intact).
 * Layout: .section--white, 2-col (headline left + video right).
 * Video: self-hosted MP4 via click-to-play pattern.
 *   - Poster state: real frame image (/video/hypeon-vsl-poster.jpg) +
 *     overlay overlay (title, play button, duration badge).
 *   - Playing state: native <video> with controls, autoPlay, preload="none"
 *     (preload=none is mandatory — landing receives paid traffic; no bytes
 *     transferred until the user explicitly clicks play).
 *
 * WCAG contraste:
 *  - Headline: --fg-dark (#111) over white → ~17:1 ✓
 *  - Body:     --fg-dark-mid (#444) over white → ~9.7:1 ✓
 *  - Eyebrow:  --fg-dark-muted (#888) — decorative/label use only ✓
 */

import { useCallback, useState } from 'react';

export default function Video() {
  const [playing, setPlaying] = useState(false);

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
          <div className="vid-media">
            {playing ? (
              <video
                className="vid-iframe"
                src="/video/hypeon-vsl.mp4"
                poster="/video/hypeon-vsl-poster.jpg"
                controls
                autoPlay
                playsInline
                preload="none"
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
                {/* Real poster frame — styles in globals.css .vid-poster__bg */}
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

                {/* Duration badge — exact VSL runtime: 3m 35s */}
                <div className="vid-poster__duration" aria-hidden="true">
                  <span className="eyebrow">3:35</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
