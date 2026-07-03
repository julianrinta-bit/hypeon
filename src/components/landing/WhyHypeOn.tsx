// Server Component — no 'use client' needed (static content)

export default function WhyHypeOn() {
  return (
    <section className="why-hype-on">
      <div className="why-inner">
        {/* Header */}
        <div className="why-header">
          <div className="why-eyebrow">Why Hype On</div>
          <h2 className="why-heading">
            Strategy that works for creators,<br />
            not against them.
          </h2>
        </div>

        {/* 3-col × 2-row grid: 2×2 feat-cards + 1 testimonial spanning both rows */}
        <div className="why-grid">

          {/* Card 1 — No long-term commitments */}
          <div className="feat-card">
            <div className="feat-card-badge">Deep expertise</div>
            <h3>No long-term commitments.</h3>
            <p>We don&apos;t lock you into multi-year contracts. Engagements are structured around your goals, not ours.</p>
          </div>

          {/* Card 2 — AI-powered */}
          <div className="feat-card">
            <div className="feat-card-badge">AI-powered</div>
            <h3>60%+ production cost reduction.</h3>
            <p>AI handles volume. Humans handle judgment. We&apos;ve been building these systems since 2022 — before the rest of the industry caught on.</p>
          </div>

          {/* Testimonial — spans rows 1 and 2, column 3 */}
          <div className="why-testimonial">
            <div>
              <div className="why-testimonial-quote-mark">&ldquo;</div>
              <p className="why-testimonial-text">
                &ldquo;We&apos;d been posting on YouTube for two years with no strategy. Hype On Media restructured everything — thumbnails, titles, content architecture. Six months later, YouTube is our top lead source.&rdquo;
              </p>
              <div className="why-testimonial-author">
                <div className="why-testimonial-avatar">R</div>
                <div>
                  <div className="why-testimonial-name">Rachel M.</div>
                  <div className="why-testimonial-role">VP Marketing · Enterprise SaaS</div>
                </div>
              </div>
            </div>
            <a href="#contact" className="why-testimonial-cta">
              Get a Free Audit →
            </a>
          </div>

          {/* Card 3 — Full-stack team */}
          <div className="feat-card">
            <div className="feat-card-badge">Full-stack team</div>
            <h3>Strategists, editors, translators.</h3>
            <p>You get a complete team — not a single point of contact. Strategy, production, thumbnails, analytics, and translation all under one roof.</p>
          </div>

          {/* Card 4 — Data-first */}
          <div className="feat-card">
            <div className="feat-card-badge">Data-first</div>
            <h3>No guesswork. Just data.</h3>
            <p>Every decision is backed by analytics. Weekly analysis, monthly reports, and a clear view of what&apos;s working and what isn&apos;t — always.</p>
          </div>

        </div>
      </div>
    </section>
  );
}
