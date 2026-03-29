'use client';

import { useEffect, useState, useRef } from 'react';
import { fetchJobStatus } from '@/lib/actions/status';
import styles from './status.module.css';

// ── Pipeline stages (order matters) ────────────────────────────────────────

const STAGES = [
  { key: 'queued',                label: 'Queued',             desc: 'Waiting for the next processing slot' },
  { key: 'channel_ingesting',     label: 'Channel Data',       desc: 'Pulling your channel stats, metadata, and video catalog' },
  { key: 'transcripting',         label: 'Transcripts',        desc: 'Extracting and analyzing your video transcripts' },
  { key: 'analyzing',             label: 'Deep Analysis',      desc: 'Running expert analysis on content, strategy, and positioning' },
  { key: 'waiting_local_analysis',label: 'Deep Analysis',      desc: 'Running expert analysis on content, strategy, and positioning' },
  { key: 'competitor_discovering',label: 'Competitors',        desc: 'Identifying and benchmarking similar channels' },
  { key: 'waiting_local_ranking', label: 'Competitors',        desc: 'Ranking competitors by relevance and threat level' },
  { key: 'generating',            label: 'Report',             desc: 'Generating your personalized audit report' },
  { key: 'complete',              label: 'Complete',           desc: 'Your audit is ready' },
];

// Deduplicated for display (waiting_local_* merge with their parent stage)
const DISPLAY_STAGES = [
  { keys: ['queued'],                                          label: 'Queued',           icon: '◯' },
  { keys: ['channel_ingesting'],                               label: 'Channel Data',     icon: '◎' },
  { keys: ['transcripting'],                                   label: 'Transcripts',      icon: '◎' },
  { keys: ['analyzing', 'waiting_local_analysis'],             label: 'Deep Analysis',    icon: '◎' },
  { keys: ['competitor_discovering', 'waiting_local_ranking'],  label: 'Competitors',      icon: '◎' },
  { keys: ['generating'],                                      label: 'Report Card',      icon: '◎' },
  { keys: ['complete'],                                        label: 'Complete',         icon: '✓' },
];

function getStageIndex(status: string): number {
  return STAGES.findIndex(s => s.key === status);
}

function getDisplayStageIndex(status: string): number {
  return DISPLAY_STAGES.findIndex(s => s.keys.includes(status));
}

function getStageDescription(status: string): string {
  return STAGES.find(s => s.key === status)?.desc || 'Processing...';
}

// ── Component ──────────────────────────────────────────────────────────────

export default function StatusClient({ publicId }: { publicId: string }) {
  const [status, setStatus] = useState<string>('queued');
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>(null);

  // Poll for status updates
  useEffect(() => {
    let mounted = true;

    const fetchStatus = async () => {
      const result = await fetchJobStatus(publicId);

      if (!mounted) return;

      if (!result.found) {
        setNotFound(true);
        return;
      }

      setStatus(result.data.status);

      if (result.data.status === 'failed') {
        setError(result.data.errorMessage || 'Analysis failed. Our team has been notified.');
      }

      // Stop polling on terminal states
      if (result.data.status === 'complete' || result.data.status === 'failed') {
        if (pollRef.current) clearInterval(pollRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
      }

      // Redirect to results on complete
      if (result.data.status === 'complete') {
        setTimeout(() => {
          window.location.href = `/analyze/${publicId}`;
        }, 2000);
      }
    };

    // Initial fetch
    fetchStatus();

    // Poll every 8 seconds
    pollRef.current = setInterval(fetchStatus, 8000);

    // Elapsed timer
    timerRef.current = setInterval(() => {
      if (mounted) setElapsedSeconds(s => s + 1);
    }, 1000);

    return () => {
      mounted = false;
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [publicId]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const currentDisplayIndex = getDisplayStageIndex(status);
  const isComplete = status === 'complete';
  const isFailed = status === 'failed';

  if (notFound) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Analysis Not Found</h1>
          <p className={styles.subtitle}>
            This analysis doesn&apos;t exist or the link is invalid.
          </p>
          <a href="/analyze" className={styles.ctaBtn}>Start a New Analysis</a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.pulseRing} aria-hidden="true">
            {!isComplete && !isFailed && <div className={styles.pulseInner} />}
            <div className={styles.pulseCore} style={
              isComplete ? { background: '#c8ff2e' } :
              isFailed ? { background: '#F87171' } :
              undefined
            } />
          </div>
          <h1 className={styles.title}>
            {isComplete ? 'Your Audit Is Ready' :
             isFailed ? 'Analysis Failed' :
             'Preparing Your Audit'}
          </h1>
          <p className={styles.subtitle}>
            {isComplete ? 'Redirecting you to your results...' :
             isFailed ? error :
             getStageDescription(status)}
          </p>
        </div>

        {/* Progress pipeline */}
        <div className={styles.pipeline}>
          {DISPLAY_STAGES.map((stage, i) => {
            const isActive = i === currentDisplayIndex && !isFailed;
            const isDone = i < currentDisplayIndex || isComplete;
            const isCurrent = isActive && !isComplete;

            return (
              <div
                key={stage.label}
                className={[
                  styles.stage,
                  isDone ? styles.stageDone : '',
                  isCurrent ? styles.stageActive : '',
                  isFailed && isActive ? styles.stageFailed : '',
                ].filter(Boolean).join(' ')}
              >
                <div className={styles.stageIcon}>
                  {isDone ? '✓' : isCurrent ? (
                    <div className={styles.spinnerSmall} />
                  ) : stage.icon}
                </div>
                <span className={styles.stageLabel}>{stage.label}</span>
                {i < DISPLAY_STAGES.length - 1 && (
                  <div className={[
                    styles.stageConnector,
                    isDone ? styles.stageConnectorDone : '',
                  ].filter(Boolean).join(' ')} />
                )}
              </div>
            );
          })}
        </div>

        {/* Timer */}
        {!isComplete && !isFailed && (
          <p className={styles.timer}>
            Elapsed: {formatTime(elapsedSeconds)}
            <span className={styles.timerNote}> — Most audits complete in 5-10 minutes</span>
          </p>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          {isComplete && (
            <a href={`/analyze/${publicId}`} className={styles.ctaBtn}>
              View Your Results
            </a>
          )}
          {isFailed && (
            <a href="/analyze" className={styles.ctaBtn}>
              Try Again
            </a>
          )}
          {!isComplete && !isFailed && (
            <p className={styles.note}>
              We&apos;ll email you when your audit is ready. You can close this page.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
