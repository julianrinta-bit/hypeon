'use client';

import React, { useEffect, useRef, useState, useCallback, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import RadarChart from './RadarChart';
import { submitAnalysis } from '@/lib/actions/analyze';
import { trackEvent } from '@/lib/pixel';
import { isValidPromoCode } from '@/config/promoCodes';
import PromoGate from './PromoGate';
import PromoInput from './PromoInput';
import PricingPanel from './PricingPanel';
import promoStyles from './promoGate.module.css';
import styles from '@/app/analyze/analyze.module.css';

// ── Types ──────────────────────────────────────────────────────────────────

type GoalValue     = 'leads' | 'audience' | 'authority' | 'revenue' | 'brand' | null;
type FreqValue     = 'rare' | 'monthly' | 'weekly' | 'daily' | null;
type ProdValue     = 'phone' | 'decent' | 'pro' | 'full' | null;
type RegionValue   = 'mena' | 'europe' | 'na' | 'latam' | 'south_asia' | 'apac_south' | 'east_asia' | 'africa' | null;
type SubmitState   = 'idle' | 'loading' | 'success';
type PromoState    = 'gate' | 'code-entry' | 'code-valid' | 'pricing' | 'paid' | 'url-step';

// ── Decode animation ───────────────────────────────────────────────────────

function useDecodeAnimation(finalText: string) {
  const [displayed, setDisplayed] = useState(finalText);
  const [decoded, setDecoded]     = useState(false);
  const [fixedWidth, setFixedWidth] = useState<number | null>(null);
  const measureRef = useRef<HTMLSpanElement | null>(null);

  // Measure the final text width on mount so the container never reflows
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Create an offscreen span styled identically to the headline
    const probe = document.createElement('span');
    probe.textContent = finalText;
    probe.style.cssText = `
      position: absolute; visibility: hidden; white-space: nowrap;
      font-family: var(--font-display); font-weight: 800;
      font-size: inherit; letter-spacing: -0.03em;
    `;
    // Insert into the decodeWord span's parent so it inherits computed font-size
    const anchor = measureRef.current?.parentElement ?? document.body;
    anchor.appendChild(probe);
    const w = probe.getBoundingClientRect().width;
    anchor.removeChild(probe);
    setFixedWidth(Math.ceil(w));
  }, [finalText]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Characters with similar advance width to S/e in Plus Jakarta Sans 800.
    // Excludes wide glyphs (M, W, Q) and narrow glyphs (I, J, l) to keep
    // the scramble text roughly the same width as "Sees".
    const chars = 'ABCDEFGHKNOPRSTUVXYZ';
    const len = finalText.length;

    const timeout = setTimeout(() => {
      let locked = 0;
      let frame  = 0;

      const tick = setInterval(() => {
        frame++;
        // Lock one letter every 10 frames (~500ms per char at 50ms tick)
        if (frame % 10 === 0 && locked < len) locked++;

        let display = '';
        for (let i = 0; i < len; i++) {
          display += i < locked
            ? finalText[i]
            : chars[Math.floor(Math.random() * chars.length)];
        }
        setDisplayed(display);

        if (locked >= len) {
          clearInterval(tick);
          setDisplayed(finalText);
          setDecoded(true);
        }
      }, 50);

      return () => clearInterval(tick);
    }, 800);

    return () => clearTimeout(timeout);
  }, [finalText]);

  return { displayed, decoded, fixedWidth, measureRef };
}

// ── Particles ──────────────────────────────────────────────────────────────

function Particles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
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
  }, []);

  return <div ref={containerRef} className={styles.particles} aria-hidden="true" />;
}

// ── Scroll reveal hook ─────────────────────────────────────────────────────

function useScrollReveal() {
  useEffect(() => {
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
  }, []);
}

// ── Parallax hook ──────────────────────────────────────────────────────────

