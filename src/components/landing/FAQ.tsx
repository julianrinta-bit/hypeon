'use client';
import { useState, useRef, useCallback } from 'react';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import ParallaxBgNumber from '@/components/ui/ParallaxBgNumber';

const FAQS = [
  {
    q: 'How does the free channel audit work?',
    a: 'You submit your YouTube channel URL through our site. Within 48 hours, we send you a detailed performance report covering your content, thumbnails, titles, audience signals, and revenue opportunities. No sales pitch attached \u2014 just data you can act on.',
  },
  {
    q: 'What types of businesses do you work with?',
    a: 'B2B companies, DTC brands, creator-led businesses, and media companies that want YouTube to drive measurable revenue \u2014 not just views. Our clients typically have some existing presence and are ready to invest in scaling it.',
  },
  {
    q: 'Why can\u2019t I see your client list?',
    a: 'All our client engagements operate under strict NDAs. We\u2019re happy to discuss our approach, methodology, and results on a call. The depth of our strategy work speaks louder than a logo strip.',
  },
  {
    q: 'What does a typical engagement look like?',
    a: 'Most clients start with our channel audit, then move into a Strategy Sprint \u2014 two weeks. From there, ongoing retainers cover content production, optimization, and scaling. We adapt to your needs \u2014 no rigid packages.',
  },
  {
    q: 'How is Hype On different from other YouTube agencies?',
    a: 'We built our systems inside operations managing 50+ channels across 15 languages. That experience, combined with AI-powered production tools we built ourselves, means you get enterprise-grade strategy with the speed of a lean team.',
  },
  {
    q: 'Do you only work with YouTube?',
    a: 'YouTube Performance is our core. We also offer Creative Strategy for DTC and B2B brands, and build digital products and AI tools. But YouTube is where our deepest expertise lives.',
  },
  {
    q: 'How much does it cost?',
    a: 'Engagements vary based on scope. The channel audit is free. Strategy Sprints and ongoing retainers are priced based on your channel\u2019s needs and goals. We give you a clear proposal after the audit \u2014 no surprises.',
  },
  {
    q: 'Where are you based?',
    a: 'Dubai, UAE. We operate globally across 4 native languages \u2014 English, Spanish, French, Russian \u2014 and have managed teams across 6 countries. Time zones are not a problem.',
  },
];

export default function FAQ() {
  const [active, setActive] = useState<number | null>(null);
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const toggle = useCallback((idx: number) => {
    setActive((prev) => (prev === idx ? null : idx));
  }, []);

  return (
    <section className="faq section" id="faq">
      <ParallaxBgNumber number="FAQ" />
      <div className="container">
        <RevealOnScroll>
          <p className="section-number"><span>—</span> FAQ</p>
        </RevealOnScroll>
        <RevealOnScroll>
          <div className="faq-header">
            <h2 className="faq-title">Questions we get asked</h2>
          </div>
        </RevealOnScroll>
        <div className="faq-list">
          {FAQS.map((faq, i) => {
            const isActive = active === i;
            return (
              <RevealOnScroll key={i}>
                <div className={`faq-item${isActive ? ' active' : ''}`} data-faq={i}>
                  <div className="faq-question" onClick={() => toggle(i)} role="button" tabIndex={0} aria-expanded={isActive} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(i); } }}>
                    <span className="faq-question-text">{faq.q}</span>
                    <span className="faq-arrow">{isActive ? '\u2212' : '+'}</span>
                  </div>
                  <div
                    className="faq-answer"
                    ref={(el) => { answerRefs.current[i] = el; }}
                    style={{ maxHeight: isActive ? (answerRefs.current[i]?.scrollHeight ?? 300) + 'px' : '0' }}
                  >
                    <div className="faq-answer-inner">
                      <p className="faq-answer-text">{faq.a}</p>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
