'use client';
import { useState, useEffect } from 'react';

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div className={`sticky-cta${visible ? ' visible' : ''}`} aria-hidden={!visible}>
      <a href="/analyze">
        Get a Free Channel Audit &rarr;
      </a>
    </div>
  );
}
