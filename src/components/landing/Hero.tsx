'use client';
import ChatWidget from '@/components/landing/ChatWidget';

// Creator strip placeholder data — 7 cards with varied heights matching dc.html pattern
const CREATOR_CARDS = [
  { name: 'Creator One',   subs: '2.4M subscribers', w: '200px', h: '340px' },
  { name: 'Creator Two',   subs: '1.1M subscribers', w: '200px', h: '280px' },
  { name: 'Creator Three', subs: '850K subscribers',  w: '200px', h: '320px' },
  { name: 'Creator Four',  subs: '3.2M subscribers',  w: '200px', h: '360px' },
  { name: 'Creator Five',  subs: '640K subscribers',  w: '200px', h: '300px' },
  { name: 'Creator Six',   subs: '1.8M subscribers',  w: '200px', h: '340px' },
  { name: 'Creator Seven', subs: '920K subscribers',  w: '200px', h: '290px' },
];

// Gradient palette for placeholder circles
const GRADIENTS = [
  'linear-gradient(135deg,#1a1a2e,#16213e)',
  'linear-gradient(135deg,#0f3460,#533483)',
  'linear-gradient(135deg,#1b1b2f,#2d2b55)',
  'linear-gradient(135deg,#162447,#1f4068)',
  'linear-gradient(135deg,#1a1a2e,#e94560)',
  'linear-gradient(135deg,#0a3d62,#1e3799)',
  'linear-gradient(135deg,#2c3e50,#3498db)',
];

export default function Hero() {
  return (
    <section className="hero-v2" id="hero">
      {/* Ambient glows — exact positions from dc.html */}
      <div className="hero-v2__glow-bottom" aria-hidden="true" />
      <div className="hero-v2__glow-top" aria-hidden="true" />

      {/* Center column — max-width 800px */}
      <div className="hero-v2__center">
        {/* Badge */}
        <div className="hero-v2__badge">
          <span className="hero-v2__badge-dot" aria-hidden="true" />
          <span className="hero-v2__badge-text">
            YouTube Growth Agency · US &amp; Dubai · Since 2015
          </span>
        </div>

        {/* Headline — "YouTube." with period, then "Engineered." in green */}
        <h1 className="hero-v2__headline">
          <span className="hero-v2__headline-youtube">YouTube.</span>
          <br />
          <span className="hero-v2__headline-engineered">Engineered.</span>
        </h1>

        {/* Subtext — exact copy from dc.html */}
        <p className="hero-v2__subtext">
          We turn underperforming channels into growth engines — strategy, production,
          thumbnails, and multi-language expansion built on 22B+ views.
        </p>

        {/* Chat widget — centered, max-width 640px */}
        <div className="hero-v2__chat-slot">
          <ChatWidget />
        </div>

        <div className="hero-v2__chat-spacer" />
      </div>

      {/* Creator strip — full-width below the center column */}
      <div className="hero-v2__creator-strip">
        <div className="hero-v2__creator-row">
          {CREATOR_CARDS.map((c, i) => (
            <div
              key={c.name}
              className="hero-v2__creator-card"
              style={{ width: c.w, height: c.h }}
              role="img"
              aria-label={c.name}
            >
              {/* TODO: fotos reales — placeholder con gradiente */}
              <div
                className="hero-v2__creator-placeholder"
                style={{ background: GRADIENTS[i % GRADIENTS.length] }}
                aria-hidden="true"
              />
              <div className="hero-v2__creator-gradient" aria-hidden="true" />
              <div className="hero-v2__creator-info">
                <div className="hero-v2__creator-name">{c.name}</div>
                <div className="hero-v2__creator-subs">{c.subs}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
