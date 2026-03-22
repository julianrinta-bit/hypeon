'use client';
import { useState, useCallback, useEffect, useRef } from 'react';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const scrollY = useRef(0);

  const open = useCallback(() => {
    scrollY.current = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY.current}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflow = '';
    window.scrollTo(0, scrollY.current);
    hamburgerRef.current?.focus();
  }, []);

  // Focus close button when menu opens
  useEffect(() => {
    if (isOpen) {
      closeRef.current?.focus();
    }
  }, [isOpen]);

  // Close on Escape key + focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }

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
  }, [isOpen, close]);

  // Clean up on unmount
  useEffect(() => () => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflow = '';
  }, []);

  return (
    <>
      <button
        className={`hamburger-btn${isOpen ? ' hamburger-hidden' : ''}`}
        onClick={open}
        aria-label="Open menu"
        aria-expanded={isOpen}
        ref={hamburgerRef}
      >
        <span /><span /><span />
      </button>
      <div
        className={`mobile-menu-overlay${isOpen ? ' active' : ''}`}
        aria-hidden={!isOpen}
        inert={!isOpen ? true : undefined}
        ref={overlayRef}
      >
        <button className="mobile-menu-close" onClick={close} aria-label="Close menu" ref={closeRef}>
          &times;
        </button>
        <a href="/#proof" className="mobile-menu-link" onClick={close}>Proof</a>
        <a href="/#services" className="mobile-menu-link" onClick={close}>Services</a>
        <a href="/#work" className="mobile-menu-link" onClick={close}>Work</a>
        <a href="/#about" className="mobile-menu-link" onClick={close}>About</a>
        <a href="/blog" className="mobile-menu-link" onClick={close}>Blog</a>
        <a href="/login" className="mobile-menu-link" onClick={close}>Log in</a>
        <a href="/#contact" className="mobile-menu-cta" onClick={close}>Get a free audit &rarr;</a>
      </div>
    </>
  );
}
