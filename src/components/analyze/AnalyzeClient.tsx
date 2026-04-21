'use client';

import React, { useEffect, useRef, useState, useCallback, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { submitAnalysis } from '@/lib/actions/analyze';
import { fetchChannelSnapshot, type ChannelSnapshot } from '@/lib/actions/snapshot';
import { trackEvent } from '@/lib/pixel';
import { isValidPromoCode } from '@/config/promoCodes';
import PromoInput from './PromoInput';
import promoStyles from './promoGate.module.css';
import styles from '@/app/analyze/analyze.module.css';

// ── Code-split heavy components (only needed after scan / below fold) ────
const RadarChart = dynamic(() => import('./RadarChart'), { ssr: false });
const ScanningAnimation = dynamic(() => import('./ScanningAnimation'), { ssr: false });
const SnapshotCard = dynamic(() => import('./SnapshotCard'), { ssr: false });
const EmailGate = dynamic(() => import('./EmailGate'), { ssr: false });

// ── Types ──────────────────────────────────────────────────────────────────

type FlowState =
  | 'url-input'
  | 'scanning'
  | 'snapshot'
  | 'submitting'
  | 'success';

type PromoState = 'url-step' | 'code-entry' | 'code-valid';

// ── Particles (deferred after LCP) ────────────────────────────────────────

function Particles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // Defer particle creation until after LCP (2s idle delay)
  useEffect(() => {
    const schedule = typeof requestIdleCallback === 'function'
      ? requestIdleCallback
      : (cb: () => void) => setTimeout(cb, 2000);
    const id = schedule(() => setReady(true));
    return () => {
      if (typeof cancelIdleCallback === 'function') cancelIdleCallback(id as number);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia('(max-width: 767px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const fragments: HTMLDivElement[] = [];
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      const sz = (1 + Math.random() * 2).toFixed(1) + 'px';
      Object.assign(p.style, {
        position:          'absolute',
        width:             sz,
        height:            sz,
        background:        '#c8ff2e',
        borderRadius:      '50%',
        opacity:           '0',
        left:              Math.random() * 100 + '%',
        animationName:     'floatParticle',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
        animationDuration: (12 + Math.random() * 20) + 's',
        animationDelay:    (Math.random() * 15) + 's',
      });
      container.appendChild(p);
      fragments.push(p);
    }
    return () => fragments.forEach(p => p.remove());
  }, [ready]);

  return <div ref={containerRef} className={styles.particles} aria-hidden="true" />;
}

// ── Scroll reveal hook (deferred to avoid blocking first paint) ────────────

function useScrollReveal() {
  useEffect(() => {
    const init = () => {
      const els = document.querySelectorAll('[data-reveal]');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      els.forEach(el => observer.observe(el));
      return () => observer.disconnect();
    };

    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(init);
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(init, 200);
    return () => clearTimeout(t);
  }, []);
}

// ── Parallax hook (deferred to avoid blocking first paint) ────────────────

function useParallax() {
  const scrollCleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    const init = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const handleScroll = () => {
        const vh = window.innerHeight;
        const radarCard = document.querySelector('[data-parallax="radar"]') as HTMLElement | null;
        const bentoCards = document.querySelectorAll('[data-parallax="bento"]');

        if (radarCard) {
          const rect = radarCard.getBoundingClientRect();
          if (rect.top < vh && rect.bottom > 0) {
            const progress = (vh - rect.top) / (vh + rect.height);
            radarCard.style.transform = `translateY(${(0.5 - progress) * 15}px)`;
          }
        }

        bentoCards.forEach((card, i) => {
          const el = card as HTMLElement;
          const rect = el.getBoundingClientRect();
          if (rect.top < vh && rect.bottom > 0) {
            const progress = (vh - rect.top) / (vh + rect.height);
            const offset = (0.5 - progress) * (8 + i * 2);
            el.style.transform = `translateY(${offset}px)`;
          }
        });
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      scrollCleanup.current = () => window.removeEventListener('scroll', handleScroll);
    };

    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(init);
      return () => { cancelIdleCallback(id); scrollCleanup.current?.(); };
    }
    const t = setTimeout(init, 200);
    return () => { clearTimeout(t); scrollCleanup.current?.(); };
  }, []);
}

