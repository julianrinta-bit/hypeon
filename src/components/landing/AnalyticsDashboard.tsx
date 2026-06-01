'use client';
import { useState, useRef, useEffect } from 'react';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import ParallaxBgNumber from '@/components/ui/ParallaxBgNumber';
import CountUp from '@/components/ui/CountUp';

export default function AnalyticsDashboard() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="section" id="growth" ref={ref}>
      <ParallaxBgNumber number="02" />
      <div className="container">
        <RevealOnScroll>
          <p className="eyebrow"><span>02</span> — What growth looks like</p>
          <h2 className="section-title">The numbers behind the channels.</h2>
          <p className="section-subtitle">A decade of compounding results — measured, not promised.</p>
        </RevealOnScroll>

        <div className={`analytics-grid${visible ? ' animated' : ''}`}>

          {/* HERO: Views with area sparkline */}
          <div className="ana-card ana-card--hero">
            <div className="ana-head">
              <span className="ana-label">Total organic views</span>
              <span className="ana-badge">Lifetime</span>
            </div>
            <div className="ana-num ana-num--xl">
              <CountUp end={20} start={visible} /><span className="u">B+</span>
            </div>
            <div className="ana-viz ana-viz--spark">
              <svg viewBox="0 0 400 90" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="gFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,82 C40,80 80,74 120,64 C160,54 200,42 240,28 C280,16 320,8 360,3 L400,0 L400,90 L0,90Z" fill="url(#gFill)" />
                <path
                  className="ana-spark"
                  d="M0,82 C40,80 80,74 120,64 C160,54 200,42 240,28 C280,16 320,8 360,3 L400,0"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                />
              </svg>
              <div className="ana-spark-labels"><span>2015</span><span>2025</span></div>
            </div>
          </div>

          {/* Peak monthly revenue */}
          <div className="ana-card">
            <div className="ana-head"><span className="ana-label">Peak monthly revenue</span></div>
            <div className="ana-num"><CountUp end={4} start={visible} prefix="$" /><span className="u">M+</span></div>
            <div className="ana-viz ana-bars">
              {[28, 40, 52, 68, 82, 100].map((h, i) => (
                <div key={i} className={`ana-bar${i === 5 ? ' last' : ''}`} style={{ ['--h' as string]: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Channels scaled */}
          <div className="ana-card">
            <div className="ana-head"><span className="ana-label">Channels scaled</span></div>
            <div className="ana-num"><CountUp end={50} start={visible} /><span className="u">+</span></div>
            <div className="ana-viz ana-dots">
              {Array.from({ length: 30 }).map((_, i) => (
                <span key={i} className={`ana-dot${i < 18 ? ' lit' : ''}`} style={{ transitionDelay: `${i * 20}ms` }} />
              ))}
            </div>
          </div>

          {/* Play buttons */}
          <div className="ana-card">
            <div className="ana-head"><span className="ana-label">Play Buttons earned</span></div>
            <div className="ana-num"><CountUp end={20} start={visible} /><span className="u">+</span></div>
            <div className="ana-viz ana-plays">
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className={`ana-play${i < 8 ? ' lit' : ''}`} style={{ transitionDelay: `${i * 40}ms` }}>
                  <svg viewBox="0 0 24 18" aria-hidden="true"><rect width="24" height="18" rx="3" /><polygon points="9,5 9,13 16,9" /></svg>
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="ana-card">
            <div className="ana-head"><span className="ana-label">Languages of production</span></div>
            <div className="ana-num"><CountUp end={15} start={visible} /></div>
            <div className="ana-viz">
              <div className="ana-segs">
                {Array.from({ length: 15 }).map((_, i) => (
                  <span key={i} className="ana-seg" style={{ transitionDelay: `${i * 35}ms` }} />
                ))}
              </div>
              <div className="ana-seg-labels"><span>EN</span><span>ES</span><span>FR</span><span>RU</span><span>+11</span></div>
            </div>
          </div>

          {/* Cost reduction */}
          <div className="ana-card">
            <div className="ana-head"><span className="ana-label">Production cost cut</span></div>
            <div className="ana-num"><CountUp end={70} start={visible} /><span className="u">%</span></div>
            <div className="ana-viz ana-cost">
              <div className="ana-cost-row">
                <span className="ana-cost-tag">Before</span>
                <div className="ana-cost-track"><div className="ana-cost-fill before" /></div>
              </div>
              <div className="ana-cost-row">
                <span className="ana-cost-tag">After</span>
                <div className="ana-cost-track"><div className="ana-cost-fill after" /></div>
              </div>
            </div>
          </div>

          {/* Years */}
          <div className="ana-card">
            <div className="ana-head"><span className="ana-label">Years in the engine room</span></div>
            <div className="ana-num"><CountUp end={10} start={visible} /><span className="u">+</span></div>
            <div className="ana-viz ana-years">Operating since 2015</div>
          </div>

          {/* Team */}
          <div className="ana-card">
            <div className="ana-head"><span className="ana-label">Team members led</span></div>
            <div className="ana-num"><CountUp end={100} start={visible} /><span className="u">+</span></div>
            <div className="ana-viz ana-team">
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={i} className="ana-team-dot" style={{ transitionDelay: `${i * 15}ms` }} />
              ))}
            </div>
          </div>

        </div>

        <RevealOnScroll>
          <a href="/analyze" className="inline-cta">
            See what we&rsquo;d find in yours <span className="arrow">&rarr;</span>
          </a>
        </RevealOnScroll>
      </div>
    </section>
  );
}
