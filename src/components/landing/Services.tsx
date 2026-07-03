'use client';
import { useState, useRef, useEffect } from 'react';

const SERVICES = [
  {
    num: '01',
    name: 'Channel Strategy',
    desc: 'We map your channel to what your audience is actually searching for. Format development, posting cadence, title systems, and content architecture built around measurable performance.',
    tags: ['Format Dev', 'Positioning', 'Shorts', 'Long-form'],
    visualLabel: 'Target CTR to hit',
    visualStat: '4.8%',
    visualNote: 'Your current baseline: 2.1%',
    bars: [
      { label: 'Month 0', pct: '22%', color: 'rgba(200,255,46,0.25)' },
      { label: 'Month 3', pct: '54%', color: 'rgba(200,255,46,0.55)' },
      { label: 'Month 6', pct: '88%', color: '#c8ff2e' },
    ],
  },
  {
    num: '02',
    name: 'Content Production',
    desc: 'Scripts, briefs, and production workflows at scale. We build the pipeline that keeps your channel publishing consistently without burning out your team. AI-assisted, human-reviewed.',
    tags: ['Scripts', 'Briefs', 'AI Pipeline', 'Batch'],
    visualLabel: 'Production cost reduction',
    visualStat: '60%+',
    visualNote: 'Via AI systems built in-house since 2022',
    bars: [
      { label: 'Before', pct: '100%', color: 'rgba(200,255,46,0.2)' },
      { label: 'Month 2', pct: '65%',  color: 'rgba(200,255,46,0.5)' },
      { label: 'Month 6', pct: '38%',  color: '#c8ff2e' },
    ],
  },
  {
    num: '03',
    name: 'Thumbnail & SEO',
    desc: 'Packaging systems that drive clicks. Thumbnail frameworks, title formulas, and metadata optimization built on 22B+ views across 75+ channels.',
    tags: ['Thumbnails', 'Title Systems', 'CTR', 'A/B Testing'],
    visualLabel: 'Avg CTR improvement',
    visualStat: '+127%',
    visualNote: 'Across channels in first 90 days',
    bars: [
      { label: 'Week 1',  pct: '15%', color: 'rgba(200,255,46,0.2)' },
      { label: 'Month 1', pct: '48%', color: 'rgba(200,255,46,0.5)' },
      { label: 'Month 3', pct: '90%', color: '#c8ff2e' },
    ],
  },
  {
    num: '04',
    name: 'Analytics & Reporting',
    desc: "Data that drives decisions. Performance dashboards, monthly reports, and signal-vs-noise analysis. Weekly analysis — what works gets scaled, what doesn't gets cut.",
    tags: ['Dashboards', 'Monthly Reports', 'Revenue Tracking', 'Attribution'],
    visualLabel: 'Monthly revenue tracked',
    visualStat: '$4M+',
    visualNote: 'Across all active client channels',
    bars: [
      { label: 'Q1', pct: '30%', color: 'rgba(200,255,46,0.2)' },
      { label: 'Q2', pct: '58%', color: 'rgba(200,255,46,0.5)' },
      { label: 'Q3', pct: '85%', color: '#c8ff2e' },
    ],
  },
  {
    num: '05',
    name: 'Content Localization',
    desc: "Your content, in new markets. We've scaled content across 15 languages. Spanish alone typically adds 35–60% incremental AdSense revenue to an English-language channel.",
    tags: ['15 Languages', 'Dubbing', 'Localization', 'SEO'],
    visualLabel: 'Revenue from Spanish channel',
    visualStat: '+$340/mo',
    visualNote: 'Estimated for a 50K-subscriber channel',
    bars: [
      { label: 'EN only', pct: '40%', color: 'rgba(200,255,46,0.2)' },
      { label: '+ ES',    pct: '68%', color: 'rgba(200,255,46,0.5)' },
      { label: '+ FR/PT', pct: '92%', color: '#c8ff2e' },
    ],
  },
];

export default function Services() {
  const [activeService, setActiveService] = useState(0);
  const [inView, setInView] = useState(false);
  const [userTouched, setUserTouched] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // IntersectionObserver to trigger auto-cycle on first view
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // Auto-cycle through tabs when in view (if user hasn't touched)
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!inView || userTouched || reducedMotion) return;

    let currentIdx = 0;
    const i = setInterval(() => {
      currentIdx = (currentIdx + 1) % SERVICES.length;
      setActiveService(currentIdx);
    }, 2000);

    return () => clearInterval(i);
  }, [inView, userTouched]);

  const handleTabClick = (i: number) => {
    setUserTouched(true);
    setActiveService(i);
  };

  const active = SERVICES[activeService];

  return (
    <section className="services-v2" id="services" ref={ref}>
      {/* Header */}
      <div className="services-v2__header">
        <div>
          <p className="services-v2__eyebrow">What we do</p>
          <h2 className="services-v2__title">
            YouTube solutions<br />
            that scale with you.
          </h2>
        </div>
        <a href="/#contact" className="services-v2__cta-link">
          Start with a free audit →
        </a>
      </div>

      {/* Grid: tabs + panel (left detail + right visual) */}
      <div className="services-v2__grid">
        {/* Tabs column */}
        <div className="services-v2__tabs-col" role="tablist" aria-label="Services">
          {SERVICES.map((svc, i) => (
            <div
              key={svc.num}
              className={`services-v2__tab${activeService === i ? ' services-v2__tab--active' : ''}`}
              onClick={() => handleTabClick(i)}
              role="tab"
              aria-selected={activeService === i}
              aria-controls={`services-panel-${i}`}
              id={`services-tab-${i}`}
              tabIndex={activeService === i ? 0 : -1}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTabClick(i);
                }
              }}
            >
              <div className="services-v2__tab-num">{svc.num}</div>
              <div className="services-v2__tab-name">{svc.name}</div>
            </div>
          ))}
        </div>

        {/* Right side: left detail + right visual (1fr 1fr) */}
        <div className="services-v2__panels-wrapper">
          {/* Detail panel */}
          <div
            className="services-v2__panel"
            role="tabpanel"
            id={`services-panel-${activeService}`}
            aria-labelledby={`services-tab-${activeService}`}
          >
            <div>
              <span className="services-v2__panel-num-label">
                {active.num} — {active.name}
              </span>
            </div>
            <div>
              <h3 className="services-v2__panel-title">{active.name}</h3>
              <p className="services-v2__panel-desc">{active.desc}</p>
            </div>
            <div className="services-v2__panel-tags">
              {active.tags.map(tag => (
                <span key={tag} className="services-v2__tag">{tag}</span>
              ))}
            </div>
            <a href="/#contact" className="services-v2__panel-cta">
              Get started →
            </a>
          </div>

          {/* Visual panel — dark bg with stat + bars */}
          <div className="services-v2__visual-panel" aria-hidden="true">
            <div className="services-v2__visual-inner">
              <div>
                <p className="services-v2__visual-label">{active.visualLabel}</p>
                <div className="services-v2__visual-stat">{active.visualStat}</div>
                <p className="services-v2__visual-note">{active.visualNote}</p>
              </div>
              <div className="services-v2__bars">
                {active.bars.map(bar => (
                  <div key={bar.label} className="services-v2__bar-row">
                    <span className="services-v2__bar-label">{bar.label}</span>
                    <div className="services-v2__bar-track">
                      <div
                        className="services-v2__bar-fill"
                        style={{ width: bar.pct, background: bar.color }}
                      />
                    </div>
                    <span className="services-v2__bar-pct">{bar.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
