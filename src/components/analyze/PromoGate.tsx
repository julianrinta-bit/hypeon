'use client';

import styles from './promoGate.module.css';

interface PromoGateProps {
  onYes: () => void;
  onNo: () => void;
}

export default function PromoGate({ onYes, onNo }: PromoGateProps) {
  return (
    <div className={styles.glassPanel} role="region" aria-label="Promo code gate">
      <h2 className={styles.gateHeadline}>Do you have a promo code?</h2>
      <p className={styles.gateSub}>
        Codes are included in our promotions and partner offers
      </p>
      <div className={styles.gateButtons}>
        <button className={styles.btnYes} onClick={onYes} type="button">
          Yes, I have a code
        </button>
        <button className={styles.btnNo} onClick={onNo} type="button">
          No, show pricing
        </button>
      </div>
    </div>
  );
}
