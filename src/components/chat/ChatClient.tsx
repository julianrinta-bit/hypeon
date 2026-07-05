'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import BotButtons from './BotButtons';
import EmailInput from './EmailInput';

interface BotMessage {
  text: string;
  cta?: boolean;
}

interface BotButton {
  label: string;
  value: string;
}

interface ConversationContext {
  sessionId: string;
  visitorId?: string;
  turn: number;
  purpose?: string;
  handle?: string;
  channelId?: string;
  channelName?: string;
  subscriberCount?: number;
}

type BotStateId = 'INIT' | 'AWAIT_PURPOSE' | 'AWAIT_HANDLE' | 'AWAIT_EMAIL' | 'DONE' | 'UNAVAILABLE';

interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
  cta?: boolean;
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return crypto.randomUUID();
  const key = 'hom_chat_session';
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem(key, id);
  return id;
}

function getVisitorId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return localStorage.getItem('hom_vid') ?? undefined;
  } catch {
    return undefined;
  }
}

export default function ChatClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stateId, setStateId] = useState<BotStateId>('INIT');
  const [context, setContext] = useState<ConversationContext | null>(null);
  const [buttons, setButtons] = useState<BotButton[] | undefined>();
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [botTrap, setBotTrap] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initSent = useRef(false);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const sendMessage = useCallback(async (
    input: string | null,
    currentStateId: BotStateId,
    currentContext: ConversationContext,
  ) => {
    setLoading(true);
    setButtons(undefined);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stateId: currentStateId,
          input,
          context: currentContext,
          botTrap,
        }),
      });

      if (!res.ok && res.status !== 429) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json() as {
        ok: boolean;
        stateId: BotStateId;
        messages: BotMessage[];
        buttons?: BotButton[];
        context: ConversationContext;
      };

      setMessages(prev => [
        ...prev,
        ...data.messages.map(m => ({ role: 'bot' as const, text: m.text, cta: m.cta })),
      ]);
      setStateId(data.stateId);
      if (data.context?.sessionId) {
        setContext(data.context);
      }
      if (data.buttons) setButtons(data.buttons);
    } catch (err) {
      console.error('[ChatClient] error:', err);
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: 'Something went wrong. Please refresh the page and try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [botTrap]);

  // Initialize chat on mount — exactly once
  useEffect(() => {
    if (initSent.current) return;
    initSent.current = true;

    const sessionId = getOrCreateSessionId();
    const visitorId = getVisitorId();
    const initialContext: ConversationContext = { sessionId, visitorId, turn: 0 };
    setContext(initialContext);
    sendMessage(null, 'INIT', initialContext);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTextSubmit = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || loading || !context) return;

    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    setInputValue('');
    sendMessage(trimmed, stateId, context);
  }, [inputValue, loading, context, stateId, sendMessage]);

  const handleButtonSelect = useCallback((value: string, label: string) => {
    if (loading || !context) return;
    setMessages(prev => [...prev, { role: 'user', text: label }]);
    sendMessage(value, stateId, context);
  }, [loading, context, stateId, sendMessage]);

  const handleEmailSubmit = useCallback((email: string) => {
    if (loading || !context) return;
    setMessages(prev => [...prev, { role: 'user', text: email }]);
    sendMessage(email, stateId, context);
  }, [loading, context, stateId, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  const isDone = stateId === 'DONE';
  const isUnavailableState = stateId === 'UNAVAILABLE';
  const showEmailInput = stateId === 'AWAIT_EMAIL' && !loading;
  const showButtons = buttons && buttons.length > 0 && !loading && !isDone;
  const showTextInput = !isDone && !isUnavailableState && !showEmailInput && stateId !== 'AWAIT_PURPOSE';

  return (
    <div className="chat-container">
      {/* Honeypot — hidden from real users */}
      <input
        type="text"
        name="website"
        value={botTrap}
        onChange={(e) => setBotTrap(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
        autoComplete="off"
      />

      <div className="chat-messages" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${msg.role === 'bot' ? 'chat-bubble-bot' : 'chat-bubble-user'}${msg.cta ? ' chat-bubble-cta' : ''}`}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="chat-bubble chat-bubble-bot chat-typing" aria-label="Bot is typing">
            <span className="chat-dot" />
            <span className="chat-dot" />
            <span className="chat-dot" />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {showButtons && (
        <BotButtons
          buttons={buttons}
          onSelect={handleButtonSelect}
          disabled={loading}
        />
      )}

      {showEmailInput && (
        <EmailInput onSubmit={handleEmailSubmit} disabled={loading} />
      )}

      {showTextInput && (
        <div className="chat-input-row">
          <input
            ref={inputRef}
            type="text"
            className="chat-text-input"
            placeholder={
              stateId === 'AWAIT_HANDLE'
                ? 'Your YouTube handle (@yourname)…'
                : 'Type a message…'
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            aria-label="Chat message input"
            maxLength={500}
          />
          <button
            className="chat-send-btn"
            onClick={handleTextSubmit}
            disabled={loading || inputValue.trim().length === 0}
            type="button"
            aria-label="Send message"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <path d="M2 7.5h11M8.5 3L13 7.5 8.5 12" stroke="#0A0A0C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
