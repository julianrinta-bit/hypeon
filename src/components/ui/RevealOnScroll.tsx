'use client';
import { useRef, useEffect, useState, type ReactNode } from 'react';

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  stagger?: boolean;
  as?: 'div' | 'section';
}

export default function RevealOnScroll({
  children,
  className = 'reveal',
  threshold = 0.15,
  stagger = false,
  as: Tag = 'div',
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  const base = stagger ? 'stagger-reveal' : className;
  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={`${base}${visible ? ' visible' : ''}`}>
      {children}
    </Tag>
  );
}
