'use client';
import { useState, useCallback, useEffect } from 'react';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    document.body.style.overflow = '';
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, close]);

  return (
    <>
      <button
        className="hamburger-btn"
        onClick={open}
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <span /><span /><span />
      </button>
      <div
        className={`mobile-menu-overlay${isOpen ? ' active' : ''}`}
        aria-hidden={!isOpen}
      >
        <button className="mobile-menu-close" onClick={close} aria-label="Close menu">
          &times;
        </button>
        <a href="#proof" className="mobile-menu-link" onClick={close}>Proof</a>
        <a href="#services" className="mobile-menu-link" onClick={close}>Services</a>
        <a href="#work" className="mobile-menu-link" onClick={close}>Work</a>
        <a href="#about" className="mobile-menu-link" onClick={close}>About</a>
        <a href="#contact" className="mobile-menu-cta" onClick={close}>Get a free audit &rarr;</a>
      </div>
    </>
  );
}
