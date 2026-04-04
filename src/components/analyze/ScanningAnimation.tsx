'use client';

import { useEffect, useState } from 'react';
import styles from './ScanningAnimation.module.css';

const PHASES = [
  { label: 'Connecting to YouTube...', duration: 1000 },
  { label: 'Scanning channel data...', duration: 1200 },
  { label: 'Calculating health score...', duration: 1000 },
];

export default function ScanningAnimation() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [key, setKey] = useState(0); // used to re-trigger animation

  useEffect(() => {
    let elapsed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    PHASES.forEach((phase, i) => {
      const t = setTimeout(() => {
        setPhaseIndex(i);
        setKey(prev => prev + 1);
      }, elapsed);
      timers.push(t);
      elapsed += phase.duration;
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.dotRow} aria-hidden="true">
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
      <p key={key} className={styles.phaseText} aria-live="polite">
        {PHASES[phaseIndex].label}
      </p>
    </div>
  );
}
