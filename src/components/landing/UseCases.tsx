'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

const USE_CASES = [
  { title: 'Lead Generation', desc: 'YouTube as your sales funnel. Turn viewers into qualified leads.', img: '/images/usecases/usecase-1.png' },
  { title: 'Ad Revenue', desc: 'AdSense & RPM optimization. Maximize every view.', img: '/images/usecases/usecase-2.png' },
  { title: 'Brand Building', desc: 'Authority & thought leadership through strategic content.', img: '/images/usecases/usecase-3.png' },
  { title: 'Multi-market Expansion', desc: 'One proven format scaled across 15 languages.', img: '/images/usecases/usecase-4.png' },
  { title: 'Shorts Strategy', desc: '60-second formats engineered for discovery.', img: '/images/usecases/usecase-5.png' },
];

export default function UseCases() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef(false);

  // Auto-advance
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (paused || reducedMotion) return;
    const i = setInterval(() => setActive(n => (n + 1) % USE_CASES.length), 4000);
    return () => clearInterval(i);
  }, [paused]);

  // Horizontal trackpad wheel + touch swipe
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const dx = e.deltaX;
      if (Math.abs(dx) > Math.abs(e.deltaY) && Math.abs(dx) > 8) {
        e.preventDefault();
        if (lockRef.current) return;
        lockRef.current = true;
        setActive(n => {
          if (dx > 0) return Math.min(n + 1, USE_CASES.length - 1);
          return Math.max(n - 1, 0);
        });
        setTimeout(() => { lockRef.current = false; }, 450);
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });

    let startX: number | null = null;
    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onTouchEnd = (e: TouchEvent) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) {
        setActive(n => dx < 0 ? Math.min(n + 1, USE_CASES.length - 1) : Math.max(n - 1, 0));
      }
      startX = null;
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <section className="section usecase-section" id="usecases">
      <div className="container">
        <RevealOnScroll>
          <p className="eyebrow"><span>—</span> What we do for clients</p>
          <h2 className="section-title">YouTube performance across every use case.</h2>
        </RevealOnScroll>
      </div>

      <div
        className="usecase-stage"
        ref={stageRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="usecase-track" role="region" aria-label="Use case carousel">
          {USE_CASES.map((uc, i) => {
            const offset = i - active;
            const absOff = Math.abs(offset);
            return (
              <div
                key={i}
                className={`usecase-card${i === active ? ' active' : ''}`}
                onClick={() => setActive(i)}
                style={{
                  transform: `translateX(${offset * 280}px) scale(${i === active ? 1 : 0.8})`,
                  opacity: absOff > 2 ? 0 : absOff > 1 ? 0.3 : absOff === 1 ? 0.6 : 1,
                  zIndex: USE_CASES.length - absOff,
                  filter: i === active ? 'none' : 'brightness(0.4)',
                  pointerEvents: absOff > 1 ? 'none' : 'auto',
                }}
                aria-hidden={i !== active}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={uc.img} alt={uc.title} width={480} height={270} />
              </div>
            );
          })}
        </div>

        <div className="usecase-info" aria-live="polite">
          <h3 className="usecase-title">{USE_CASES[active].title}</h3>
          <p className="usecase-desc">{USE_CASES[active].desc}</p>
        </div>

        <div className="usecase-dots" role="tablist" aria-label="Select use case">
          {USE_CASES.map((uc, i) => (
            <button
              key={i}
              className={`usecase-dot${i === active ? ' active' : ''}`}
              onClick={() => setActive(i)}
              role="tab"
              aria-selected={i === active}
              aria-label={uc.title}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
