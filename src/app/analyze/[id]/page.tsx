/**
 * /analyze/[id] — Teaser Results Page
 *
 * Server component. Fetches the analysis result for the given public ID.
 * - not_found  → 404-style inline message with link back to /analyze
 * - not_ready  → redirect to /analyze/status/[id] (still processing)
 * - found      → render TeaserClient with full data
 */

import { redirect } from 'next/navigation';
import { fetchTeaserData } from '@/lib/actions/results';
import TeaserClient from '@/components/analyze/TeaserClient';
import styles from '../analyze.module.css';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TeaserPage({ params }: Props) {
  const { id } = await params;
  const result = await fetchTeaserData(id);

  if (!result.found) {
    if (result.reason === 'not_ready') {
      redirect(`/analyze/status/${id}`);
    }

    // expired — dedicated expired page
    if (result.reason === 'expired') {
      return (
        <div className={styles.page}>
          <div
            style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 24px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--az-accent, #c8ff2e)',
                marginBottom: '20px',
              }}
            >
              Report Expired
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 'clamp(28px, 5vw, 48px)',
                color: 'var(--az-text-bright, #E5E7EB)',
                marginBottom: '16px',
                lineHeight: 1.1,
              }}
            >
              This report has expired
            </h1>
            <p
              style={{
                fontSize: '16px',
                color: 'var(--az-text-muted, #9CA3AF)',
                maxWidth: '460px',
                marginBottom: '40px',
                lineHeight: 1.6,
              }}
            >
              Your analysis was available for 24 hours after completion.
            </p>
            <a
              href="#"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                height: '52px',
                padding: '0 32px',
                background: 'var(--az-accent, #c8ff2e)',
                color: '#0A0A0C',
                fontWeight: 700,
                fontSize: '15px',
                borderRadius: '10px',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
              }}
            >
              Book a call to access the full analysis and receive your PDF
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      );
    }

    // not_found — render inline
    return (
      <div className={styles.page}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--az-accent, #c8ff2e)',
              marginBottom: '20px',
            }}
          >
            404
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(28px, 5vw, 48px)',
              color: 'var(--az-text-bright, #E5E7EB)',
              marginBottom: '16px',
              lineHeight: 1.1,
            }}
          >
            Analysis Not Found
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: 'var(--az-text-muted, #9CA3AF)',
              maxWidth: '400px',
              marginBottom: '40px',
              lineHeight: 1.6,
            }}
          >
            This analysis doesn&apos;t exist or the link has expired.
          </p>
          <a
            href="/analyze"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              height: '48px',
              padding: '0 28px',
              background: 'var(--az-accent, #c8ff2e)',
              color: '#0A0A0C',
              fontWeight: 700,
              fontSize: '15px',
              borderRadius: '10px',
              textDecoration: 'none',
              letterSpacing: '-0.01em',
            }}
          >
            ← Analyze Your Channel
          </a>
        </div>
      </div>
    );
  }

  return <TeaserClient data={result.data} publicId={id} />;
}
