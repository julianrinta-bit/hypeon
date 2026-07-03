'use client';

/**
 * Testimonials.tsx — refactored to match dc.html exactly:
 * - Dark full-width featured quote (Daniel K.)
 * - 2 cards on cream background (Rachel M., Sofia T.)
 * Platform Data block moved to StatsProof.tsx
 */

import RevealOnScroll from '@/components/ui/RevealOnScroll';

export default function Testimonials() {
  return (
    <section className="testi-section" id="testimonials">
      {/* ── Dark top: featured quote (Daniel K.) ── */}
      <div className="testi-dark-top">
        <div className="testi-dark-inner">
          <p className="testi-eyebrow">Your numbers are the only metric we care about.</p>
          <div className="testi-big-quote" aria-hidden="true">&ldquo;</div>
          <p className="testi-featured-text">
            &ldquo;What surprised me was how much they understood about conversion, not just views. Our channel went from a content experiment to a pipeline driver. The audit alone was worth more than a full month at most agencies.&rdquo;
          </p>
          <div className="testi-featured-author">
            <div className="testi-avatar testi-avatar--green">D</div>
            <div className="testi-author-info">
              <span className="testi-author-name">Daniel K.</span>
              <span className="testi-author-role">Founder · DTC Brand</span>
            </div>
            <div className="testi-badge-pill">Content &rarr; pipeline driver</div>
          </div>
        </div>
      </div>

      {/* ── Cream bottom: 2 cards ── */}
      <div className="testi-cream-bottom">
        <div className="testi-container">
          <div className="testi-cards testi-cards--2col">

            {/* Card 1 — Rachel M. */}
            <RevealOnScroll>
              <div className="testi-card">
                <div className="testi-card-badge">YouTube &rarr; #1 lead source</div>
                <p className="testi-card-text">
                  &ldquo;We&rsquo;d been posting on YouTube for two years with no strategy. Hype On Media restructured our entire approach — thumbnails, titles, content architecture. Six months later, YouTube is our top lead source.&rdquo;
                </p>
                <div className="testi-card-footer">
                  <div className="testi-avatar testi-avatar--dark">R</div>
                  <div>
                    <div className="testi-card-name">Rachel M.</div>
                    <div className="testi-card-role">VP Marketing · Enterprise SaaS</div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>

            {/* Card 2 — Sofia T. */}
            <RevealOnScroll>
              <div className="testi-card">
                <div className="testi-card-badge">5 channels managed seamlessly</div>
                <p className="testi-card-text">
                  &ldquo;I run five channels and was drowning in production logistics. They plugged into our workflow in two weeks. Best part: when something underperforms, they call to talk strategy — not just swap a thumbnail.&rdquo;
                </p>
                <div className="testi-card-footer">
                  <div className="testi-avatar testi-avatar--dark">S</div>
                  <div>
                    <div className="testi-card-name">Sofia T.</div>
                    <div className="testi-card-role">Creative Director · Media Network</div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>

          </div>
        </div>
      </div>
    </section>
  );
}
