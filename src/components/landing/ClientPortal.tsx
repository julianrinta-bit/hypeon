'use client';

/**
 * ClientPortal.tsx — Fase 2.5 (NUEVO)
 * .section--white. 2-col: copy left + app mockup right.
 * App mockup: built as HTML/CSS (no external images),
 * replicating the dark dashboard from dc.html §51.
 * Green top-border on the mockup card.
 *
 * WCAG contraste:
 *  - Headline: --fg-dark (#111) over white → ~17:1 ✓
 *  - Body:     --fg-dark-mid (#444) → ~9.7:1 ✓
 *  - Bullets:  #555 over white → ~7.4:1 ✓
 *  - Accent (#c8ff2e) used only as: bullet dot, badge pulse, chart line,
 *    CTA button BG (with #111 text → 13:1 ✓) — NEVER as text on white
 *  - Mockup is dark bg → all text inside mockup is on dark (separate context)
 *
 * Mockup placeholder: pure CSS dashboard UI.
 * TODO: reemplazar mockup por screenshot real del portal cuando esté listo
 */

export default function ClientPortal() {
  return (
    <section className="section section--cream cp-section" id="portal">
      <div className="container">
        <div className="cp-grid">
          {/* Left: copy */}
          <div className="cp-copy">
            {/* "Client Portal" badge */}
            <div className="cp-badge">
              <span className="cp-badge__dot" aria-hidden="true" />
              <span className="eyebrow cp-badge__label">Client Portal</span>
            </div>

            <h2 className="cp-headline">
              All your YouTube data.{' '}
              <span className="cp-headline__hl">One dashboard.</span>
            </h2>

            <p className="cp-body">
              Every client gets access to our proprietary analytics platform —
              connecting YouTube Analytics, AdSense, and multi-channel reporting
              into one clean view. See what&rsquo;s working and act fast.
            </p>

            {/* Feature bullets */}
            <ul className="cp-bullets">
              <li className="cp-bullet">
                <span className="cp-bullet__dot" aria-hidden="true" />
                <span>Revenue tracking across all channels</span>
              </li>
              <li className="cp-bullet">
                <span className="cp-bullet__dot" aria-hidden="true" />
                <span>Performance benchmarks vs. category</span>
              </li>
              <li className="cp-bullet">
                <span className="cp-bullet__dot" aria-hidden="true" />
                <span>Monthly reports with specific next actions</span>
              </li>
              <li className="cp-bullet">
                <span className="cp-bullet__dot" aria-hidden="true" />
                <span>Multi-language channel rollup in one view</span>
              </li>
            </ul>

            <a href="#contact" className="btn-dark cp-cta">
              Get access with your audit <span className="arrow">→</span>
            </a>
          </div>

          {/* Right: app mockup */}
          {/* TODO: reemplazar por screenshot real del portal cuando esté listo */}
          <div className="cp-mockup">
            {/* Green top border drawn by CSS */}
            {/* App header bar */}
            <div className="cp-mock__header">
              <div className="cp-mock__logo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/email-logo.png"
                  alt=""
                  width={16}
                  height={16}
                  className="cp-mock__logo-img"
                  aria-hidden="true"
                />
                <span className="eyebrow cp-mock__logo-label">
                  HYPE ON · CLIENT PORTAL
                </span>
              </div>
              <div className="cp-mock__filters">
                <span className="cp-mock__filter">Apr 2026</span>
                <span className="cp-mock__filter">All Channels</span>
              </div>
            </div>

            {/* Metrics strip */}
            <div className="cp-mock__metrics">
              {[
                { label: 'Views', val: '2.41M', delta: '↑ 18.3%', positive: true },
                { label: 'Revenue', val: '$38.4k', delta: '↑ 24.1%', positive: true },
                { label: 'Avg CTR', val: '4.6%', delta: '↑ 0.8pp', positive: true },
                { label: 'RPM', val: '$15.93', delta: '— stable', positive: false },
                { label: 'Channels', val: '7 active', delta: '+2 this mo.', positive: true },
              ].map((m, i) => (
                <div key={i} className="cp-mock__metric">
                  <span className="eyebrow cp-mock__metric-label">{m.label}</span>
                  <span className="cp-mock__metric-val">{m.val}</span>
                  <span
                    className={`cp-mock__metric-delta${m.positive ? ' cp-mock__metric-delta--pos' : ' cp-mock__metric-delta--neutral'}`}
                  >
                    {m.delta}
                  </span>
                </div>
              ))}
            </div>

            {/* Mini chart area */}
            <div className="cp-mock__chart">
              <p className="eyebrow cp-mock__chart-label">Total Revenue — 30 days</p>
              <svg
                width="100%"
                height="72"
                viewBox="0 0 500 72"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="cpChartFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#c8ff2e" stopOpacity=".15" />
                    <stop offset="100%" stopColor="#c8ff2e" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,58 C30,55 60,48 90,42 C120,36 140,52 170,44 C200,36 220,28 260,22 C300,16 330,30 360,20 C390,12 440,8 500,6"
                  stroke="#c8ff2e"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M0,58 C30,55 60,48 90,42 C120,36 140,52 170,44 C200,36 220,28 260,22 C300,16 330,30 360,20 C390,12 440,8 500,6 L500,72 L0,72 Z"
                  fill="url(#cpChartFill)"
                />
              </svg>
            </div>

            {/* Channel table */}
            <div className="cp-mock__table">
              <div className="cp-mock__table-header">
                <span className="eyebrow cp-mock__th">Channel</span>
                <span className="eyebrow cp-mock__th">Views</span>
                <span className="eyebrow cp-mock__th">Revenue</span>
                <span className="eyebrow cp-mock__th">CTR</span>
              </div>
              {[
                { ch: 'Main Channel (EN)', views: '1.2M', rev: '$22.1k', ctr: '5.1%', dim: false },
                { ch: 'ES — Español', views: '784k', rev: '$10.8k', ctr: '4.2%', dim: false },
                { ch: 'FR — Français', views: '418k', rev: '$5.5k', ctr: '3.8%', dim: true },
              ].map((row, i) => (
                <div
                  key={i}
                  className={`cp-mock__table-row${row.dim ? ' cp-mock__table-row--dim' : ''}`}
                >
                  <span className="cp-mock__td">{row.ch}</span>
                  <span className="cp-mock__td cp-mock__td--mono">{row.views}</span>
                  <span className="cp-mock__td cp-mock__td--mono cp-mock__td--accent">
                    {row.rev}
                  </span>
                  <span className="cp-mock__td cp-mock__td--mono">{row.ctr}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
