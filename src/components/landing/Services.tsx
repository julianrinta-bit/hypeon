'use client';
import { useState, useRef, useEffect } from 'react';

const SERVICES = [
  {
    num: '01',
    name: 'Channel Strategy',
    desc: 'We map your channel to what your audience is actually searching for. Format development, posting cadence, title systems, and content architecture built around measurable performance.',
    tags: ['Format Dev', 'Positioning', 'Shorts', 'Long-form'],
  },
  {
    num: '02',
    name: 'Content Production',
    desc: 'Scripts, briefs, and production workflows at scale. We build the pipeline that keeps your channel publishing consistently without burning out your team. AI-assisted, human-reviewed.',
    tags: ['Scripts', 'Briefs', 'AI Pipeline', 'Batch'],
  },
  {
    num: '03',
    name: 'Thumbnail & SEO',
    desc: 'Packaging systems that drive clicks. Thumbnail frameworks, title formulas, and metadata optimization built on 22B+ views across 75+ channels.',
    tags: ['Thumbnails', 'Title Systems', 'CTR', 'A/B Testing'],
  },
  {
    num: '04',
    name: 'Analytics & Reporting',
    desc: "Data that drives decisions. Performance dashboards, monthly reports, and signal-vs-noise analysis. Weekly analysis — what works gets scaled, what doesn't gets cut.",
    tags: ['Dashboards', 'Monthly Reports', 'Revenue Tracking', 'Attribution'],
  },
  {
    num: '05',
    name: 'Content Localization',
    desc: "Your content, in new markets. We've scaled content across 15 languages. Spanish alone typically adds 35–60% incremental AdSense revenue to an English-language channel.",
    tags: ['15 Languages', 'Dubbing', 'Localization', 'SEO'],
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

      {/* Grid: tabs + panel */}
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
      </div>
    </section>
  );
}
