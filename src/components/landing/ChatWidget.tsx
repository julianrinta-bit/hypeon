'use client';
import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';

const PLACEHOLDERS = [
  "What's your biggest YouTube challenge?",
  "How can I grow my channel faster?",
  "What's wrong with my current strategy?",
  "How do I monetize my audience better?",
  "Can you audit my YouTube channel?",
  "How do I scale to multiple languages?",
];

const CHIPS = [
  "What's wrong with my channel?",
  "How can I grow faster?",
  "How much am I leaving on the table?",
];

export default function ChatWidget() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderKey, setPlaceholderKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cycle placeholder every 3.2s
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const interval = setInterval(() => {
      setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length);
      setPlaceholderKey(k => k + 1);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const navigate = (text: string) => {
    const q = text.trim() || PLACEHOLDERS[placeholderIdx];
    router.push('/chat?q=' + encodeURIComponent(q));
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigate(inputValue);
    }
  };

  const handleSend = () => {
    navigate(inputValue);
  };

  const handleChip = (chipText: string) => {
    navigate(chipText);
  };

  const isInputEmpty = inputValue.length === 0;

  return (
    <div className="chat-widget">
      {/* Input row */}
      <div className="chat-widget__input-row">
        <div className="chat-widget__input-wrap">
          <input
            ref={inputRef}
            className="chat-widget__input"
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKey}
            aria-label="Ask Hype On Advisor"
            autoComplete="off"
          />
          {/* Animated placeholder overlay — only visible when input is empty */}
          {isInputEmpty && (
            <span
              key={placeholderKey}
              className="chat-widget__placeholder"
              aria-hidden="true"
            >
              {PLACEHOLDERS[placeholderIdx]}
              <span className="chat-widget__cursor" aria-hidden="true" />
            </span>
          )}
        </div>

        {/* Send button */}
        <button
          className="chat-widget__send"
          onClick={handleSend}
          aria-label="Send message"
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="#111"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Chips */}
      <div className="chat-widget__chips">
        {CHIPS.map(chip => (
          <button
            key={chip}
            className="chat-widget__chip"
            onClick={() => handleChip(chip)}
            type="button"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
