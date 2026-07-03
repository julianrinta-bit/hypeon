'use client';

import RevealOnScroll from '@/components/ui/RevealOnScroll';

const TESTIMONIALS = [
  {
    badge: 'YouTube → #1 lead source',
    text: "We'd been posting on YouTube for two years with no strategy. Hype On restructured our entire approach — thumbnails, titles, content architecture. Six months later, YouTube is our top lead source.",
    initial: 'R',
    name: 'Rachel M.',
    role: 'VP Marketing',
    industry: 'Enterprise SaaS',
  },
  {
    badge: 'Content → pipeline driver',
    text: "What surprised me was how much they understood about conversion, not just views. Our channel went from a content experiment to a pipeline driver. The audit alone was worth more than a full month at most agencies.",
    initial: 'D',
    name: 'Daniel K.',
    role: 'Founder',
    industry: 'DTC Brand',
  },
  {
    badge: '5 channels managed seamlessly',
    text: "I run five channels and was drowning in production logistics. They plugged into our workflow in two weeks. Best part: when something underperforms, they call to talk strategy — not just swap a thumbnail.",
    initial: 'S',
    name: 'Sofia T.',
    role: 'Creative Director',
    industry: 'Media Network',
  },
];

const PLATFORM_DATA = {
  metric1: {
    label: '% of $100k+ income households',
    rows: [
      { platform: 'YouTube', pct: 89, barWidth: '89%', accent: true },
      { platform: 'Instagram', pct: 54, barWidth: '54%', accent: false },
      { platform: 'TikTok', pct: 27, barWidth: '27%', accent: false },
    ],
  },
  metric2: {
    label: '% of all US households',
    rows: [
      { platform: 'YouTube', pct: 83, barWidth: '83%', accent: true },
      { platform: 'Instagram', pct: 47, barWidth: '47%', accent: false },
      { platform: 'TikTok', pct: 33, barWidth: '33%', accent: false },
    ],
  },
  mau: [
    { platform: 'YouTube', value: '2.7B', accent: true },
    { platform: 'Instagram', value: '2B', accent: false },
    { platform: 'TikTok', value: '1.5B', accent: false },
  ],
};

export default function Testimonials() {
  return (
    <section className="testi-section" id="testimonials">
      {/* Dark top: featured quote */}
      <div className="testi-dark-top">
        <div className="testi-dark-inner">
          <p className="testi-eyebrow">Your numbers are the only metric we care about.</p>
          <div className="testi-big-quote" aria-hidden="true">&ldquo;</div>
          <p className="testi-featured-text">
            &ldquo;What surprised me was how much they understood about conversion, not just views. Our channel went from a content experiment to a pipeline driver. The audit alone was worth more than a full month at most agencies.&rdquo;
          </p>
          <div className="testi-featured-author">
            <div className="testi-avatar testi-avatar--green">D</div>
            <div className="testi-author-info">
              <span className="testi-author-name">Daniel K.</span>
              <span className="testi-author-role">Founder · DTC Brand</span>
            </div>
            <div className="testi-badge-pill">Content → pipeline driver</div>
          </div>
        </div>
      </div>

      {/* Cream bottom: 3 cards + comparison table */}
      <div className="testi-cream-bottom">
        <div className="testi-container">
          {/* 3 quote cards */}
          <div className="testi-cards-grid">
            {TESTIMONIALS.map((t, i) => (
              <RevealOnScroll key={i}>
                <div className="testi-card">
                  <div className="testi-card-badge">{t.badge}</div>
                  <p className="testi-card-text">&ldquo;{t.text}&rdquo;</p>
                  <div className="testi-card-footer">
                    <div className="testi-avatar testi-avatar--dark">{t.initial}</div>
                    <div>
                      <div className="testi-card-name">{t.name}</div>
                      <div className="testi-card-role">{t.role} · {t.industry}</div>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          {/* Platform comparison table */}
          <RevealOnScroll>
            <div className="testi-platform-table">
              <div className="testi-platform-left">
                <p className="testi-platform-eyebrow">Platform data · 2026</p>
                <h3 className="testi-platform-title">
                  YouTube isn&rsquo;t a side show.<br />It&rsquo;s the main event.
                </h3>
                <p className="testi-platform-body">
                  89% of U.S. households earning $100k+ use YouTube every month. No other platform comes close for premium audiences.
                </p>
                <div className="testi-yt-badge">
                  <svg width="16" height="11" viewBox="0 0 16 11" fill="none" aria-hidden="true">
                    <rect width="16" height="11" rx="2" fill="#FF0000" />
                    <path d="M6.5 3.5L10.5 5.5L6.5 7.5V3.5Z" fill="white" />
                  </svg>
                  <span>Team YouTube Certified</span>
                </div>
              </div>

              <div className="testi-platform-right">
                {/* Metric 1 */}
                <div className="testi-metric-block">
                  <p className="testi-metric-label">{PLATFORM_DATA.metric1.label}</p>
                  <div className="testi-bars">
                    {PLATFORM_DATA.metric1.rows.map((row) => (
                      <div key={row.platform} className="testi-bar-row">
                        <span className="testi-bar-platform">{row.platform}</span>
                        <div className="testi-bar-track">
                          <div
                            className={`testi-bar-fill${row.accent ? ' testi-bar-fill--yt' : ''}`}
                            style={{ width: row.barWidth }}
                          />
                        </div>
                        <span className={`testi-bar-pct${row.accent ? ' testi-bar-pct--yt' : ''}`}>
                          {row.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="testi-metric-block">
                  <p className="testi-metric-label">{PLATFORM_DATA.metric2.label}</p>
                  <div className="testi-bars">
                    {PLATFORM_DATA.metric2.rows.map((row) => (
                      <div key={row.platform} className="testi-bar-row">
                        <span className="testi-bar-platform">{row.platform}</span>
                        <div className="testi-bar-track">
                          <div
                            className={`testi-bar-fill${row.accent ? ' testi-bar-fill--yt2' : ''}`}
                            style={{ width: row.barWidth }}
                          />
                        </div>
                        <span className={`testi-bar-pct${row.accent ? ' testi-bar-pct--yt2' : ''}`}>
                          {row.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MAU row */}
                <div className="testi-mau-row">
                  {PLATFORM_DATA.mau.map((m) => (
                    <div key={m.platform} className="testi-mau-cell">
                      <span className={`testi-mau-value${m.accent ? ' testi-mau-value--yt' : ''}`}>
                        {m.value}
                      </span>
                      <span className={`testi-mau-label${m.accent ? ' testi-mau-label--yt' : ''}`}>
                        {m.platform} MAU
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
