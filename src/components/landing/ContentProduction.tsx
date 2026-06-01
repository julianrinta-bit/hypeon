'use client';
import { useRef, useCallback } from 'react';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import { useDragScroll } from '@/hooks/useDragScroll';
import { useAutoScroll } from '@/hooks/useAutoScroll';

// Each production has a poster image and an optional short video clip (2-3s)
// that plays on hover. Drop video files at /public/video/productions/
const PRODUCTIONS = [
  { title: 'Bamboo!', desc: 'Animated children\'s content. Distribution rights sold to platforms.', format: 'Animation · Licensed', handle: '@bamboo.adventures', poster: '/images/productions/prod-1.png', video: '/video/productions/bamboo-clip.mp4' },
  { title: 'Unscripted World', desc: 'Vietnam documentaries, cinematic storytelling. Licensed to streaming platforms.', format: 'Documentary · Cinematic', handle: '@UnscriptedWorldAsia', poster: '/images/productions/prod-2.png', video: '/video/productions/unscripted-clip.mp4' },
  { title: 'Realidades', desc: 'Spanish-language documentaries and investigative reportajes. Licensed worldwide.', format: 'Documentary · Licensed', handle: '@Realidadescanal', poster: '/images/productions/prod-3.png', video: '/video/productions/realidades-clip.mp4' },
];

interface Production {
  title: string;
  desc: string;
  format: string;
  handle: string;
  poster: string;
  video: string;
}

function ProductionCard({ production: p }: { production: Production }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    // Check reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  }, []);

  const handleMouseLeave = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  }, []);

  return (
    <div
      className="production-card-v2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="prodv2-poster">
        {/* Poster image shown by default; video plays on hover */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          src={p.video}
          poster={p.poster}
          muted
          playsInline
          loop
          preload="none"
          className="prodv2-video"
        />
        <div className="prodv2-badge">{p.format}</div>
      </div>
      <div className="prodv2-info">
        <div className="prodv2-title">{p.title}</div>
        <div className="prodv2-desc">{p.desc}</div>
        <div className="prodv2-handle">{p.handle}</div>
      </div>
    </div>
  );
}

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
          <ProductionCard key={i} production={p} />
        ))}
      </div>
    </section>
  );
}
