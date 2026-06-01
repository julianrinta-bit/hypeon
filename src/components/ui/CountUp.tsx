'use client';
import { useState, useEffect } from 'react';

interface CountUpProps {
  end: number;
  start: boolean;
  prefix?: string;
  dur?: number;
}

export default function CountUp({ end, start, prefix = '', dur = 1500 }: CountUpProps) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    // Respect prefers-reduced-motion — show final value immediately
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      if (start) setVal(end);
      return;
    }

    if (!start) return;

    let raf: number;
    let t0: number | null = null;

    const tick = (t: number) => {
      if (!t0) t0 = t;
      const p = Math.min((t - t0) / dur, 1);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(end * eased);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setVal(end);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, end, dur]);

  return <span>{prefix}{Math.round(val)}</span>;
}
