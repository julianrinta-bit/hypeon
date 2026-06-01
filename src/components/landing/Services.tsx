'use client';
import { useState, useRef, useEffect } from 'react';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import ParallaxBgNumber from '@/components/ui/ParallaxBgNumber';

const SERVICES = [
  { idx: '01', name: 'Channel Strategy & Audit', desc: 'Deep-dive analysis of your content, audience, and revenue opportunities. A clear roadmap, not a pitch deck.', tags: ['Audit', 'Strategy', 'Roadmap'] },
  { idx: '02', name: 'Format Development', desc: 'We design video formats engineered for your niche — built on a decade of data across 50+ channels.', tags: ['Formats', 'Testing', 'Scripts'] },
  { idx: '03', name: 'Thumbnail & Packaging', desc: 'CTR is the game. We build systematic thumbnail and title frameworks with rigorous A/B testing.', tags: ['Thumbnails', 'CTR', 'A/B Testing'] },
  { idx: '04', name: 'Multi-market Expansion', desc: 'One proven format, scaled across languages and markets. 15 languages of production capability.', tags: ['Localization', '15 Languages', 'Global'] },
  { idx: '05', name: 'Performance Analytics', desc: 'Custom dashboards, RPM optimization, watch-time analysis, and revenue attribution.', tags: ['Analytics', 'RPM', 'Revenue'] },
  { idx: '06', name: 'Shorts + Long-form', desc: 'Platform-native strategy for both formats. Different algorithms, different playbooks.', tags: ['Shorts', 'Long-form', 'Algorithm'] },
];

export default function Services() {
  const [active, setActive] = useState(-1);
  const [inView, setInView] = useState(false);
  const [userTouched, setUserTouched] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // Auto-cycle on first view
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!inView || userTouched || reducedMotion) return;

    setActive(0);
    let currentIdx = 0;
    const i = setInterval(() => {
      currentIdx++;
      if (currentIdx >= SERVICES.length) {
        clearInterval(i);
        return;
      }
      setActive(currentIdx);
    }, 1200);
    return () => clearInterval(i);
  }, [inView, userTouched]);

  const toggle = (i: number) => {
    setUserTouched(true);
    setActive(active === i ? -1 : i);
  };

  return (
    <section className="section" id="services" ref={ref}>
      <ParallaxBgNumber number="03" />
      <div className="container">
        <RevealOnScroll>
          <p className="eyebrow"><span>03</span> — Services</p>
          <h2 className="section-title">YouTube performance. Every angle.</h2>
          <p className="section-subtitle">One focus. Six disciplines. All built from operating at scale.</p>
        </RevealOnScroll>

        <div className="services-list" style={{ marginTop: 40 }}>
          {SERVICES.map((svc, i) => {
            const isActive = active === i;
            return (
              <div
                key={i}
                className={`service-item${isActive ? ' active' : ''}`}
                onClick={() => toggle(i)}
                role="button"
                tabIndex={0}
                aria-expanded={isActive}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(i); } }}
              >
                <div className="service-header">
                  <span className="service-idx">{svc.idx}</span>
                  <h3 className="service-name">{svc.name}</h3>
                  <span className="service-arrow" aria-hidden="true">{isActive ? '−' : '+'}</span>
                </div>
                <div className="service-body" style={{ maxHeight: isActive ? 300 : 0 }}>
                  <div className="service-body-inner">
                    <p className="service-desc">{svc.desc}</p>
                    <div className="service-tags">
                      {svc.tags.map(t => <span key={t} className="pill accent">{t}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <RevealOnScroll>
          <a href="/analyze" className="inline-cta">
            Not sure where to start? Get a free audit <span className="arrow">&rarr;</span>
          </a>
        </RevealOnScroll>
      </div>
    </section>
  );
}
