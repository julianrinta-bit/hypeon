'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

/* === Nav v2 ===
   Design: white bg (always), 64px height, dark text, green CTA, blur/border on scroll.
   Links: #services, #proof, #blog, #contact (eliminadas: #channels, #guarantee, #work, #use-cases)
*/

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const open = useCallback(() => {
    scrollY.current = window.scrollY;
    const html = document.documentElement;
    html.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY.current}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    setMenuOpen(true);
  }, []);

  const close = useCallback(() => {
    setMenuOpen(false);
    const html = document.documentElement;
    html.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    window.scrollTo(0, scrollY.current);
    hamburgerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    const preventTouch = (e: TouchEvent) => e.preventDefault();
    overlay.addEventListener('touchmove', preventTouch, { passive: false });
    return () => overlay.removeEventListener('touchmove', preventTouch);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') {
        const overlay = overlayRef.current;
        if (!overlay) return;
        const focusable = overlay.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen, close]);

  useEffect(() => () => {
    document.documentElement.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
  }, []);

  return (
    <>
      <nav
        className={`nav-v2${scrolled ? ' nav-v2--scrolled' : ''}`}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <a href="/" className="nav-v2-logo" aria-label="Hype On Media home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hypeon-logo.png" alt="" width={26} height={26} style={{ borderRadius: 5, objectFit: 'contain' }} />
          <span className="nav-v2-logo-text">Hype On Media</span>
        </a>

        {/* Desktop links */}
        <ul className="nav-v2-links" aria-label="Site sections">
          <li><a href="/#services" className="nav-v2-link">Services</a></li>
          <li><a href="/#proof" className="nav-v2-link">Proof</a></li>
          <li><a href="/blog" className="nav-v2-link">Blog</a></li>
          <li><a href="/#contact" className="nav-v2-link">Contact</a></li>
        </ul>

        {/* CTAs */}
        <div className="nav-v2-actions">
          <a href="/login" className="nav-v2-login">Log in</a>
          <a href="/#contact" className="nav-v2-cta">Book a Call →</a>
        </div>

        {/* Hamburger */}
        <button
          className={`nav-v2-hamburger${menuOpen ? ' hamburger-hidden' : ''}`}
          onClick={open}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          ref={hamburgerRef}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile slide-in panel */}
      <div
        className={`nav-v2-mobile${menuOpen ? ' open' : ''}`}
        aria-hidden={!menuOpen}
        ref={overlayRef}
      >
        <button
          className="nav-v2-mobile-close"
          onClick={close}
          aria-label="Close menu"
        >
          &times;
        </button>
        <a href="/#services" className="nav-v2-mobile-link" onClick={close}>Services</a>
        <a href="/#proof" className="nav-v2-mobile-link" onClick={close}>Proof</a>
        <a href="/blog" className="nav-v2-mobile-link" onClick={close}>Blog</a>
        <a href="/#contact" className="nav-v2-mobile-link" onClick={close}>Contact</a>
        <a href="/login" className="nav-v2-mobile-link" onClick={close}>Log in</a>
        <a href="/#contact" className="nav-v2-mobile-cta" onClick={close}>Book a Call &rarr;</a>
      </div>
    </>
  );
}
