import type { Metadata } from 'next';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import styles from '@/app/analyze/analyze.module.css';

const AnalyzeClient = dynamic(() => import('@/components/analyze/AnalyzeClient'), {
  loading: () => null,
});

export const metadata: Metadata = {
  title: 'YouTube Channel Analyzer — Channel Audit | Hype On Media',
  description:
    'Get an in-depth YouTube channel analysis from the team behind 5B+ views. Six-axis scoring: content strategy, titles, thumbnails, engagement, growth, and monetization. No OAuth, no credit card.',
  metadataBase: new URL('https://hypeon.media'),
  alternates: {
    canonical: '/analyze',
  },
  openGraph: {
    title: 'YouTube Channel Analyzer — Channel Audit',
    description:
      'See what YouTube really sees in your channel. Expert analysis by the team behind 5B+ views. No OAuth. No credit card. Just paste your URL.',
    type: 'website',
    url: 'https://hypeon.media/analyze',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Channel Analyzer — Channel Audit',
    description:
      'In-depth channel analysis by the team behind 5B+ YouTube views. Six axes. Scored. Actionable.',
  },
};

/**
 * Server-rendered hero shell — identical markup to AnalyzeClient's hero.
 * Renders immediately in the HTML response so the browser paints content
 * before JS hydrates (eliminates the 8.3s blank-screen LCP).
 */
function HeroShell() {
  return (
    <div className={styles.page} id="main-content">
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

          {/* Static input shell — replaced by interactive version on hydration */}
          <div id="analyze">
            <div className={styles.inputRow}>
              <input
                type="url"
                className={styles.urlInput}
                placeholder="youtube.com/@yourchannel"
                autoComplete="off"
                spellCheck={false}
                readOnly
                aria-label="YouTube channel URL"
              />
              <button
                className={styles.analyzeBtn}
                type="button"
                aria-label="Scan my channel"
              >
                <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="16" height="16" aria-hidden="true">
                  <circle cx="7" cy="7" r="4.5" stroke="#0A0A0C" strokeWidth="1.8"/>
                  <path d="M10.5 10.5L13.5 13.5" stroke="#0A0A0C" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                Scan My Channel
              </button>
            </div>
          </div>

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
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<HeroShell />}>
      <AnalyzeClient />
    </Suspense>
  );
}
