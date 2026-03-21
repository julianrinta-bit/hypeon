'use client';
import { useRef, useEffect } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ParallaxBgNumberProps {
  number: string;
}

export default function ParallaxBgNumber({ number }: ParallaxBgNumberProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    let rafId: number;

    function update() {
      const section = el!.parentElement;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const offset = (sectionCenter - viewportCenter) * 0.06;
      el!.style.transform = `translateY(${offset}px)`;
      rafId = requestAnimationFrame(update);
    }

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [reduced]);

  return (
    <div className="section-bg-number" ref={ref} aria-hidden="true">
      {number}
    </div>
  );
}
