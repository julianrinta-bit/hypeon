'use client';
import { useState, type FormEvent } from 'react';

export default function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // For now, just show success (no backend yet)
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <aside className="newsletter-cta">
        <p className="newsletter-cta__success">You're in. Watch your inbox.</p>
      </aside>
    );
  }

  return (
    <aside className="newsletter-cta">
      <p className="newsletter-cta__headline">Get YouTube growth insights weekly</p>
      <p className="newsletter-cta__body">Strategies, data, and playbooks from managing 50+ channels. No spam. Unsubscribe anytime.</p>
      <form onSubmit={handleSubmit} className="newsletter-cta__form">
        <input
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="newsletter-cta__input"
          aria-label="Email address"
        />
        <button type="submit" className="newsletter-cta__button">Subscribe</button>
      </form>
    </aside>
  );
}
