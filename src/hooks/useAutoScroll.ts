'use client';
import { useEffect, RefObject } from 'react';

export function useAutoScroll(ref: RefObject<HTMLElement | null>, speed = 0.5) {
  useEffect(() => {
    // Respect prefers-reduced-motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const el = ref.current;
    if (!el) return;

    let raf: number;
    let paused = false;

    const step = () => {
      if (!paused) {
        if (el.scrollLeft < el.scrollWidth - el.clientWidth) {
          el.scrollLeft += speed;
        } else {
          el.scrollLeft = 0;
        }
      }
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    const pause = () => { paused = true; };
    const resume = () => { paused = false; };

    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);
    el.addEventListener('touchstart', pause, { passive: true });
    el.addEventListener('touchend', resume);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
      el.removeEventListener('touchstart', pause);
      el.removeEventListener('touchend', resume);
    };
  }, [ref, speed]);
}