// ── FAQ Item ───────────────────────────────────────────────────────────────

interface FaqItemProps {
  id:       string;
  question: string;
  answer:   string;
  openId:   string | null;
  onToggle: (id: string) => void;
  revealDelay?: string;
}

function FaqItem({ id, question, answer, openId, onToggle, revealDelay }: FaqItemProps) {
  const isOpen = openId === id;

  return (
    <div
      className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}
    >
      <button
        className={styles.faqQuestion}
        onClick={() => onToggle(id)}
        aria-expanded={isOpen}
      >
        <span className={styles.faqQText}>{question}</span>
        <svg
          className={styles.faqChevron}
          style={isOpen ? { transform: 'rotate(180deg)', color: '#c8ff2e' } : undefined}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div className={`${styles.faqAnswer} ${isOpen ? styles.faqAnswerOpen : ''}`}>
        <div className={styles.faqAnswerInner}>
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
}

// ── Tracking wrappers ──────────────────────────────────────────────────────

function URLStepTracker({ children }: { children: React.ReactNode }) {
  useEffect(() => { trackEvent('URLInputViewed'); }, []);
  return <>{children}</>;
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function AnalyzeClient() {
  const searchParams = useSearchParams();

  // ── Flow state ──────────────────────────────────────────────────────────
  const [flowState, setFlowState] = useState<FlowState>('url-input');

  // ── Promo / code ────────────────────────────────────────────────────────
  const [promoState,  setPromoState]  = useState<PromoState>('url-step');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  // ── Refs ────────────────────────────────────────────────────────────────
  const topInputRef   = useRef<HTMLInputElement>(null);
  const snapshotRef   = useRef<HTMLDivElement>(null);
  const emailGateRef  = useRef<HTMLDivElement>(null);

  // ── URL ─────────────────────────────────────────────────────────────────
  const [urlValue, setUrlValue] = useState('');
  const [urlValid, setUrlValid] = useState<'idle' | 'valid' | 'error'>('idle');
  const [urlLocked, setUrlLocked] = useState(false);

  // ── Scan ────────────────────────────────────────────────────────────────
  const [snapshot, setSnapshot] = useState<ChannelSnapshot | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isPendingScan, startScan] = useTransition();

  // ── Email + verified ─────────────────────────────────────────────────────
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  // ── Submit ──────────────────────────────────────────────────────────────
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPendingSubmit, startSubmit] = useTransition();

  // ── Honeypot ────────────────────────────────────────────────────────────
  const [honeypot, setHoneypot] = useState('');

  // ── FAQ ─────────────────────────────────────────────────────────────────
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  // Hooks
  useScrollReveal();
  useParallax();

  // ── Check URL param on mount ─────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const codeParam = params.get('code');
    if (codeParam && isValidPromoCode(codeParam)) {
      setAppliedCode(codeParam.toUpperCase().trim());
      return;
    }

    const fbclid = params.get('fbclid');
    const referrer = document.referrer.toLowerCase();
    const isFromFacebook =
      fbclid ||
      referrer.includes('facebook.com') ||
      referrer.includes('fb.com') ||
      referrer.includes('l.facebook.com');

    if (isFromFacebook) {
      trackEvent('PromoGateSkipped', { reason: 'facebook_traffic' });
    }
  }, [searchParams]);

  // ── URL validation ──────────────────────────────────────────────────────
  const handleUrlChange = useCallback((val: string) => {
    setUrlValue(val);
    if (!val.trim()) { setUrlValid('idle'); return; }

    const trimmed = val.trim().toLowerCase();

    const looksLikeJunk = trimmed.includes(' ') && !trimmed.startsWith('@');
    if (looksLikeJunk) {
      setUrlValid('error');
      trackEvent('URLValidationError', { input: val });
      return;
    }

    const isYt =
      /^https?:\/\/(www\.|m\.)?youtube\.com/.test(trimmed) ||
      /^(www\.|m\.)?youtube\.com/.test(trimmed) ||
      trimmed.startsWith('@') ||
      /^uc[a-z0-9_-]{20,}$/i.test(trimmed) ||
      /^[a-z0-9._-]+$/i.test(trimmed);

    if (!isYt) {
      trackEvent('URLValidationError', { input: val });
    }
    setUrlValid(isYt ? 'valid' : 'error');
  }, []);

  // ── Scan: lock URL + call YouTube API ───────────────────────────────────
  const handleScan = useCallback(() => {
    const val = urlValue.trim();
    if (!val) { setUrlValid('error'); return; }

    setScanError(null);
    setUrlLocked(true);
    setFlowState('scanning');
    trackEvent('Lead');

    startScan(async () => {
      const result = await fetchChannelSnapshot(val);

      if ('error' in result) {
        setScanError(result.error);
        setUrlLocked(false);
        setFlowState('url-input');
        return;
      }

      setSnapshot(result.snapshot);
      setFlowState('snapshot');
      trackEvent('ChannelScanned');
      trackEvent('SnapshotViewed');
      trackEvent('EmailGateViewed');

      // Scroll to snapshot section, then email gate
      setTimeout(() => {
        snapshotRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
      setTimeout(() => {
        emailGateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 1200);
    });
  }, [urlValue]);

  // ── URL edit ─────────────────────────────────────────────────────────────
  const handleEditUrl = useCallback(() => {
    setUrlLocked(false);
    setFlowState('url-input');
    setSnapshot(null);
    setScanError(null);
    setTimeout(() => { topInputRef.current?.focus(); }, 50);
  }, []);

  // ── Email verified — submit the analysis ────────────────────────────────
  const handleVerified = useCallback((email: string) => {
    setVerifiedEmail(email);
    trackEvent('CodeVerified');
    setFlowState('submitting');
    setSubmitError(null);

    startSubmit(async () => {
      const result = await submitAnalysis({
        channel_url: urlValue.trim(),
        email,
        promo_code: appliedCode || undefined,
        verified: true,
        website_url: honeypot || undefined,
      });

      if (result.success && result.publicId) {
        trackEvent('EmailSubmitted');
        setFlowState('success');
      } else {
        setSubmitError(result.error || 'Something went wrong. Please try again.');
        setFlowState('snapshot');
      }
    });
  }, [urlValue, appliedCode, honeypot]);

  // ── FAQ toggle ───────────────────────────────────────────────────────────
  const handleFaqToggle = useCallback((id: string) => {
    setOpenFaqId(prev => (prev === id ? null : id));
  }, []);

  // ── Bottom CTA scroll ────────────────────────────────────────────────────
  const handleBottomCta = useCallback(() => {
    topInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => { topInputRef.current?.focus(); }, 400);
  }, []);

  // ── URL input class ──────────────────────────────────────────────────────
  const urlInputClass = [
    styles.urlInput,
    urlValid === 'valid'  ? styles.urlInputValid : '',
    urlValid === 'error'  ? styles.urlInputError : '',
  ].filter(Boolean).join(' ');

  // ── Success state ────────────────────────────────────────────────────────
  if (flowState === 'success') {
    return (
      <div className={styles.page} id="main-content">
        <Particles />
        <section className={styles.zoneA} id="top">
          <div className={styles.zoneABg} aria-hidden="true" />
          <div className={styles.heroContent} style={{ maxWidth: 560 }}>
            <div className={styles.heroEyebrow}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6L5 9L10 3" stroke="#c8ff2e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Audit Request Confirmed
            </div>

            <h1 className={styles.heroHeadline} style={{ fontSize: 'clamp(28px,4vw,48px)' }}>
              Your audit is{' '}
              <em className={styles.heroHeadlineAccent}>being prepared.</em>
            </h1>

            <p className={styles.heroSub}>
              Our team will review{' '}
              {snapshot?.name ? <strong style={{ color: '#f0f0ec' }}>{snapshot.name}</strong> : 'your channel'}{' '}
              and deliver your personalized audit to{' '}
              <strong style={{ color: '#f0f0ec' }}>{verifiedEmail}</strong>{' '}
              within 24 hours.
            </p>

            <p style={{ fontSize: 13, color: 'rgba(240,240,236,0.4)', marginBottom: 32 }}>
              Add <span style={{ fontFamily: 'var(--font-mono)', color: 'rgba(240,240,236,0.6)' }}>chris@hypeon.media</span> to your contacts to make sure you receive it.
            </p>

            <a
              href="https://hypeon.media"
              className={styles.analyzeBtn}
              style={{ display: 'inline-flex', textDecoration: 'none' }}
            >
              Back to hypeon.media
            </a>
          </div>
        </section>
        <style>{`
          @keyframes floatParticle {
            0%   { opacity: 0; transform: translateY(100vh) scale(0.5); }
            10%  { opacity: 0.3; }
            90%  { opacity: 0.3; }
            100% { opacity: 0; transform: translateY(-10vh) scale(1); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={styles.page} id="main-content">
      {/* Floating particles */}
      <Particles />

      {/* ── ZONE A: HERO ─────────────────────────────── */}
      <section className={styles.zoneA} id="top">
        <div className={styles.zoneABg} aria-hidden="true" />

        <div className={styles.heroContent}>
          <div className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowDot} aria-hidden="true" />
            YouTube Channel Audit
          </div>

          <h1 className={styles.heroHeadline}>
            Your YouTube Channel,<br />
            <em className={styles.heroHeadlineAccent}>
              Scored and Mapped
            </em>
          </h1>

          <p className={styles.heroSub}>
            Paste your channel URL. Get a 6-axis audit scoring your content, titles, growth, and monetization — by the team behind 5 billion YouTube views.
          </p>

          {/* URL Input */}
          <URLStepTracker>
          <div id="analyze">
            {/* Promo badge */}
            {appliedCode && (
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <span className={promoStyles.promoBadge}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Complimentary access — code {appliedCode}
                </span>
              </div>
            )}

            <div className={styles.inputRow}>
              <input
                ref={topInputRef}
                type="url"
                className={urlInputClass}
                value={urlValue}
                onChange={e => handleUrlChange(e.target.value)}
                onFocus={() => trackEvent('URLInputFocused')}
                onKeyDown={e => { if (e.key === 'Enter' && !urlLocked) handleScan(); }}
                placeholder="youtube.com/@yourchannel"
                autoComplete="off"
                spellCheck={false}
                readOnly={urlLocked}
                style={urlLocked ? { opacity: 0.6 } : undefined}
                aria-label="YouTube channel URL"
              />
              <button
                className={styles.analyzeBtn}
                onClick={urlLocked ? handleEditUrl : handleScan}
                type="button"
                disabled={flowState === 'scanning' || flowState === 'submitting'}
                style={(flowState === 'scanning' || flowState === 'submitting') ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
                aria-label={urlLocked ? 'Edit channel URL' : 'Scan my channel'}
              >
                {urlLocked ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8L6.5 11.5L13 4" stroke="#0A0A0C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Channel URL saved
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16" aria-hidden="true">
                      <circle cx="7" cy="7" r="4.5" stroke="#0A0A0C" strokeWidth="1.8"/>
                      <path d="M10.5 10.5L13.5 13.5" stroke="#0A0A0C" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    Scan My Channel
                  </>
                )}
              </button>
            </div>

            {/* URL locked strip */}
            {urlLocked && snapshot && (
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(240,240,236,0.4)' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }}>
                    <path d="M2 6L5 9L10 3" stroke="#c8ff2e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Channel URL saved:{' '}
                  <span style={{ color: 'rgba(240,240,236,0.7)' }}>
                    {urlValue.length > 36 ? urlValue.slice(0, 36) + '…' : urlValue}
                  </span>
                  {' '}
                  <button
                    type="button"
                    className={styles.editUrlBtn}
                    onClick={handleEditUrl}
                  >
                    Edit
                  </button>
                </span>
              </div>
            )}

            {/* Scan error */}
            {scanError && (
              <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '0.5rem', textAlign: 'center' }}>
                {scanError}
              </p>
            )}

            {/* Promo code link (only when URL not locked, no code) */}
            {!urlLocked && !appliedCode && promoState === 'url-step' && (
              <p className={styles.promoLink}>
                Have a promo code?{' '}
                <button
                  type="button"
                  onClick={() => setPromoState('code-entry')}
                  className={styles.promoLinkBtn}
                >
                  Apply it here
                </button>
              </p>
            )}

            {/* Inline promo code entry */}
            {promoState === 'code-entry' && !appliedCode && (
              <div style={{ marginTop: 16, maxWidth: 600, margin: '16px auto 0' }}>
                <PromoInput
                  onValid={(code) => { setAppliedCode(code); setPromoState('url-step'); }}
                  onBack={() => setPromoState('url-step')}
                />
              </div>
            )}
          </div>
          </URLStepTracker>

          {/* ── Scanning animation ─────────────────── */}
          {flowState === 'scanning' && (
            <div style={{ marginTop: 24 }}>
              <ScanningAnimation />
            </div>
          )}

          {/* Trust strip */}
          <div className={styles.trustStrip}>
            <div className={styles.trustItem}>
              <svg viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" width="13" height="13" style={{ color: '#c8ff2e', flexShrink: 0 }} aria-hidden="true">
                <path d="M6.5 1L7.94 4.55L11.5 4.88L8.88 7.16L9.73 10.5L6.5 8.5L3.27 10.5L4.12 7.16L1.5 4.88L5.06 4.55L6.5 1Z" fill="currentColor"/>
              </svg>
              5 Billion+ views managed
            </div>
            <div className={styles.trustItem}>
              <svg viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" width="13" height="13" style={{ color: '#c8ff2e', flexShrink: 0 }} aria-hidden="true">
                <rect x="1.5" y="3" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M4.5 3V2a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              50+ channels grown
            </div>
            <div className={styles.trustItem}>
              <svg viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" width="13" height="13" style={{ color: '#c8ff2e', flexShrink: 0 }} aria-hidden="true">
                <path d="M6.5 1.5C3.74 1.5 1.5 3.74 1.5 6.5S3.74 11.5 6.5 11.5 11.5 9.26 11.5 6.5 9.26 1.5 6.5 1.5zM6.5 4v3l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Trusted in 15+ countries
            </div>
          </div>

          {/* Proof callout */}
          <p className={styles.proofCallout}>
            &ldquo;We helped a finance channel increase their CTR by 340% in 90 days using insights from this exact audit.&rdquo;
          </p>
        </div>
      </section>

      {/* ── SNAPSHOT + EMAIL GATE ────────────────────── */}
      {(flowState === 'snapshot' || flowState === 'submitting') && snapshot && (
        <section
          ref={snapshotRef}
          style={{ padding: '32px 24px 40px', maxWidth: 720, margin: '0 auto' }}
        >
          <SnapshotCard snapshot={snapshot} />

          {/* Arrow indicator between SnapshotCard and EmailGate */}
          <div style={{ textAlign: 'center', margin: '16px 0 8px', opacity: 0.4 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12l7 7 7-7" stroke="#c8ff2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Honeypot — invisible to bots */}
          <input
            type="text"
            name="website_url"
            value={honeypot}
            onChange={e => setHoneypot(e.target.value)}
            style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          {flowState === 'submitting' ? (
            <div style={{ textAlign: 'center', padding: '32px 24px', color: 'rgba(240,240,236,0.6)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
              <svg
                style={{ width: 18, height: 18, animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }}
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" stroke="#c8ff2e" strokeWidth="3" strokeDasharray="30 70" strokeLinecap="round"/>
              </svg>
              Submitting your audit request...
            </div>
          ) : (
            <>
              <div ref={emailGateRef}>
                <EmailGate
                  onVerified={handleVerified}
                  appliedCode={appliedCode}
                  onApplyCode={() => setPromoState('code-entry')}
                />
              </div>
              {submitError && (
                <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '0.5rem', textAlign: 'center' }}>
                  {submitError}
                </p>
              )}
            </>
          )}
        </section>
      )}

      {/* ── ZONE B: BRIDGE + AURORA ──────────────────── */}
      <section className={styles.zoneB}>
        <div className={styles.auroraBg} aria-hidden="true" />

        <div className={styles.zoneBInner}>
          {/* Radar section */}
          <div className={styles.radarSection}>
            {/* Chart card */}
            <div
              className={`${styles.radarCard} ${styles.reveal}`}
              data-reveal
              data-parallax="radar"
            >
              <span className={styles.sampleBadge}>Sample report</span>
              <div className={styles.radarGradeRow}>
                <div className={styles.radarGrade}>B+</div>
                <div className={styles.radarGradeMeta}>
                  <span className={styles.radarGradeLabel}>Channel Health Score</span>
                  <span className={styles.radarGradeName}>Above Average</span>
                </div>
              </div>

              <div className={styles.radarContainer}>
                <RadarChart />
              </div>

              <div className={styles.radarScoreLegend}>
                <div className={styles.scoreLegendItem}>
                  <div className={styles.scoreDot} style={{ background: '#c8ff2e' }} />
                  <span style={{ color: '#6B7280' }}>S (90+)</span>
                </div>
                <div className={styles.scoreLegendItem}>
                  <div className={styles.scoreDot} style={{ background: '#34D399' }} />
                  <span style={{ color: '#6B7280' }}>A (70–89)</span>
                </div>
                <div className={styles.scoreLegendItem}>
                  <div className={styles.scoreDot} style={{ background: '#FBBF24' }} />
                  <span style={{ color: '#6B7280' }}>B (50–69)</span>
                </div>
                <div className={styles.scoreLegendItem}>
                  <div className={styles.scoreDot} style={{ background: '#FB923C' }} />
                  <span style={{ color: '#6B7280' }}>C (30–49)</span>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className={`${styles.radarExplanation} ${styles.reveal} ${styles.revealDelay2}`} data-reveal>
              <div className={styles.sectionLabel}>What you get</div>
              <div className={styles.radarExplanationHed}>Your channel. Dissected. Scored. Actionable.</div>
              <p className={styles.radarExplanationBody}>
                We run your channel through the same framework we used to scale channels to billions of views. Six axes. No vanity metrics. Pure signal.
              </p>
              <p className={styles.radarExplanationBody}>
                Your weakest axis is where your next 100K subscribers are hiding. We&apos;ll tell you exactly which one — and what to do about it.
              </p>
            </div>
          </div>

          {/* Bento grid */}
          <div className={styles.bentoSection}>
            <div className={`${styles.sectionLabel} ${styles.reveal}`} data-reveal>
              Six dimensions of channel health
            </div>
            <h2 className={`${styles.sectionHeadline} ${styles.reveal} ${styles.revealDelay1}`} data-reveal>
              What You&apos;ll Get
            </h2>
            <p className={`${styles.sectionSub} ${styles.reveal} ${styles.revealDelay2}`} data-reveal>
              Every audit covers six axes. Each one is scored, explained, and paired with a specific action to improve it.
            </p>

            <div className={styles.bentoGrid}>
              {/* 1: Content Strategy */}
              <div className={`${styles.bentoCard} ${styles.reveal} ${styles.revealDelay1}`} data-reveal data-parallax="bento">
                <div className={styles.bentoCardHeader}>
                  <div className={styles.bentoIcon}>
                    <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18" stroke="currentColor">
                      <path d="M3 5h12M3 9h8M3 13h10" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className={`${styles.scoreBadge} ${styles.a}`}>78 / A</div>
                </div>
                <div className={styles.bentoTitle}>Content Strategy</div>
                <div className={styles.bentoInsight}>
                  <strong>Strong topic clustering</strong> but pillar-content ratio is off. You&apos;re building highways to nowhere.
                </div>
              </div>

              {/* 2: Title Quality */}
              <div className={`${styles.bentoCard} ${styles.reveal} ${styles.revealDelay2}`} data-reveal data-parallax="bento">
                <div className={styles.bentoCardHeader}>
                  <div className={styles.bentoIcon}>
                    <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18" stroke="currentColor">
                      <path d="M2 4h14v2H2zM2 9h9M2 13h11" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className={`${styles.scoreBadge} ${styles.c}`}>45 / C</div>
                </div>
                <div className={styles.bentoTitle}>Title Quality</div>
                <div className={styles.bentoInsight}>
                  <strong>Weakest axis.</strong> CTR below category average. Titles are descriptive — not magnetic. This is your lever.
                </div>
              </div>

              {/* 3: Audience Growth */}
              <div className={`${styles.bentoCard} ${styles.reveal} ${styles.revealDelay3}`} data-reveal data-parallax="bento">
                <div className={styles.bentoCardHeader}>
                  <div className={styles.bentoIcon}>
                    <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18" stroke="currentColor">
                      <path d="M2 14L6 9l3 3 3-4 4 4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className={`${styles.scoreBadge} ${styles.b}`}>51 / B</div>
                </div>
                <div className={styles.bentoTitle}>Audience Growth</div>
                <div className={styles.bentoInsight}>
                  Subscriber velocity is flat. <strong>Upload cadence inconsistency</strong> is killing the algorithm&apos;s trust in you.
                </div>
              </div>

              {/* 4: Competitor Analysis */}
              <div className={`${styles.bentoCard} ${styles.reveal} ${styles.revealDelay4}`} data-reveal data-parallax="bento">
                <div className={styles.bentoCardHeader}>
                  <div className={styles.bentoIcon}>
                    <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18" stroke="currentColor">
                      <circle cx="9" cy="9" r="6.5" strokeWidth="1.6"/>
                      <path d="M9 2.5V9l3.5 3.5" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className={`${styles.scoreBadge} ${styles.a}`}>85 / A</div>
                </div>
                <div className={styles.bentoTitle}>Competitor Analysis</div>
                <div className={styles.bentoInsight}>
                  You&apos;re in the <strong>top 20% of your niche</strong> in engagement rate. Two competitors are eating your search traffic.
                </div>
              </div>

              {/* 5: Content DNA */}
              <div className={`${styles.bentoCard} ${styles.reveal} ${styles.revealDelay5}`} data-reveal data-parallax="bento">
                <div className={styles.bentoCardHeader}>
                  <div className={styles.bentoIcon}>
                    <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18" stroke="currentColor">
                      <path d="M4 3c0 3 10 3 10 6S4 12 4 15" strokeWidth="1.6" strokeLinecap="round"/>
                      <path d="M14 3c0 3-10 3-10 6s10 3 10 6" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className={`${styles.scoreBadge} ${styles.b}`}>62 / B</div>
                </div>
                <div className={styles.bentoTitle}>Content DNA</div>
                <div className={styles.bentoInsight}>
                  <strong>Voice is identifiable</strong> but format variety is low. 80% of your videos follow the same structure.
                </div>
              </div>

              {/* 6: Monetization Readiness */}
              <div className={`${styles.bentoCard} ${styles.reveal} ${styles.revealDelay6}`} data-reveal data-parallax="bento">
                <div className={styles.bentoCardHeader}>
                  <div className={styles.bentoIcon}>
                    <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18" stroke="currentColor">
                      <circle cx="9" cy="9" r="6.5" strokeWidth="1.6"/>
                      <path d="M9 5.5v1M9 11.5v1M6.5 8.5a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className={`${styles.scoreBadge} ${styles.a}`}>70 / A</div>
                </div>
                <div className={styles.bentoTitle}>Monetization Readiness</div>
                <div className={styles.bentoInsight}>
                  AdSense eligible. <strong>RPM is 40% below niche average.</strong> Topic repositioning alone could double your revenue.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ZONE C: CONVERSION ───────────────────────── */}
      <section className={styles.zoneC}>
        <div className={styles.zoneCInner}>
          {/* FAQ */}
          <div className={styles.faqSection}>
            <div className={`${styles.sectionLabel} ${styles.reveal}`} data-reveal>
              Common questions
            </div>
            <h2
              className={`${styles.sectionHeadline} ${styles.reveal} ${styles.revealDelay1}`}
              style={{ marginBottom: 36 }}
              data-reveal
            >
              Before You Paste That URL
            </h2>

            <div className={styles.faqList}>
              <FaqItem
                id="faq-1"
                question="How long does the analysis take?"
                answer="Around 1 hour. We analyze your channel deeply — not superficially. We pull historical data, cross-reference competitors, and run the six-axis scoring model before writing a single line of the report."
                openId={openFaqId}
                onToggle={handleFaqToggle}
                revealDelay={styles.revealDelay1}
              />
              <FaqItem
                id="faq-2"
                question="What data do you need from me?"
                answer="Just your channel URL and an email to send the report. No OAuth, no permissions, no access to your Studio, no credit card. Everything we analyze is public data — the same data your viewers and competitors see. That's the point."
                openId={openFaqId}
                onToggle={handleFaqToggle}
                revealDelay={styles.revealDelay2}
              />
              <FaqItem
                id="faq-3"
                question="How much does the audit cost?"
                answer="A full channel audit is $200. Promotional codes — included in our partner campaigns and select invitations — grant complimentary access. Either way, you receive the same in-depth 6-axis analysis."
                openId={openFaqId}
                onToggle={handleFaqToggle}
                revealDelay={styles.revealDelay3}
              />
              <FaqItem
                id="faq-4"
                question="What happens after the audit?"
                answer="You receive a detailed channel health report — scored, explained, and actionable. If you want help fixing what we found, we offer growth engagements. If you don't, the report still belongs to you. No pitch, no pressure."
                openId={openFaqId}
                onToggle={handleFaqToggle}
                revealDelay={styles.revealDelay4}
              />
            </div>
          </div>

          {/* Final CTA */}
          <div className={`${styles.finalCta} ${styles.reveal}`} data-reveal>
            <h2 className={styles.finalCtaHed}>Ready to See the Truth?</h2>
            <p className={styles.finalCtaSub}>
              One URL. Zero access required. Your real channel score in ~1 hour.
            </p>

            <div className={styles.inputRow} style={{ maxWidth: 540, margin: '0 auto' }}>
              <input
                type="url"
                className={styles.urlInput}
                placeholder="youtube.com/@yourchannel"
                autoComplete="off"
                spellCheck={false}
                aria-label="YouTube channel URL (bottom form)"
                onFocus={handleBottomCta}
              />
              <button
                className={styles.analyzeBtn}
                type="button"
                aria-label="Scan my channel"
                onClick={handleBottomCta}
              >
                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16" aria-hidden="true">
                  <circle cx="7" cy="7" r="4.5" stroke="#0A0A0C" strokeWidth="1.8"/>
                  <path d="M10.5 10.5L13.5 13.5" stroke="#0A0A0C" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                Scan My Channel
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── PAGE FOOTER ──────────────────────────────── */}
      <footer className={styles.pageFooter}>
        <a href="#top" className={styles.footerBrand}>
          <div className={styles.footerBrandMark} aria-hidden="true">
            <svg viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" width="13" height="13">
              <path d="M2 2V11M2 6.5H11M11 2V11" stroke="#0A0A0C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={styles.footerBrandName}>
            Hype<span className={styles.footerBrandNameAccent}>On</span> Media
          </span>
        </a>
        <span className={styles.footerCopy}>Hype On Media FZCO &copy; 2026</span>
      </footer>

      {/* Global keyframes for animations used inline */}
      <style>{`
        @keyframes floatParticle {
          0%   { opacity: 0; transform: translateY(100vh) scale(0.5); }
          10%  { opacity: 0.3; }
          90%  { opacity: 0.3; }
          100% { opacity: 0; transform: translateY(-10vh) scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes drawRadar {
          from { stroke-dashoffset: 600; opacity: 0.3; }
          to   { stroke-dashoffset: 0; opacity: 1; }
        }
        [data-reveal] {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        [data-reveal].visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
