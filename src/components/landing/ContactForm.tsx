'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { submitLead } from '@/lib/actions/leads';
import ParallaxBgNumber from '@/components/ui/ParallaxBgNumber';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

type ServiceKey = 'youtube' | 'creative' | 'products' | 'unsure';

const serviceConfig = {
  youtube:  { btn: 'Send Me My Free Audit',     showYT: true,  delivery: 'Delivered within 48 hours' },
  creative: { btn: 'Get My Free Strategy Brief', showYT: false, delivery: 'Initial review within 48 hours' },
  products: { btn: 'Start the Conversation',     showYT: false, delivery: 'Response within 24 hours' },
  unsure:   { btn: 'Get My Free Audit',          showYT: false, delivery: 'Delivered within 48 hours' },
};

const placeholders: Record<ServiceKey, string> = {
  youtube: 'We run a YouTube channel with 500k subs and want to...',
  creative: "We're spending $50k/mo on Meta ads and need better creative...",
  products: 'We need a tool that automates our content workflow...',
  unsure: "Here's what we're working on...",
};

function validateYouTubeUrl(value: string): boolean | null {
  if (!value) return null;
  const v = value.trim();
  if (v.startsWith('@')) return true;
  if (/youtube\.com/i.test(v) || /youtu\.be/i.test(v)) return true;
  return false;
}

export default function ContactForm() {
  const [service, setService] = useState<ServiceKey>('youtube');
  const [channelUrl, setChannelUrl] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const channelUrlRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const goldPulsed = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear reset timer on unmount
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  // Prefill email from exit modal URL parameter
  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/prefill_email=([^&]+)/);
    if (match) {
      setEmail(decodeURIComponent(match[1]));
      // Clean up the URL
      window.history.replaceState(null, '', '#contact');
    }
  }, []);

  // Gold pulse animation on first contact section view
  useEffect(() => {
    const section = sectionRef.current;
    const input = channelUrlRef.current;
    if (!section || !input) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !goldPulsed.current) {
            goldPulsed.current = true;
            input.classList.add('gold-pulse');
            input.addEventListener(
              'animationend',
              () => {
                input.classList.remove('gold-pulse');
              },
              { once: true }
            );
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const urlValidation = validateYouTubeUrl(channelUrl);
  const config = serviceConfig[service];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(formRef.current!);

    startTransition(async () => {
      const result = await submitLead(formData);
      if (result.success) {
        setSubmitted(true);
        resetTimerRef.current = setTimeout(() => {
          setSubmitted(false);
          setService('youtube');
          setChannelUrl('');
          setName('');
          setEmail('');
          setMessage('');
          resetTimerRef.current = null;
        }, 3000);
      } else {
        setError(result.error || 'Something went wrong.');
      }
    });
  };

  return (
    <section className="contact section" id="contact" ref={sectionRef}>
      <ParallaxBgNumber number="07" />
      <div className="container">
        <RevealOnScroll>
          <p className="section-number"><span>07</span> &mdash; Contact</p>
        </RevealOnScroll>
        <div className="contact-layout">
          <RevealOnScroll>
            <div>
              <h2 className="contact-title">
                Find out what<br />you{"'"}re <em>leaving<br />on the table.</em>
              </h2>
              <p className="contact-sub">
                Free audit. No pitch deck. Just a breakdown of where you are, where you could be, and the gap between the two.
              </p>
              <a href="mailto:hello@hypeon.media" className="contact-email-link">
                Or email us at hello@hypeon.media
              </a>
            </div>
          </RevealOnScroll>
          <RevealOnScroll className="reveal reveal-delay-1">
            <form
              className="contact-form"
              id="contact-form"
              ref={formRef}
              onSubmit={handleSubmit}
            >
              {/* Urgency line */}
              <div className="contact-urgency" id="contact-urgency">
                <span className="urgency-pulse" aria-hidden="true" />
                <span>
                  We take on 3 new audits per week. Currently{' '}
                  <span className="urgency-number">2</span> spots available.
                </span>
              </div>

              {/* Service pills */}
              <div className="form-group">
                <label className="form-label">I{"'"}m interested in</label>
                <input
                  type="hidden"
                  id="service-interest"
                  name="service_interest"
                  value={service}
                />
                <div className="service-pills" id="service-pills">
                  {(['youtube', 'creative', 'products', 'unsure'] as ServiceKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={`service-pill${service === key ? ' active' : ''}`}
                      data-value={key}
                      onClick={() => {
                        setService(key);
                        if (key !== 'youtube') setChannelUrl('');
                      }}
                    >
                      {key === 'youtube'
                        ? 'YouTube Performance'
                        : key === 'creative'
                          ? 'Creative Strategy'
                          : key === 'products'
                            ? 'Digital Products'
                            : 'Not sure yet'}
                    </button>
                  ))}
                </div>
              </div>

              {/* YouTube URL field (conditional) */}
              <div
                className="form-group form-group-prominent"
                id="field-youtube"
                style={{ display: config.showYT ? '' : 'none' }}
              >
                <label className="form-label" htmlFor="channel-url">
                  YouTube Channel URL{' '}
                  <span style={{ color: 'var(--white-30)', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  className="form-input"
                  type="url"
                  id="channel-url"
                  name="channel_url"
                  placeholder="https://youtube.com/@yourchannel"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  ref={channelUrlRef}
                />
                <div
                  className={`form-validation-msg${
                    urlValidation === true ? ' valid' : urlValidation === false ? ' invalid' : ''
                  }`}
                  id="url-validation"
                  aria-live="polite"
                >
                  {urlValidation === true && (
                    <>
                      <span className="check" style={{ color: '#4ade80' }}>
                        &#10003;
                      </span>{' '}
                      Looks good
                    </>
                  )}
                  {urlValidation === false && 'Enter a YouTube URL or @handle'}
                </div>
              </div>

              {/* Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Your name
                </label>
                <input
                  className="form-input"
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Jane Smith"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <input
                  className="form-input"
                  type="email"
                  id="email"
                  name="email"
                  placeholder="jane@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Message */}
              <div className="form-group">
                <label className="form-label" htmlFor="message">
                  Anything specific?{' '}
                  <span style={{ color: 'var(--white-30)', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  className="form-textarea"
                  id="message"
                  name="message"
                  placeholder={placeholders[service]}
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {/* Honeypot */}
              <div
                style={{ position: 'absolute', left: '-9999px' }}
                aria-hidden="true"
              >
                <label htmlFor="honeypot">Leave this empty</label>
                <input
                  type="text"
                  id="honeypot"
                  name="honeypot"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Submit */}
              <button
                className="form-submit magnetic"
                id="form-submit"
                type="submit"
                disabled={isPending}
              >
                <span>
                  {submitted
                    ? "Sent! We'll be in touch."
                    : isPending
                      ? 'Sending...'
                      : config.btn}
                </span>
                <span className="arrow" style={{ position: 'relative', zIndex: 1 }}>
                  &rarr;
                </span>
              </button>

              {error && (
                <p className="form-error" role="alert" style={{ color: '#f87171', marginTop: '0.5rem' }}>
                  {error}
                </p>
              )}

              {/* Friction reducers */}
              <div className="friction-reducers" id="friction-reducers">
                <span>
                  <span className="check">&#10003;</span> No credit card required
                </span>
                <span>
                  <span className="check">&#10003;</span> {config.delivery}
                </span>
                <span>
                  <span className="check">&#10003;</span> No pitch decks, just data
                </span>
              </div>
            </form>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
