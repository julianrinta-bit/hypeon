'use client';

import { useRouter } from 'next/navigation';

/* === LegalTabs ===
   Tab switcher for /privacy and /terms pages.
   Active tab: border-bottom 2px solid #c8ff2e (accent green).
   Clicking a tab navigates to the respective route.
*/

interface Props {
  active: 'privacy' | 'terms';
}

export default function LegalTabs({ active }: Props) {
  const router = useRouter();

  return (
    <div className="legal-v2-tabs" role="tablist" aria-label="Legal documents">
      <button
        role="tab"
        aria-selected={active === 'privacy'}
        aria-controls="legal-content"
        className={`legal-v2-tab-btn${active === 'privacy' ? ' active' : ''}`}
        onClick={() => router.push('/privacy')}
      >
        Privacy Policy
      </button>
      <button
        role="tab"
        aria-selected={active === 'terms'}
        aria-controls="legal-content"
        className={`legal-v2-tab-btn${active === 'terms' ? ' active' : ''}`}
        onClick={() => router.push('/terms')}
      >
        Terms of Service
      </button>
    </div>
  );
}
