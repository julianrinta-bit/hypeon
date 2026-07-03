'use client';

import { useState, useEffect } from 'react';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

const ROTATING_STATS = [
  { value: '10+', label: 'Years' },
  { value: '6', label: 'Countries' },
  { value: '4', label: 'Languages' },
];

const AI_CANT_REPLACE = [
  {
    title: 'Creative judgment',
    body: "Knowing what makes a video work isn't a prompt. It's 10 years of watching what doesn't.",
  },
  {
    title: 'Cultural context',
    body: 'Native speakers in every market we operate in. Localization that actually sounds local.',
  },
  {
    title: 'Accountability',
    body: 'A named human reviews every output. You always know who to call when something matters.',
  },
];

export default function Team() {
  const [statIdx, setStatIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatIdx((i) => (i + 1) % ROTATING_STATS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const current = ROTATING_STATS[statIdx];

  return (
    <section className="team-section" id="team">
      <div className="team-container">
        {/* Left column */}
        <RevealOnScroll>
          <div className="team-left">
            <p className="team-eyebrow">About us</p>

            {/* Rotating big stat */}
            <div className="team-stat-block" aria-live="polite" aria-atomic="true">
              <span className="team-stat-value">{current.value}</span>
              <span className="team-stat-label">{current.label}</span>
            </div>

            <h2 className="team-headline">
              Built inside<br />the industry.<br />
              <span className="team-headline-accent">Not outside it.</span>
            </h2>

            <p className="team-body">
              Our team didn&rsquo;t learn this from a course or a certification. They built the actual content operations at some of the largest media companies on the planet — production houses, broadcasters, streaming platforms, and networks managing thousands of videos per month across every language and market.
            </p>
            <p className="team-body">
              Then we left. And built something better — leaner, faster, and smarter. AI handles the volume. Humans handle the judgment. And humans are accountable for every decision.
            </p>

            <div className="team-quote-block">
              <p className="team-quote-text">
                &ldquo;AI handles the volume. Humans handle the judgment. And humans are accountable for every decision.&rdquo;
              </p>
            </div>

            <a href="#contact" className="team-cta">Work with us →</a>
          </div>
        </RevealOnScroll>

        {/* Right column */}
        <RevealOnScroll className="reveal reveal-delay-1">
          <div className="team-right">
            {/* Global presence card */}
            <div className="team-card">
              <p className="team-card-eyebrow">Global presence</p>
              <div className="team-presence-grid">
                {ROTATING_STATS.map((s) => (
                  <div key={s.label} className="team-presence-cell">
                    <span className="team-presence-value">{s.value}</span>
                    <span className="team-presence-label">{s.label}</span>
                  </div>
                ))}
                <div className="team-presence-cell">
                  <span className="team-presence-value">4</span>
                  <span className="team-presence-label">Continents</span>
                </div>
              </div>
              <p className="team-locations">US · UAE · EUROPE · LATAM · E.EUROPE · ASIA</p>
            </div>

            {/* What AI can't replace card */}
            <div className="team-card">
              <p className="team-card-eyebrow">What AI can&rsquo;t replace</p>
              <div className="team-ai-list">
                {AI_CANT_REPLACE.map((item) => (
                  <div key={item.title} className="team-ai-item">
                    <span className="team-ai-diamond" aria-hidden="true">◆</span>
                    <div>
                      <p className="team-ai-title">{item.title}</p>
                      <p className="team-ai-body">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* NDA note */}
            <div className="team-nda-note">
              <span className="team-ai-diamond" aria-hidden="true">◆</span>
              <p className="team-nda-text">
                Our team previously operated inside the content engines behind some of the most-watched channels in the world — operations producing thousands of videos per month for global audiences. All engagements are NDA-bound; we share specifics on request.
              </p>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
