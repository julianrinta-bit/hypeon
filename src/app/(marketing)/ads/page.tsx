'use client';

import { useState, useTransition, useRef } from 'react';
import { loginAds } from '@/lib/actions/adsAuth';
import styles from './ads.module.css';

export default function AdsGatePage() {
  const [error, setError]         = useState<string | null>(null);
  const [shaking, setShaking]     = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setShaking(false);

    const data = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAds(data);
      if (result?.error) {
        setError(result.error);
        setShaking(true);
        // Remove shake class after animation completes so it can re-trigger
        setTimeout(() => setShaking(false), 450);
        inputRef.current?.focus();
      }
      // On success, loginAds redirects — no further action needed
    });
  }

  return (
    <main className={styles.page}>
      <div className={styles.pageBg} aria-hidden="true" />

      <div className={styles.glassPanel} role="main">
        {/* Logo row */}
        <div className={styles.logoRow} aria-hidden="true">
          <div className={styles.logoIcon}>
            <span className={styles.logoIconInner}>&#9650;</span>
          </div>
          <span className={styles.logoText}>Hype On Media</span>
        </div>

        <h1 className={styles.title}>Ads Dashboard</h1>
        <p className={styles.subtitle}>Enter your password to access the media buyer panel.</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.inputWrap}>
            <input
              ref={inputRef}
              type="password"
              name="password"
              id="ads-password"
              autoComplete="current-password"
              placeholder="Password"
              className={`${styles.input} ${shaking ? styles.inputError : ''}`}
              aria-label="Dashboard password"
              aria-describedby={error ? 'ads-error' : undefined}
              autoFocus
              required
            />
          </div>

          {error && (
            <p className={styles.errorMsg} id="ads-error" role="alert" aria-live="assertive">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="6.5" stroke="#F87171" />
                <path d="M7 4v3.5M7 9.5v.5" stroke="#F87171" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              {error}
            </p>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? 'Verifying...' : 'Enter'}
          </button>
        </form>

        <p className={styles.footerNote}>Internal tool &mdash; Hype On Media FZCO</p>
      </div>
    </main>
  );
}
