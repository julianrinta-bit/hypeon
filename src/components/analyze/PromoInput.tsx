'use client';

import { useState, useCallback, useRef } from 'react';
import { isValidPromoCode } from '@/config/promoCodes';
import { trackEvent } from '@/lib/pixel';
import styles from './promoGate.module.css';

type InputState = 'idle' | 'validating' | 'valid' | 'invalid';

interface PromoInputProps {
  onValid: (code: string) => void;
  onBack: () => void;
}

export default function PromoInput({ onValid, onBack }: PromoInputProps) {
  const [value, setValue] = useState('');
  const [inputState, setInputState] = useState<InputState>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleApply = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) {
      setInputState('invalid');
      inputRef.current?.focus();
      return;
    }

    setInputState('validating');

    // Small async tick to show the spinner briefly
    setTimeout(() => {
      if (isValidPromoCode(trimmed)) {
        const upperCode = trimmed.toUpperCase().trim();
        setInputState('valid');
        trackEvent('PromoCodeUsed', { code: upperCode });
        // Let the valid state show for 800ms before proceeding
        setTimeout(() => {
          onValid(upperCode);
        }, 800);
      } else {
        setInputState('invalid');
        inputRef.current?.focus();
      }
    }, 400);
  }, [value, onValid]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleApply();
    },
    [handleApply]
  );

  const codeInputClass = [
    styles.codeInput,
    inputState === 'valid'   ? styles.codeInputValid   : '',
    inputState === 'invalid' ? styles.codeInputInvalid : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.glassPanel} role="region" aria-label="Promo code entry">
      <div className={styles.inputHeader}>
        <button className={styles.backBtn} onClick={onBack} type="button" aria-label="Go back">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <span className={styles.inputLabel}>Enter your code</span>
        {/* spacer to center the label */}
        <span style={{ width: 42, flexShrink: 0 }} />
      </div>

      <div className={styles.codeRow}>
        <input
          ref={inputRef}
          type="text"
          className={codeInputClass}
          value={value}
          onChange={e => {
            setValue(e.target.value);
            if (inputState === 'invalid') setInputState('idle');
          }}
          onKeyDown={handleKeyDown}
          placeholder="Enter your code"
          autoComplete="off"
          spellCheck={false}
          readOnly={inputState === 'valid' || inputState === 'validating'}
          aria-label="Promo code"
          aria-describedby="code-feedback"
        />
        <button
          className={styles.applyBtn}
          onClick={handleApply}
          type="button"
          disabled={inputState === 'validating' || inputState === 'valid'}
          aria-label="Apply promo code"
        >
          {inputState === 'validating' ? (
            <svg className={styles.spinner} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="#0A0A0C" strokeWidth="3" strokeDasharray="30 70" strokeLinecap="round"/>
            </svg>
          ) : (
            'Apply'
          )}
        </button>
      </div>

      <p
        id="code-feedback"
        className={[
          styles.codeMsg,
          inputState === 'valid'   ? styles.codeMsgValid   : '',
          inputState === 'invalid' ? styles.codeMsgInvalid : '',
        ].filter(Boolean).join(' ')}
        role="status"
        aria-live="polite"
      >
        {inputState === 'valid' && (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Code applied — FREE audit!
          </>
        )}
        {inputState === 'invalid' && (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Invalid code
          </>
        )}
      </p>
    </div>
  );
}
