'use client';
import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const fullUrl = `https://hypeon.media${url}`;

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`,
      '_blank',
      'noopener,noreferrer,width=550,height=420'
    );
  };

  const shareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`,
      '_blank',
      'noopener,noreferrer,width=550,height=420'
    );
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="share-buttons">
      <button onClick={shareTwitter} className="share-btn" aria-label="Share on X (Twitter)">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </button>
      <button onClick={shareLinkedIn} className="share-btn" aria-label="Share on LinkedIn">
        <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M4.94 2.5A1.94 1.94 0 013 4.44C3 5.5 3.87 6.38 4.94 6.38s1.94-.88 1.94-1.94A1.94 1.94 0 004.94 2.5zM3.25 7.88h3.38V17.5H3.25V7.88zm5.63 0h3.24v1.31h.05a3.55 3.55 0 013.2-1.75c3.42 0 4.05 2.25 4.05 5.18V17.5h-3.38v-3.44c0-1.56-.03-3.56-2.17-3.56-2.17 0-2.5 1.7-2.5 3.44V17.5H8.88V7.88z"/></svg>
      </button>
      <button onClick={copyLink} className="share-btn" aria-label={copied ? 'Link copied!' : 'Copy link'}>
        {copied ? (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        )}
      </button>
    </div>
  );
}
