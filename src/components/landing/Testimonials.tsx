'use client';
import { useState, useEffect, useCallback } from 'react';

const testimonials = [
  {
    text: "We\u2019d been posting on YouTube for two years with no strategy. Hype On Media restructured our entire approach \u2014 thumbnails, titles, content architecture. Six months later, YouTube is our top lead source.",
    name: "Rachel M.",
    role: "VP Marketing, Enterprise SaaS",
    metric: "YouTube \u2192 #1 lead source"
  },
  {
    text: "What surprised me was how much they understood about conversion, not just views. Our channel went from a content experiment to a pipeline driver. The audit alone was worth more than what most agencies charge for a full month.",
    name: "Daniel K.",
    role: "Founder, DTC Brand",
    metric: "Content experiment \u2192 pipeline driver"
  },
  {
    text: "I run five channels and was drowning in production logistics. They plugged into our workflow in two weeks. Best part: when something underperforms, they call to talk strategy \u2014 not just swap a thumbnail.",
    name: "Sofia T.",
    role: "Creative Director, Media Network",
    metric: "5 channels managed seamlessly"
  }
];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [paused, reducedMotion, next]);

  return (
    <section className="testimonials section" id="testimonials">
      <div className="container">
        <div
          className="testimonials-grid"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          role="region"
          aria-roledescription="carousel"
          aria-label="Client testimonials"
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`testimonial-card${i === active ? ' active' : ''}`}
              aria-hidden={i !== active}
            >
              <span className="testimonial-quote-mark" aria-hidden="true">&ldquo;</span>
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-metric">{t.metric}</div>
              <div className="testimonial-name">{t.name}</div>
              <div className="testimonial-role">{t.role}</div>
            </div>
          ))}
          <div className="testimonial-dots" role="tablist" aria-label="Select testimonial">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`testimonial-dot${i === active ? ' active' : ''}`}
                onClick={() => setActive(i)}
                role="tab"
                aria-selected={i === active}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
