'use client';

import { trackEvent } from '@/lib/pixel';
import styles from './promoGate.module.css';

interface PricingPanelProps {
  onSwitchToCode: () => void;
}

const VALUE_POINTS = [
  'Six-axis scoring by the team behind 5B+ views',
  'Competitor analysis + actionable recommendations',
  'Delivered within 48 hours',
];

export default function PricingPanel({ onSwitchToCode }: PricingPanelProps) {
  const handleCtaClick = () => {
    trackEvent('InitiateCheckout');
  };

  return (
    <div className={styles.glassPanel} role="region" aria-label="Audit pricing">
      <div className={styles.pricingHeader}>
        <div className={styles.pricingPrice}>$200</div>
        <div className={styles.pricingPriceSub}>per channel audit</div>
      </div>

      <ul className={styles.valuePoints} aria-label="What is included">
        {VALUE_POINTS.map(point => (
          <li key={point} className={styles.valuePoint}>
            <svg
              className={styles.valueCheck}
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8L6.5 11.5L13 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {point}
          </li>
        ))}
      </ul>

      <a
        href="mailto:hello@hypeon.media?subject=YouTube%20Channel%20Audit%20Request"
        className={styles.pricingCta}
        onClick={handleCtaClick}
        aria-label="Request audit for $200"
      >
        Request Audit — $200
      </a>

      <p className={styles.promoSwitch}>
        Have a promo code?{' '}
        <button
          className={styles.promoSwitchLink}
          onClick={onSwitchToCode}
          type="button"
        >
          Apply it here
        </button>
      </p>
    </div>
  );
}
