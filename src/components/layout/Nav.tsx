'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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

  // Prevent touchmove on overlay (iOS Safari scroll-through fix)
  useEffect(() => {
    if (!menuOpen) return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    const preventTouch = (e: TouchEvent) => e.preventDefault();
    overlay.addEventListener('touchmove', preventTouch, { passive: false });
    return () => overlay.removeEventListener('touchmove', preventTouch);
  }, [menuOpen]);

  // Escape + focus trap
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

  // Cleanup on unmount
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
        className={`nav${scrolled ? ' nav--scrolled' : ''}`}
        aria-label="Main navigation"
        style={{
          background: 'rgba(10,10,12,.8)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderBottom: scrolled ? '1px solid rgba(200,255,46,0.25)' : '1px solid rgba(240,240,236,0.06)',
        }}
      >
        <a href="/" className="nav-logo" aria-label="Hype On Media home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span className="nav-logo-mark">H</span>
          <span className="nav-logo-text">Hype<span style={{ color: 'var(--accent)' }}>On</span> Media</span>
        </a>

        <ul className="nav-links" style={{ fontFamily: 'var(--font-mono)', listStyle: 'none' }}>
          <li><a href="/#channels">Channels</a></li>
          <li><a href="/#services">Services</a></li>
          <li><a href="/#guarantee">Guarantee</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/#contact">Contact</a></li>
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <a href="/login" className="nav-login">Log in</a>
          <a href="/analyze" className="nav-cta">Get Free Audit</a>
        </div>

        {/* Hamburger */}
        <button
          className={`hamburger-btn${menuOpen ? ' hamburger-hidden' : ''}`}
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
        className={`nav-mobile${menuOpen ? ' open' : ''}`}
        aria-hidden={!menuOpen}
        ref={overlayRef}
        style={{ zIndex: 101 }}
      >
        <button
          style={{
            position: 'absolute',
            top: 28,
            right: 24,
            background: 'none',
            border: 'none',
            color: 'var(--white)',
            fontSize: 28,
            cursor: 'pointer',
            lineHeight: 1,
          }}
          onClick={close}
          aria-label="Close menu"
        >
          &times;
        </button>
        <a href="/#channels" className="mobile-menu-link" onClick={close}>Channels</a>
        <a href="/#services" className="mobile-menu-link" onClick={close}>Services</a>
        <a href="/#guarantee" className="mobile-menu-link" onClick={close}>Guarantee</a>
        <a href="/blog" className="mobile-menu-link" onClick={close}>Blog</a>
        <a href="/#contact" className="mobile-menu-link" onClick={close}>Contact</a>
        <a href="/login" className="mobile-menu-link" onClick={close}>Log in</a>
        <a href="/analyze" className="nav-mobile-cta" onClick={close}>Get a Free Audit &rarr;</a>
      </div>
    </>
  );
}