function useParallax() {
  useEffect(() => {
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
    return () => window.removeEventListener('scroll', handleScroll);
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
      className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''} ${styles.reveal} ${revealDelay || ''}`}
      data-reveal
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

function PromoGateTracker({ children }: { children: React.ReactNode }) {
  useEffect(() => { trackEvent('PromoGateViewed'); }, []);
  return <>{children}</>;
}

function URLStepTracker({ children }: { children: React.ReactNode }) {
  useEffect(() => { trackEvent('URLInputViewed'); }, []);
  return <>{children}</>;
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function AnalyzeClient() {
  // Decode animation
  const { displayed: decodeDisplayed, decoded: decodeFinished, fixedWidth: decodeWidth, measureRef: decodeRef } = useDecodeAnimation('Sees');

  // Promo gate state machine
  const searchParams = useSearchParams();
  const [promoState,   setPromoState]   = useState<PromoState>('gate');
  const [appliedCode,  setAppliedCode]  = useState<string | null>(null);

  // Check URL param on mount — e.g. /analyze?code=DIVE
  // Also auto-skip gate for Facebook traffic (fbclid or referrer)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // 1. Explicit code in URL
    const codeParam = params.get('code');
    if (codeParam && isValidPromoCode(codeParam)) {
      setAppliedCode(codeParam.toUpperCase().trim());
      setPromoState('url-step');
      return;
    }

    // 2. Facebook traffic (fbclid present OR referrer is Facebook)
    const fbclid = params.get('fbclid');
    const referrer = document.referrer.toLowerCase();
    const isFromFacebook =
      fbclid ||
      referrer.includes('facebook.com') ||
      referrer.includes('fb.com') ||
      referrer.includes('l.facebook.com');

    if (isFromFacebook) {
      setPromoState('url-step');
      trackEvent('PromoGateSkipped', { reason: 'facebook_traffic' });
      return;
    }
  }, [searchParams]);

  // URL input
  const [urlValue,      setUrlValue]      = useState('');
  const [urlValid,      setUrlValid]      = useState<'idle' | 'valid' | 'error'>('idle');
  const [step2Open,     setStep2Open]     = useState(false);
  const [urlLocked,     setUrlLocked]     = useState(false);
  const qualifyPanelRef = useRef<HTMLDivElement>(null);

  // Qualification state
  const [selectedGoal,   setSelectedGoal]   = useState<GoalValue>(null);
  const [selectedFreq,   setSelectedFreq]   = useState<FreqValue>(null);
  const [selectedProd,   setSelectedProd]   = useState<ProdValue>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionValue>(null);

  // Contact fields
  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');

  // Submit state
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // FAQ
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  // Hooks
  useScrollReveal();
  useParallax();

  // ── URL validation ──────────────────────────────────────────────────────
  // Generous validation — accept anything that might be a YouTube reference.
  // Let the server handle the actual resolution.
  const handleUrlChange = useCallback((val: string) => {
    setUrlValue(val);
    if (!val.trim()) { setUrlValid('idle'); return; }

    const trimmed = val.trim().toLowerCase();

    // Reject obviously non-YouTube input (plain words with spaces that aren't @handles or channel IDs)
    const looksLikeJunk = trimmed.includes(' ') && !trimmed.startsWith('@');
    if (looksLikeJunk) {
      setUrlValid('error');
      trackEvent('URLValidationError', { input: val });
      return;
    }

    const isYt =
      // Full URLs — http or https, with or without www/m
      /^https?:\/\/(www\.|m\.)?youtube\.com/.test(trimmed) ||
      // Without protocol
      /^(www\.|m\.)?youtube\.com/.test(trimmed) ||
      // @handle
      trimmed.startsWith('@') ||
      // Channel ID (UCxxxxxxxxxx)
      /^uc[a-z0-9_-]{20,}$/i.test(trimmed) ||
      // Bare channel name — single word, no spaces (treated as @name on server)
      /^[a-z0-9._-]+$/i.test(trimmed);

    if (!isYt) {
      trackEvent('URLValidationError', { input: val });
    }
    setUrlValid(isYt ? 'valid' : 'error');
  }, []);

  // ── Step 2 expand ───────────────────────────────────────────────────────
  const handleStep1 = useCallback(() => {
    const val = urlValue.trim();
    if (!val) { setUrlValid('error'); return; }

    trackEvent('Lead');
    trackEvent('QualifyFormViewed');

    setStep2Open(true);
    setUrlLocked(true);

    setTimeout(() => {
      qualifyPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
  }, [urlValue]);

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!name.trim()) return;
    if (!email.trim() || !email.includes('@')) return;
    if (!selectedGoal) return;

    setSubmitState('loading');
    setSubmitError(null);

    startTransition(async () => {
      const result = await submitAnalysis({
        channel_url: urlValue.trim(),
        goal: selectedGoal,
        publishing_frequency: selectedFreq || undefined,
        production_level: selectedProd || undefined,
        region: selectedRegion || undefined,
        name: name.trim(),
        email: email.trim(),
        promo_code: appliedCode || undefined,
      });

      if (result.success && result.publicId) {
        trackEvent('CompleteRegistration');
        setSubmitState('success');
        // Redirect to waiting room after brief success animation
        setTimeout(() => {
          router.push(`/analyze/status/${result.publicId}`);
        }, 1500);
      } else {
        setSubmitState('idle');
        setSubmitError(result.error || 'Something went wrong. Please try again.');
      }
    });
  }, [name, email, urlValue, selectedGoal, selectedFreq, selectedProd, selectedRegion, appliedCode, router, startTransition]);

  // ── FAQ toggle ──────────────────────────────────────────────────────────
  const handleFaqToggle = useCallback((id: string) => {
    setOpenFaqId(prev => (prev === id ? null : id));
  }, []);

  // ── URL input class ─────────────────────────────────────────────────────
  const urlInputClass = [
    styles.urlInput,
    urlValid === 'valid'  ? styles.urlInputValid : '',
    urlValid === 'error'  ? styles.urlInputError : '',
  ].filter(Boolean).join(' ');

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
            Expert Channel Analysis
          </div>

          <h1 className={styles.heroHeadline}>
            See What YouTube<br />
            <em className={styles.heroHeadlineAccent}>
              <span
                ref={decodeRef}
                className={`${styles.decodeWord} ${decodeFinished ? styles.decodeWordDecoded : ''}`}
                style={decodeWidth ? { minWidth: `${decodeWidth}px` } : undefined}
              >
                {decodeDisplayed}
              </span>
              <br className={styles.decodeBrMobile} />
              <span className={styles.decodeRestDesktop}>{' '}</span>
              in Your Channel
            </em>
          </h1>

          <p className={styles.heroSub}>
            In-depth channel analysis by the team behind 5B+ YouTube views.<br />
            No OAuth. No credit card. Just paste your URL.
          </p>

          {/* PROMO GATE STATE MACHINE */}
          {promoState === 'gate' && (
            <PromoGateTracker>
              <PromoGate
                onYes={() => setPromoState('code-entry')}
                onNo={() => setPromoState('pricing')}
              />
            </PromoGateTracker>
          )}
          {promoState === 'code-entry' && (
            <PromoInput
              onValid={(code) => { setAppliedCode(code); setPromoState('url-step'); }}
              onBack={() => setPromoState('gate')}
            />
          )}
          {promoState === 'pricing' && (
            <PricingPanel onSwitchToCode={() => setPromoState('code-entry')} />
          )}

          {/* STEP 1: URL Input — only shown once access is granted */}
          {(promoState === 'url-step' || promoState === 'paid') && (
            <URLStepTracker>
            <div id="analyze">
              {/* Promo badge */}
              {appliedCode && (
                <div style={{ textAlign: 'center' }}>
                  <span className={promoStyles.promoBadge}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    FREE with code {appliedCode}
                  </span>
                </div>
              )}
              {promoState === 'paid' && !appliedCode && (
                <div style={{ textAlign: 'center' }}>
                  <span className={promoStyles.promoBadge}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Paid audit — $200
                  </span>
                </div>
              )}

              <div className={styles.inputRow}>
                <input
                  type="url"
                  className={urlInputClass}
                  value={urlValue}
                  onChange={e => handleUrlChange(e.target.value)}
                  onFocus={() => trackEvent('URLInputFocused')}
                  placeholder="youtube.com/@yourchannel"
                  autoComplete="off"
                  spellCheck={false}
                  readOnly={urlLocked}
                  style={urlLocked ? { opacity: 0.6 } : undefined}
                  aria-label="YouTube channel URL"
                />
                <button
                  className={styles.analyzeBtn}
                  onClick={handleStep1}
                  type="button"
                  disabled={urlLocked}
                  style={urlLocked ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
                  aria-label="Analyze my channel"
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
                      Analyze My Channel
                    </>
                  )}
                </button>
              </div>
            </div>
            </URLStepTracker>
          )}

          {/* STEP 2: Qualification Panel — only when access granted */}
          {(promoState === 'url-step' || promoState === 'paid') && (
          <div
            ref={qualifyPanelRef}
            className={`${styles.qualifyPanel} ${step2Open ? styles.qualifyPanelOpen : ''}`}
            aria-hidden={!step2Open}
          >
            <div className={styles.qualifyHeader}>
              <span className={styles.qualifyStepBadge}>Customize your analysis</span>
            </div>

            {/* Q1: Goal */}
            <div className={styles.qualifyQuestion}>
              <label className={styles.qualifyLabel}>What&apos;s the #1 thing you want from YouTube?</label>
              <div className={styles.qualifyCards}>
                {([
                  { value: 'leads',     icon: '🎯', title: 'Generate Leads',   desc: 'Turn viewers into clients' },
                  { value: 'audience',  icon: '📈', title: 'Grow Audience',    desc: 'More subscribers & reach' },
                  { value: 'authority', icon: '🏛️', title: 'Build Authority',  desc: 'Become THE expert' },
                  { value: 'revenue',   icon: '💰', title: 'Drive Revenue',    desc: 'Earn more from YouTube' },
                  { value: 'brand',     icon: '🏢', title: 'Strengthen Brand', desc: 'Support company marketing' },
                ] as { value: GoalValue; icon: string; title: string; desc: string }[]).map(({ value, icon, title, desc }) => (
                  <button
                    key={value}
                    className={`${styles.qCard} ${selectedGoal === value ? styles.qCardSelected : ''}`}
                    onClick={() => setSelectedGoal(value)}
                    type="button"
                    aria-pressed={selectedGoal === value}
                  >
                    <span className={styles.qIcon}>{icon}</span>
                    <span className={`${styles.qTitle} ${selectedGoal === value ? 'qTitleActive' : ''}`}
                          style={selectedGoal === value ? { color: '#c8ff2e' } : undefined}>
                      {title}
                    </span>
                    <span className={styles.qDesc}>{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Q2: Frequency */}
            <div className={styles.qualifyQuestion}>
              <label className={styles.qualifyLabel}>How often do you currently publish?</label>
              <div className={styles.qualifyPills}>
                {([
                  { value: 'rare',    label: 'Less than monthly' },
                  { value: 'monthly', label: '1-2x / month' },
                  { value: 'weekly',  label: 'Weekly' },
                  { value: 'daily',   label: 'Multiple / week' },
                ] as { value: FreqValue; label: string }[]).map(({ value, label }) => (
                  <button
                    key={value}
                    className={`${styles.qPill} ${selectedFreq === value ? styles.qPillSelected : ''}`}
                    onClick={() => setSelectedFreq(value)}
                    type="button"
                    aria-pressed={selectedFreq === value}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q3: Production */}
            <div className={styles.qualifyQuestion}>
              <label className={styles.qualifyLabel}>How do you currently make your videos?</label>
              <div className={`${styles.qualifyCards} ${styles.prodGrid}`}>
                {([
                  { value: 'phone',  icon: '📱', title: 'Phone',           desc: 'Minimal editing' },
                  { value: 'decent', icon: '📷', title: 'Decent Camera',   desc: 'I edit myself' },
                  { value: 'pro',    icon: '🎬', title: 'Professional',    desc: 'Work with an editor' },
                  { value: 'full',   icon: '🎥', title: 'Full Production', desc: 'Scripts, crew, post' },
                ] as { value: ProdValue; icon: string; title: string; desc: string }[]).map(({ value, icon, title, desc }) => (
                  <button
                    key={value}
                    className={`${styles.qCard} ${styles.qCardCompact} ${selectedProd === value ? styles.qCardSelected : ''}`}
                    onClick={() => setSelectedProd(value)}
                    type="button"
                    aria-pressed={selectedProd === value}
                  >
                    <span className={styles.qIcon}>{icon}</span>
                    <span className={styles.qTitle}
                          style={selectedProd === value ? { color: '#c8ff2e' } : undefined}>
                      {title}
                    </span>
                    <span className={styles.qDesc}>{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Q4: Region */}
            <div className={styles.qualifyQuestion}>
              <label className={styles.qualifyLabel}>Your target audience region</label>
              <div className={`${styles.qualifyPills} ${styles.regionPills}`}>
                {([
                  { value: 'mena',       label: '🌍 Middle East & N. Africa' },
                  { value: 'europe',     label: '🇪🇺 Europe' },
                  { value: 'na',         label: '🇺🇸 North America' },
                  { value: 'latam',      label: '🌎 Latin America' },
                  { value: 'south_asia', label: '🇮🇳 South Asia' },
                  { value: 'apac_south', label: '🌏 SE Asia & Oceania' },
                  { value: 'east_asia',  label: '🇯🇵 East Asia' },
                  { value: 'africa',     label: '🌍 Sub-Saharan Africa' },
                ] as { value: RegionValue; label: string }[]).map(({ value, label }) => (
                  <button
                    key={value}
                    className={`${styles.qPill} ${selectedRegion === value ? styles.qPillSelected : ''}`}
                    onClick={() => setSelectedRegion(value)}
                    type="button"
                    aria-pressed={selectedRegion === value}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact info */}
            <div className={styles.qualifyQuestion}>
              <label className={styles.qualifyLabel}>Where should we send your audit?</label>
              <div className={styles.contactFields}>
                <input
                  type="text"
                  className={styles.qEmail}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your first name"
                  autoComplete="given-name"
                  aria-label="First name"
                />
                <input
                  type="email"
                  className={styles.qEmail}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  aria-label="Email address"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              className={`${styles.ctaBtn} ${styles.qualifySubmit}`}
              onClick={handleSubmit}
              type="button"
              disabled={submitState !== 'idle' || isPending}
              style={submitState !== 'idle' || isPending ? { opacity: 0.7, pointerEvents: 'none' } : undefined}
            >
              {submitState === 'idle' && 'Get My Analysis — Free'}
              {submitState === 'loading' && (
                <>
                  <svg
                    style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }}
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" strokeLinecap="round"/>
                  </svg>
                  Preparing your analysis...
                </>
              )}
              {submitState === 'success' && (
                <span style={{ color: '#0A0A0C' }}>
                  ✓ Analysis queued — check your email{name ? `, ${name}` : ''}!
                </span>
              )}
            </button>
            {submitError && (
              <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '0.5rem', textAlign: 'center' }}>
                {submitError}
              </p>
            )}
            <p className={styles.qualifyFine}>No spam. No selling your data. Just your channel audit.</p>
          </div>
          )}

          {/* Trust strip */}
          <div className={styles.trustStrip}>
            <div className={styles.trustItem}>
              <svg viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" width="13" height="13" style={{ color: '#c8ff2e', flexShrink: 0 }} aria-hidden="true">
                <path d="M6.5 1L7.94 4.55L11.5 4.88L8.88 7.16L9.73 10.5L6.5 8.5L3.27 10.5L4.12 7.16L1.5 4.88L5.06 4.55L6.5 1Z" fill="currentColor"/>
              </svg>
              5B+ views analyzed
            </div>
            <div className={styles.trustItem}>
              <svg viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" width="13" height="13" style={{ color: '#c8ff2e', flexShrink: 0 }} aria-hidden="true">
                <rect x="1.5" y="3" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M4.5 3V2a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              50+ channels managed
            </div>
            <div className={styles.trustItem}>
              <svg viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" width="13" height="13" style={{ color: '#c8ff2e', flexShrink: 0 }} aria-hidden="true">
                <path d="M6.5 1.5C3.74 1.5 1.5 3.74 1.5 6.5S3.74 11.5 6.5 11.5 11.5 9.26 11.5 6.5 9.26 1.5 6.5 1.5zM6.5 4v3l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              10+ years experience
            </div>
          </div>
        </div>
      </section>

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
                answer="Around 1 hour. We analyze your channel deeply — not superficially. We pull historical data, cross-reference competitors, and run the six-axis scoring model before writing a single line of the report. Speed would mean noise."
                openId={openFaqId}
                onToggle={handleFaqToggle}
                revealDelay={styles.revealDelay1}
              />
              <FaqItem
                id="faq-2"
                question="What data do you need from me?"
                answer="Just your channel URL. No OAuth, no permissions, no access to your Studio, no credit card. Everything we analyze is public data — the same data your viewers and competitors see. That's the point."
                openId={openFaqId}
                onToggle={handleFaqToggle}
                revealDelay={styles.revealDelay2}
              />
              <FaqItem
                id="faq-3"
                question="Is it really free?"
                answer="Yes. We believe in showing expertise first, asking later. The audit is our way of proving we know what we're talking about before we ask for a budget. If the report doesn't convince you we can help — you're out nothing."
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
              />
              <button className={styles.analyzeBtn} type="button" aria-label="Analyze my channel">
                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16" aria-hidden="true">
                  <circle cx="7" cy="7" r="4.5" stroke="#0A0A0C" strokeWidth="1.8"/>
                  <path d="M10.5 10.5L13.5 13.5" stroke="#0A0A0C" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                Analyze My Channel
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
