'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export default function ExitIntentModal() {
  const [active, setActive] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Desktop only, show once per session
    if (window.innerWidth <= 768) return;
    if (sessionStorage.getItem('exitShown')) return;

    function handleMouseOut(e: MouseEvent) {
      if (e.clientY <= 0 && !sessionStorage.getItem('exitShown')) {
        sessionStorage.setItem('exitShown', '1');
        setActive(true);
      }
    }

    document.addEventListener('mouseout', handleMouseOut);
    return () => document.removeEventListener('mouseout', handleMouseOut);
  }, []);

  const close = useCallback(() => setActive(false), []);

  // Focus email input when modal opens
  useEffect(() => {
    if (active) {
      emailRef.current?.focus();
    }
  }, [active]);

  // Escape key to close + focus trap
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }

      if (e.key === 'Tab') {
        const modal = modalRef.current;
        if (!modal) return;

        const focusable = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [active, close]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) close();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value;
    if (!email) return;

    setActive(false);

    // Navigate to contact section with email as URL parameter.
    // ContactForm reads `prefill_email` from the URL on mount via useEffect
    // and populates the email field. This avoids direct DOM writes that bypass React state.
    window.location.href = `/#contact?prefill_email=${encodeURIComponent(email)}`;
  };

  return (
    <div
      className={`exit-overlay${active ? ' active' : ''}`}
      id="exit-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Free audit offer"
      onClick={handleOverlayClick}
    >
      <div className="exit-modal" ref={modalRef}>
        <button className="exit-modal-close" onClick={close} aria-label="Close">
          &times;
        </button>
        <p className="exit-modal-pre">Before you go &mdash;</p>
        <h3 className="exit-modal-title">
          Before you go &mdash; drop your info and we{"'"}ll show you what we{"'"}d do differently.
        </h3>
        <p className="exit-modal-desc">Free audit. No strings attached.</p>
        <form className="exit-modal-form" onSubmit={handleSubmit}>
          <input
            className="exit-modal-input"
            type="email"
            placeholder="your@email.com"
            required
            aria-label="Your email"
            ref={emailRef}
          />
          <button className="exit-modal-submit" type="submit">
            Get My Free Audit &rarr;
          </button>
        </form>
      </div>
    </div>
  );
}
