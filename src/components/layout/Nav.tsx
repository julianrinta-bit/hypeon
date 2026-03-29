'use client';
import { useState, useEffect } from 'react';
import MobileMenu from './MobileMenu';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // check initial position
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`} aria-label="Main navigation">
        <a href="/" className="nav-logo" aria-label="Hype On Media home">
          <span className="nav-logo-mark">H</span>
          <span className="nav-logo-text">Hype<span style={{color: 'var(--accent)'}}>On</span> Media</span>
        </a>
        <ul className="nav-links">
          <li><a href="/#proof">Proof</a></li>
          <li><a href="/#services">Services</a></li>
          <li><a href="/#work">Work</a></li>
          <li><a href="/#about">About</a></li>
          <li><a href="/blog">Blog</a></li>
        </ul>
        <a href="/login" className="nav-login">Log in</a>
        <a href="/analyze" className="nav-cta magnetic">Free Channel Audit</a>
        <MobileMenu />
      </nav>
    </>
  );
}
