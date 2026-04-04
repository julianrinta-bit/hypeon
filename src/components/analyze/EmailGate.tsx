'use client';

import {
  useRef,
  useState,
  useTransition,
  useCallback,
  type KeyboardEvent,
  type ClipboardEvent,
} from 'react';
import { sendVerificationCode, verifyCode } from '@/lib/actions/verify-email';
import styles from './EmailGate.module.css';

// ── Helpers ──────────────────────────────────────────────────────────────────

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.slice(0, 2);
  const masked = '*'.repeat(Math.max(2, local.length - 2));
  return `${visible}${masked}@${domain}`;
}

// ── Props ────────────────────────────────────────────────────────────────────

interface EmailGateProps {
  onVerified: (email: string) => void;
  appliedCode: string | null;
  onApplyCode: () => void;
  /** When provided, skip directly to code-verification stage with this email */
  initialEmail?: string;
  initialStage?: 'email' | 'code';
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EmailGate({ onVerified, appliedCode, onApplyCode, initialEmail, initialStage }: EmailGateProps) {
  const [stage, setStage] = useState<'email' | 'code'>(initialStage ?? 'email');
  const [email, setEmail] = useState(initialEmail ?? '');
  const [emailError, setEmailError] = useState(false);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeShake, setCodeShake] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPendingSend, startSend] = useTransition();
  const [isPendingVerify, startVerify] = useTransition();

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Send code ───────────────────────────────────────────────────────────────
  const handleSendCode = useCallback(() => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    setSubmitError(null);

    startSend(async () => {
      const result = await sendVerificationCode(trimmed);
      if ('error' in result) {
        setSubmitError(result.error);
        return;
      }
      setStage('code');
      setDigits(['', '', '', '', '', '']);
      setCodeError(null);
      // Auto-focus first OTP input after transition
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    });
  }, [email]);

  // ── Resend code ─────────────────────────────────────────────────────────────
  const handleResend = useCallback(() => {
    setCodeError(null);
    setDigits(['', '', '', '', '', '']);
    startSend(async () => {
      const result = await sendVerificationCode(email.trim());
      if ('error' in result) {
        setCodeError(result.error);
      } else {
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    });
  }, [email]);

  // ── OTP digit input ─────────────────────────────────────────────────────────
  const handleDigitChange = useCallback(
    (index: number, value: string) => {
      const char = value.replace(/\D/g, '').slice(-1);
      const next = [...digits];
      next[index] = char;
      setDigits(next);
      setCodeError(null);

      if (char && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when all 6 filled
      if (char && index === 5) {
        const fullCode = [...next].join('');
        if (fullCode.length === 6) {
          submitCode(fullCode);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [digits]
  );

  const handleDigitKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (!digits[index] && index > 0) {
          inputRefs.current[index - 1]?.focus();
        } else {
          const next = [...digits];
          next[index] = '';
          setDigits(next);
        }
      }
    },
    [digits]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
      if (!pasted) return;
      const next = Array(6).fill('');
      for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
      setDigits(next);
      setCodeError(null);
      const focusIdx = Math.min(pasted.length, 5);
      inputRefs.current[focusIdx]?.focus();
      if (pasted.length === 6) {
        submitCode(pasted);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const submitCode = useCallback(
    (code: string) => {
      startVerify(async () => {
        const result = await verifyCode(email.trim(), code);
        if (result.verified) {
          onVerified(email.trim());
        } else {
          setCodeError(result.error);
          setCodeShake(true);
          setTimeout(() => setCodeShake(false), 400);
          setDigits(['', '', '', '', '', '']);
          setTimeout(() => inputRefs.current[0]?.focus(), 50);
        }
      });
    },
    [email, onVerified]
  );

  const handleVerifyClick = useCallback(() => {
    const code = digits.join('');
    if (code.length < 6) {
      setCodeError('Enter all 6 digits.');
      return;
    }
    submitCode(code);
  }, [digits, submitCode]);

  // ── Email stage ─────────────────────────────────────────────────────────────
  if (stage === 'email') {
    return (
      <div className={styles.gate}>
        <h3 className={styles.headline}>We scored your channel across 7 dimensions.</h3>
        <p className={styles.subtext}>
          Enter your email to see where you&apos;re winning — and the one thing holding you back.
        </p>

        <ul className={styles.checklist}>
          {[
            'Content strategy analysis with specific fixes',
            'Title and thumbnail scoring',
            'Competitor breakdown',
            'Personalized growth roadmap',
          ].map((item) => (
            <li key={item} className={styles.checkItem}>
              <svg
                className={styles.checkMark}
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8L6.5 11.5L13 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {item}
            </li>
          ))}
        </ul>

        <p className={styles.deliveryNote}>Delivered by our team within 24 hours.</p>

        {/* Promo badge */}
        {appliedCode && (
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <span className={styles.promoBadge}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path
                  d="M2 6L5 9L10 3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Complimentary access — code {appliedCode}
            </span>
          </div>
        )}

        <div className={styles.inputRow}>
          <input
            type="email"
            className={`${styles.emailInput} ${emailError ? styles.emailInputError : ''}`}
            placeholder="you@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(false);
              if (submitError) setSubmitError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendCode();
            }}
            autoComplete="email"
            aria-label="Email address"
          />
          <button
            className={styles.ctaBtn}
            onClick={handleSendCode}
            disabled={isPendingSend}
            type="button"
          >
            {isPendingSend ? (
              <>
                <svg className={styles.spinner} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="30 70"
                    strokeLinecap="round"
                  />
                </svg>
                Sending...
              </>
            ) : (
              'Send Me the Full Audit'
            )}
          </button>
        </div>

        {(emailError || submitError) && (
          <p className={styles.errorMsg}>
            {submitError || 'Please enter a valid email address.'}
          </p>
        )}

        {!appliedCode && (
          <p className={styles.promoLink}>
            Have a complimentary access code?{' '}
            <button type="button" className={styles.promoLinkBtn} onClick={onApplyCode}>
              Apply it here
            </button>
          </p>
        )}
      </div>
    );
  }

  // ── Code stage ──────────────────────────────────────────────────────────────
  return (
    <div className={styles.gate}>
      <div className={styles.codeSection}>
        <h3 className={styles.codeHeadline}>Check your inbox</h3>
        <p className={styles.codeSubtext}>
          Enter the 6-digit code we sent to{' '}
          <span className={styles.maskedEmail}>{maskEmail(email)}</span>
        </p>

        <div className={styles.otpRow} role="group" aria-label="6-digit verification code">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              className={[
                styles.otpInput,
                digit ? styles.otpInputFilled : '',
                codeShake ? styles.otpInputError : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleDigitKeyDown(i, e)}
              onPaste={handlePaste}
              aria-label={`Digit ${i + 1}`}
              disabled={isPendingVerify}
              autoComplete="one-time-code"
            />
          ))}
        </div>

        {isPendingVerify && (
          <p className={styles.codeSubtext} style={{ marginBottom: 8 }}>
            <svg
              className={styles.spinner}
              viewBox="0 0 24 24"
              fill="none"
              style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }}
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="#c8ff2e"
                strokeWidth="3"
                strokeDasharray="30 70"
                strokeLinecap="round"
              />
            </svg>
            Verifying...
          </p>
        )}

        {codeError && !isPendingVerify && (
          <p className={styles.errorMsg}>{codeError}</p>
        )}

        {digits.join('').length === 6 && !isPendingVerify && !codeError && (
          <button
            className={styles.ctaBtn}
            onClick={handleVerifyClick}
            type="button"
            style={{ marginTop: 16 }}
          >
            Verify Code
          </button>
        )}

        <div className={styles.resendRow}>
          <span>Didn&apos;t receive it?</span>
          <button
            type="button"
            className={styles.resendBtn}
            onClick={handleResend}
            disabled={isPendingSend}
          >
            {isPendingSend ? 'Sending...' : 'Send again'}
          </button>
        </div>
      </div>
    </div>
  );
}
