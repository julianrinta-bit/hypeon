import RevealOnScroll from '@/components/ui/RevealOnScroll';

export default function Testimonials() {
  return (
    <section className="testimonials section" id="testimonials">
      <div className="container">
        <RevealOnScroll stagger>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <span className="testimonial-quote-mark" aria-hidden="true">&ldquo;</span>
              <p className="testimonial-text">We&rsquo;d been posting on YouTube for two years with no strategy. Hype On restructured our entire approach — thumbnails, titles, content architecture. Six months later, YouTube is our top lead source.</p>
              <div className="testimonial-name">Rachel M.</div>
              <div className="testimonial-role">VP Marketing, Enterprise SaaS</div>
            </div>
            <div className="testimonial-card">
              <span className="testimonial-quote-mark" aria-hidden="true">&ldquo;</span>
              <p className="testimonial-text">What surprised me was how much they understood about conversion, not just views. Our channel went from a content experiment to a pipeline driver. The audit alone was worth more than what most agencies charge for a full month.</p>
              <div className="testimonial-name">Daniel K.</div>
              <div className="testimonial-role">Founder, DTC Brand</div>
            </div>
            <div className="testimonial-card">
              <span className="testimonial-quote-mark" aria-hidden="true">&ldquo;</span>
              <p className="testimonial-text">I run five channels and was drowning in production logistics. They plugged into our workflow in two weeks. Best part: when something underperforms, they call to talk strategy — not just swap a thumbnail.</p>
              <div className="testimonial-name">Sofia T.</div>
              <div className="testimonial-role">Creative Director, Media Network</div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
