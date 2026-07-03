'use client';

/**
 * FAQ.tsx — Fase 2.4 (NUEVO)
 * .section--white, border-top: 4px solid #111.
 * Layout: 2-col — headline left STICKY, accordion right.
 * Accordion pattern reused from Services.tsx (maxHeight transition).
 * Active item: border-left: 2px solid var(--accent), indicator −/+.
 *
 * WCAG contraste:
 *  - Questions: --fg-dark (#111) over white → ~17:1 ✓
 *  - Answers:   #666 over white → ~5.7:1 ✓
 *  - Eyebrow:   --fg-dark-muted (#888) — label use ✓
 *  - Active indicator: #c8ff2e on #111 bg → ~13:1 ✓ (verde sobre negro)
 *    Note: el indicador usa #c8ff2e como FONDO de un círculo dark (#111),
 *    NO como texto sobre blanco. Contraste es negro sobre verde = correcto.
 *
 * Preguntas EXACTAS del .dc.html §57 (faqItems).
 */

import { useState } from 'react';

const FAQ_ITEMS = [
  {
    q: 'How does the free channel audit work?',
    a: 'You submit your YouTube channel URL through our site. Within 48 hours, we send you a detailed performance report covering your content, thumbnails, titles, audience signals, and revenue opportunities. No sales pitch — just data you can act on.',
  },
  {
    q: 'What types of businesses do you work with?',
    a: 'B2B companies, DTC brands, creator-led businesses, and media companies that want YouTube to drive measurable revenue — not just views. Our clients typically have some existing presence and are ready to invest in scaling it.',
  },
  {
    q: "Why can't I see your client list?",
    a: "All our client engagements operate under strict NDAs. We're happy to discuss our approach, methodology, and results on a call. The depth of our strategy work speaks louder than a logo strip.",
  },
  {
    q: 'What does a typical engagement look like?',
    a: 'Most clients start with our channel audit, then move into a Strategy Sprint — two weeks. From there, ongoing retainers cover content production, optimization, and scaling. We adapt to your needs — no rigid packages.',
  },
  {
    q: 'How is Hype On Media different from other YouTube agencies?',
    a: 'We built our systems inside operations managing 75+ channels across 15 languages. That experience, combined with AI-powered production tools we built ourselves, means you get enterprise-grade strategy with the speed of a lean team.',
  },
  {
    q: 'How much does it cost?',
    a: "Engagements vary based on scope. The channel audit is free. Strategy Sprints and ongoing retainers are priced based on your channel's needs and goals. We give you a clear proposal after the audit — no surprises.",
  },
  {
    q: 'Where are you based?',
    a: 'We are a US-based company (Delaware) with operations in Dubai. We work globally across 4 native languages — English, Spanish, French, Russian — and have managed teams across 6 countries.',
  },
];

export default function FAQ() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggle = (i: number) => {
    setActiveFaq((prev) => (prev === i ? null : i));
  };

  return (
    <section className="section section--white faq-section" id="faq">
      <div className="container">
        <div className="faq-grid">
          {/* Left: sticky headline */}
          <div className="faq-sticky">
            <p className="eyebrow faq-eyebrow">FAQ</p>
            <h2 className="faq-headline">
              Frequently
              <br />
              asked
              <br />
              questions.
            </h2>
            <p className="faq-meta">
              Answers to the questions we get asked most. Have something else?
              We&rsquo;re one message away.
            </p>
          </div>

          {/* Right: accordion */}
          <div className="faq-accordion">
            {FAQ_ITEMS.map((item, i) => {
              const isActive = activeFaq === i;
              return (
                <div
                  key={i}
                  className={`faq-item${isActive ? ' faq-item--active' : ''}`}
                >
                  <button
                    className="faq-item__btn"
                    onClick={() => toggle(i)}
                    aria-expanded={isActive}
                    aria-controls={`faq-answer-${i}`}
                  >
                    <h3 className="faq-item__question">{item.q}</h3>
                    <span className="faq-item__indicator" aria-hidden="true">
                      {isActive ? '−' : '+'}
                    </span>
                  </button>

                  <div
                    id={`faq-answer-${i}`}
                    className="faq-item__body"
                    style={{ maxHeight: isActive ? 300 : 0 }}
                    aria-hidden={!isActive}
                  >
                    <div className="faq-item__body-inner">
                      <p className="faq-item__answer">{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
