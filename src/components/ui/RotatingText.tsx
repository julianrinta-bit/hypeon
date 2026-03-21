'use client';
import { useRef, useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const PHRASES = ['YouTube channel', 'creator brand', 'DTC campaign', 'B2B content', 'brand channel', 'content library'];
const INTERVAL_MS = 3000;

export default function RotatingText() {
  const ref = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    const interval = setInterval(() => {
      const nextIndex = (index + 1) % PHRASES.length;

      el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s';
      el.style.transform = 'translateY(-110%)';
      el.style.opacity = '0';

      setTimeout(() => {
        setIndex(nextIndex);
        el.textContent = PHRASES[nextIndex];
        el.style.transition = 'none';
        el.style.transform = 'translateY(110%)';

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s';
            el.style.transform = 'translateY(0)';
            el.style.opacity = '1';
          });
        });
      }, 350);
    }, INTERVAL_MS);

    return () => clearInterval(interval);
  }, [index, reduced]);

  return (
    <span className="rotating-wrapper">
      <span className="rotating-text" ref={ref}>
        {PHRASES[index]}
      </span>
    </span>
  );
}
