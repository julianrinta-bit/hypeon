'use client';
import { useRef } from 'react';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import { useDragScroll } from '@/hooks/useDragScroll';
import { useAutoScroll } from '@/hooks/useAutoScroll';

const TESTIMONIALS = [
  {
    text: "We'd been posting on YouTube for two years with no strategy. Hype On Media restructured our entire approach — thumbnails, titles, content architecture. Six months later, YouTube is our top lead source.",
    name: 'Rachel M.',
    role: 'VP Marketing, Enterprise SaaS',
    metric: 'YouTube → #1 lead source',
    color: '#e94560',
  },
  {
    text: "What surprised me was how much they understood about conversion, not just views. Our channel went from a content experiment to a pipeline driver. The audit alone was worth more than what most agencies charge for a full month.",
    name: 'Daniel K.',
    role: 'Founder, DTC Brand',
    metric: 'Content experiment → pipeline driver',
    color: '#533483',
  },
  {
    text: "I run five channels and was drowning in production logistics. They plugged into our workflow in two weeks. Best part: when something underperforms, they call to talk strategy — not just swap a thumbnail.",
    name: 'Sofia T.',
    role: 'Creative Director, Media Network',
    metric: '5 channels managed seamlessly',
    color: '#4ecdc4',
  },
  {
    text: "Placeholder testimonial — replace with real client feedback. This card shows how a fourth testimonial would look in the grid layout.",
    name: 'Client Name',
    role: 'Title, Company',
    metric: 'Key metric here',
    color: '#e67e22',
  },
  {
    text: "Placeholder testimonial — replace with real client feedback. Another slot for social proof from a satisfied client.",
    name: 'Client Name',
    role: 'Title, Company',
    metric: 'Key metric here',
    color: '#3498db',
  },
];

export default function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);
  useDragScroll(trackRef);
  useAutoScroll(trackRef, 0.5);

  return (
    <section className="section" id="testimonials">
      <div className="container">
        <RevealOnScroll>
          <p className="eyebrow"><span>06</span> — What clients say</p>
          <h2 className="section-title">Results speak. So do our clients.</h2>
        </RevealOnScroll>
      </div>
      <div className="carousel-track" ref={trackRef} style={{ marginTop: 32 }}>
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="testimonial-card-v2">
            <div className="testimonial-quote" aria-hidden="true">&ldquo;</div>
            <p className="testimonial-text">{t.text}</p>
            <div className="testimonial-metric">{t.metric}</div>
            <div className="testimonial-author">
              <div
                className="testimonial-avatar"
                style={{ background: t.color }}
                aria-hidden="true"
              >
                {t.name[0]}
              </div>
              <div>
                <div className="testimonial-name">{t.name}</div>
                <div className="testimonial-role">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
