'use client';
import { useState, useEffect } from 'react';

const HERO_STATS = [
  { number: '20B', unit: '+', headline: 'views across channels our team has built and scaled.' },
  { number: '$4M', unit: '+', headline: 'monthly revenue managed at peak across our clients.' },
  { number: '50', unit: '+', headline: 'YouTube channels built, scaled, and optimized.' },
  { number: '20', unit: '+', headline: 'Play Buttons earned by channels we directed.' },
  { number: '15', unit: '', headline: 'languages of content production and localization.' },
];

export default function Hero() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;
    const i = setInterval(() => setIdx(n => (n + 1) % HERO_STATS.length), 3500);
    return () => clearInterval(i);
  }, []);

  const s = HERO_STATS[idx];

  return (
    <section
      className="hero section"
      id="hero"
      style={{ paddingTop: 'clamp(120px,20vh,200px)', paddingBottom: 'clamp(60px,10vh,120px)', minHeight: '90vh', display: 'flex', alignItems: 'center' }}
    >
      <div className="hero-glow hero-glow--1" aria-hidden="true" />
      <div className="hero-glow hero-glow--2" aria-hidden="true" />
      <div className="container" style={{ width: '100%' }}>
        <p className="hero-tag">YouTube performance agency — United States</p>
        <div className="hero-big-number" key={`n-${idx}`}>
          {s.number}<span className="accent">{s.unit}</span>
        </div>
        <h1 className="hero-headline" key={`h-${idx}`}>
          {s.headline}
        </h1>
        <p className="hero-stats-line">
          <strong>50+</strong> channels &nbsp;/&nbsp; <strong>20+</strong> Play Buttons &nbsp;/&nbsp; <strong>15</strong> languages &nbsp;/&nbsp; Since <strong>2015</strong>
        </p>
        <div className="hero-cta-row">
          <a href="/analyze" className="btn-primary">
            <span>Get a Free Channel Audit</span>
            <span className="arrow">&rarr;</span>
          </a>
          <a href="/#channels" className="btn-ghost">See the channels &rarr;</a>
        </div>
      </div>
    </section>
  );
}
