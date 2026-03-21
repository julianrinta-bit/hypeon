'use client';
import { useState, useRef, useCallback } from 'react';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import ParallaxBgNumber from '@/components/ui/ParallaxBgNumber';

const SERVICES = [
  {
    index: '01',
    name: 'YouTube Performance',
    desc: 'Channel strategy, format development, thumbnail & packaging systems, multi-market expansion, performance operations, analytics frameworks.',
    tags: ['Strategy', 'Thumbnails', 'Analytics', 'Multi-language', 'Shorts', 'Long-form'],
  },
  {
    index: '02',
    name: 'Creative Strategy',
    desc: 'Performance creative for DTC and B2B brands. From audience research and barrier mapping to script production and testing frameworks.',
    tags: ['DTC', 'Scripts', 'Ad Creative', 'Testing', 'UGC'],
  },
  {
    index: '03',
    name: 'Digital Products',
    desc: 'AI-powered tools and automation for content operations. We build what the market doesn\u2019t offer.',
    tags: ['SaaS', 'Automation', 'AI Agents', 'YouTube Tools'],
  },
];

export default function Services() {
  const [active, setActive] = useState<number | null>(0);
  const expandRefs = useRef<(HTMLDivElement | null)[]>([]);

  const toggle = useCallback((idx: number) => {
    setActive((prev) => (prev === idx ? null : idx));
  }, []);

  return (
    <section className="services section" id="services">
      <ParallaxBgNumber number="03" />
      <div className="container">
        <RevealOnScroll>
          <p className="section-number"><span>03</span> — Services</p>
        </RevealOnScroll>
        <RevealOnScroll>
          <div className="services-header">
            <h2 className="services-title">Three verticals.<br />One operating system.</h2>
          </div>
        </RevealOnScroll>
        <div className="services-list">
          {SERVICES.map((svc, i) => {
            const isActive = active === i;
            return (
              <RevealOnScroll key={i}>
                <div className={`service-item${isActive ? ' active' : ''}`} data-service={i}>
                  <div className="service-header" onClick={() => toggle(i)} role="button" tabIndex={0} aria-expanded={isActive} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(i); } }}>
                    <span className="service-index">{svc.index}</span>
                    <h3 className="service-name">{svc.name}</h3>
                    <span className="service-arrow">{isActive ? '\u2212' : '+'}</span>
                  </div>
                  <div
                    className="service-expand"
                    ref={(el) => { expandRefs.current[i] = el; }}
                    style={{ maxHeight: isActive ? (expandRefs.current[i]?.scrollHeight ?? 500) + 'px' : '0' }}
                  >
                    <div className="service-expand-inner">
                      <p className="service-desc">{svc.desc}</p>
                      <div className="service-tags">
                        {svc.tags.map((tag) => (
                          <span className="service-tag" key={tag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
        <a href="#contact" className="section-cta-inline" data-magnetic="">Not sure which fits? Start with a free audit</a>
      </div>
    </section>
  );
}
