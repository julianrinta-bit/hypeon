'use client';
import { useState, useEffect, useRef } from 'react';
import ChatWidget from '@/components/landing/ChatWidget';

const ROTATING_WORDS = ['Turns viewers', 'Builds pipelines', 'Scales globally', 'Drives revenue'];

export default function Hero() {
  const [wordIdx, setWordIdx] = useState(0);
  const [wordKey, setWordKey] = useState(0);
  const [videoActive, setVideoActive] = useState(false);
  const iframeRef = useRef<HTMLDivElement>(null);

  // Cycle rotating word every 3.2s
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const interval = setInterval(() => {
      setWordIdx(i => (i + 1) % ROTATING_WORDS.length);
      setWordKey(k => k + 1);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const handleVideoClick = () => {
    setVideoActive(true);
  };

  return (
    <section className="hero-v2" id="hero">
      {/* Ambient glows */}
      <div className="hero-v2__glow-bottom" aria-hidden="true" />
      <div className="hero-v2__glow-top" aria-hidden="true" />

      <div className="hero-v2__inner">
        {/* ── Left column ── */}
        <div className="hero-v2__left">
          {/* Badge */}
          <div className="hero-v2__badge">
            <span className="hero-v2__badge-dot" aria-hidden="true" />
            <span className="hero-v2__badge-text">
              YouTube Growth Agency · US &amp; Dubai · Since 2015
            </span>
          </div>

          {/* Headline */}
          <h1 className="hero-v2__headline">
            <span className="hero-v2__headline-youtube">YouTube,</span>
            <span className="hero-v2__headline-engineered">Engineered.</span>
          </h1>

          {/* Rotating word row */}
          <div className="hero-v2__rotating-row">
            <span className="hero-v2__rotating-prefix">We turn channels into growth engines.</span>
          </div>

          {/* Rotating word displayed separately */}
          <div style={{ marginBottom: '1.6rem', minHeight: '2rem', overflow: 'hidden' }}>
            <span
              key={wordKey}
              className="hero-v2__word"
            >
              {ROTATING_WORDS[wordIdx]}
            </span>
            <span className="hero-v2__rotating-prefix" style={{ marginLeft: '0.4rem' }}>
              .
            </span>
          </div>

          {/* Chat widget */}
          <div className="hero-v2__chat-slot">
            <ChatWidget />
          </div>
        </div>

        {/* ── Right column — video ── */}
        <div
          className="hero-v2__right"
          onClick={handleVideoClick}
          role="button"
          tabIndex={0}
          aria-label="Play Hype On Media video"
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleVideoClick(); }}
        >
          {videoActive ? (
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/loSABT0E1Mc?autoplay=1"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{ position: 'absolute', inset: 0 }}
              title="Hype On Media channel audit"
            />
          ) : (
            <>
              <div className="hero-v2__video-overlay" aria-hidden="true" />
              <div className="hero-v2__video-meta">
                <p className="hero-v2__video-channel">Hype On Media</p>
                <p className="hero-v2__video-title">
                  How we turn a dying YouTube channel into a revenue engine
                </p>
              </div>
              <div className="hero-v2__video-duration" aria-hidden="true">4:00</div>
              <div className="hero-v2__play-btn" aria-hidden="true">
                <div className="hero-v2__play-circle">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M6 3.5L15.5 10L6 16.5V3.5Z" fill="#111" />
                  </svg>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
