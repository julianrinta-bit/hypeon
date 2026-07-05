'use client';

import { useState } from 'react';

interface Props {
  onSubmit: (email: string) => void;
  disabled?: boolean;
}

export default function EmailInput({ onSubmit, disabled = false }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!EMAIL_RE.test(trimmed) || trimmed.length > 200) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    onSubmit(trimmed);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-email-wrap">
      <p className="chat-email-hint">Enter your email to set up your free session:</p>
      <div className="chat-email-row">
        <input
          type="email"
          className="chat-email-input"
          placeholder="you@example.com"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(''); }}
          onKeyDown={handleKey}
          disabled={disabled}
          aria-label="Your email address"
          autoComplete="email"
          maxLength={200}
        />
        <button
          className="chat-send-btn"
          onClick={handleSubmit}
          disabled={disabled || value.trim().length === 0}
          type="button"
          aria-label="Submit email"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path d="M2 7.5h11M8.5 3L13 7.5 8.5 12" stroke="#0A0A0C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {error && <p className="chat-email-error" role="alert">{error}</p>}
    </div>
  );
}
