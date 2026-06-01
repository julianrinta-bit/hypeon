'use client';
import { useRef } from 'react';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import { useDragScroll } from '@/hooks/useDragScroll';
import { useAutoScroll } from '@/hooks/useAutoScroll';

const PRODUCTIONS = [
  { title: 'Bamboo!', desc: 'Animated children\'s content. Distribution rights sold to platforms.', format: 'Animation · Licensed', handle: '@bamboo.adventures', img: '/images/productions/prod-1.png' },
  { title: 'Unscripted World', desc: 'Vietnam documentaries, cinematic storytelling. Licensed to streaming platforms.', format: 'Documentary · Cinematic', handle: '@UnscriptedWorldAsia', img: '/images/productions/prod-2.png' },
  { title: 'Realidades', desc: 'Spanish-language documentaries and investigative reportajes. Licensed worldwide.', format: 'Documentary · Licensed', handle: '@Realidadescanal', img: '/images/productions/prod-3.png' },
  { title: 'Format 4', desc: 'Placeholder — replace with your next original format or licensed content.', format: 'Coming Soon', handle: '@placeholder', img: '/images/productions/prod-4.png' },
  { title: 'Format 5', desc: 'Placeholder — replace with your next original format or licensed content.', format: 'In Development', handle: '@placeholder', img: '/images/productions/prod-5.png' },
];

export default function ContentProduction() {
  const trackRef = useRef<HTMLDivElement>(null);
  useDragScroll(trackRef);
  useAutoScroll(trackRef, 0.4);

  return (
    <section className="section" id="content">
      <div className="container">
        <RevealOnScroll>
          <p className="eyebrow"><span>07</span> — Original content</p>
          <h2 className="section-title">We don&rsquo;t just consult. We produce.</h2>
          <p className="section-subtitle">Original formats created by our team, licensed to platforms worldwide.</p>
        </RevealOnScroll>
      </div>

      <div className="carousel-track" ref={trackRef} style={{ marginTop: 32 }}>
        {PRODUCTIONS.map((p, i) => (
          <div key={i} className="production-card-v2">
            <div className="prodv2-poster">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt={p.title} loading="lazy" />
              <div className="prodv2-badge">{p.format}</div>
            </div>
            <div className="prodv2-info">
              <div className="prodv2-title">{p.title}</div>
              <div className="prodv2-desc">{p.desc}</div>
              <div className="prodv2-handle">{p.handle}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
