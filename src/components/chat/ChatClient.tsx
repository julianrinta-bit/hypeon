'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getReply } from '@/lib/chat-responses';

/* === ChatClient ===
   Full chat UI for /chat page. Matches HypeOn Chat.dc.html design.
   - 5 suggestion chips (from .dc.html) that disappear after first message
   - On mount: if initialQ is set, auto-sends after 400ms
   - User bubbles: right-aligned, rgba(200,255,46,.1)
   - Bot bubbles: left-aligned, dark card with avatar "Hype On Advisor"
   - Typing indicator: 3 animated dots
   - Textarea: auto-resize ≤120px, Enter=send, Shift+Enter=newline
   - CTA "Get a Free Channel Audit →" → /#contact when reply.cta=true
*/

interface Message {
  id: number;
  role: 'user' | 'bot';
  text: string;
  cta?: boolean;
}

interface Props {
  initialQ?: string;
}

const CHIPS = [
  "What's wrong with my channel?",
  'How can I grow faster?',
  'How much am I leaving on the table?',
  'How does multi-language expansion work?',
  'What does a typical engagement look like?',
];

export default function ChatClient({ initialQ = '' }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sentInitial = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const send = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages(prev => [
      ...prev,
      { id: Date.now(), role: 'user', text: trimmed },
    ]);
    setInputValue('');
    setIsTyping(true);
    setShowChips(false);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const delay = 1200 + Math.random() * 600;
    setTimeout(() => {
      const reply = getReply(trimmed);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: 'bot', text: reply.text, cta: reply.cta },
      ]);
    }, delay);
  }, []);

  // Auto-send initialQ after 400ms (from ?q= param)
  useEffect(() => {
    if (initialQ && !sentInitial.current) {
      sentInitial.current = true;
      const timer = setTimeout(() => send(initialQ), 400);
      return () => clearTimeout(timer);
    }
  }, [initialQ, send]);

  // Scroll on new messages / typing state change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-resize
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(inputValue);
    }
  };

  const isSendDisabled = inputValue.trim().length === 0 || isTyping;

  return (
    <main id="main-content" className="chat-shell-page">
      {/* Nav */}
      <div className="chat-page-nav" role="banner">
        <a href="/" className="chat-page-nav-logo" aria-label="Hype On Media home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hypeon-logo.png" alt="Hype On" width={22} height={22} style={{ objectFit: 'contain' }} />
          <span className="chat-page-nav-logo-text">Hype On Media</span>
          <span className="chat-page-beta" aria-label="Beta">Beta</span>
        </a>
        <a href="/" className="chat-page-back">← Back</a>
      </div>

      {/* Messages */}
      <div className="chat-messages" id="chat-messages-list" aria-live="polite" aria-label="Chat messages">

        {/* Welcome block */}
        <div className="chat-welcome">
          <div className="chat-welcome-eyebrow">
            <span className="chat-welcome-dot" aria-hidden="true" />
            <span className="chat-welcome-label">Channel Advisor</span>
          </div>
          <h1 className="chat-welcome-h1">
            What&apos;s holding your<br />YouTube channel back?
          </h1>
          <p className="chat-welcome-sub">
            Tell us about your channel — goals, challenges, or what you&apos;d like to improve. We&apos;ll give you honest, specific advice.
          </p>

          {/* Suggestion chips */}
          {showChips && (
            <div className="chat-chips" role="list" aria-label="Suggested questions">
              {CHIPS.map((chip) => (
                <button
                  key={chip}
                  className="chat-chip"
                  role="listitem"
                  onClick={() => send(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message bubbles */}
        {messages.map((msg) =>
          msg.role === 'user' ? (
            <div key={msg.id} className="chat-bubble-user" aria-label="You">
              <p>{msg.text}</p>
            </div>
          ) : (
            <div key={msg.id} className="chat-bubble-bot" aria-label="Hype On Advisor">
              <div className="chat-bot-avatar">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/hypeon-logo.png" alt="" width={20} height={20} />
                <span>Hype On Advisor</span>
              </div>
              <div className="chat-bot-inner">
                <p>{msg.text}</p>
                {msg.cta && (
                  <a href="/#contact" className="chat-cta-btn">
                    Get a Free Channel Audit →
                  </a>
                )}
              </div>
            </div>
          )
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="chat-typing" aria-label="Advisor is typing">
            <div className="chat-bot-avatar">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/hypeon-logo.png" alt="" width={20} height={20} />
              <span>Hype On Advisor</span>
            </div>
            <div className="chat-typing-inner">
              <span className="chat-typing-dot" aria-hidden="true" />
              <span className="chat-typing-dot" aria-hidden="true" />
              <span className="chat-typing-dot" aria-hidden="true" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-input-row">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder="Ask about your channel..."
            rows={1}
            value={inputValue}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            aria-label="Message input"
          />
          <button
            className="chat-send-btn"
            onClick={() => send(inputValue)}
            disabled={isSendDisabled}
            aria-label="Send message"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <path d="M2 7.5h11M8.5 3L13 7.5 8.5 12" stroke="#0A0A0C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="chat-disclaimer">
          Hype On Media · Not financial advice · For educational purposes
        </p>
      </div>
    </main>
  );
}
