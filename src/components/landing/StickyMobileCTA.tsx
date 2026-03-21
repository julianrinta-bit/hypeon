'use client';

import { useState, useEffect } from 'react';

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only activate on mobile
    if (window.innerWidth > 768) return;

    const hero = document.getElementById('hero');
    if (!hero) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!dismissed) {
          setVisible(!entry.isIntersecting);
        }
      },
      { threshold: 0.1 }
    );

    obs.observe(hero);
    return () => obs.disconnect();
  }, [dismissed]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
  };

  const handleCTAClick = () => {
    setVisible(false);
    setDismissed(true);
  };

  return (
    <div
      className={`sticky-mobile-cta${visible ? ' visible' : ''}${dismissed ? ' dismissed' : ''}`}
      aria-label="Free audit call to action"
    >
      <button
        className="sticky-mobile-cta-dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        &times;
      </button>
      <span className="sticky-mobile-cta-text">Free Audit</span>
      <a href="#contact" className="sticky-mobile-cta-btn" onClick={handleCTAClick}>
        Get Started &rarr;
      </a>
    </div>
  );
}
