# Phase 1 Research — Landing Page + Deploy

**Date:** 2026-03-21
**Scope:** LAND-01 through LAND-11, INFRA-01 through INFRA-06 (17 requirements)
**Plans:** 1.1 (Scaffold + Infra), 1.2 (Sections + Animations), 1.3 (Form + Polish + Ship)

---

## 1. Next.js 16 App Router Scaffold

### Initialization

```bash
npx create-next-app@latest hypeon-website \
  --typescript \
  --app \
  --src-dir \
  --no-tailwind \
  --no-import-alias \
  --turbopack
```

This generates the App Router structure with `src/app/`. We already have the repo, so the alternative is manual init:

```bash
npm init -y
npm install next@16.2 react@latest react-dom@latest sharp
npm install -D typescript @types/react @types/react-dom @types/node eslint eslint-config-next
npx next telemetry disable
```

### next.config.ts (Phase 1 minimal)

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // No output: 'standalone' — run next start from repo dir via PM2
  // No output: 'export' — need server for SSR (portal in Phase 3)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
};

export default nextConfig;
```

### Key files to create first

```
src/app/layout.tsx      -- Root layout: fonts, metadata, body wrapper, noise overlay, cursor
src/app/page.tsx        -- Landing page: composes all section components
src/app/globals.css     -- Full maquette CSS (lines 32-2767 from index.html)
```

### Font loading (Next.js way)

The maquette uses Google Fonts via `<link>` tags. In Next.js, use `next/font` for self-hosting and no layout shift:

```tsx
import { Plus_Jakarta_Sans } from 'next/font/google';
import localFont from 'next/font/local';

// Plus Jakarta Sans — display font
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

// IBM Plex Mono — mono font
// Outfit — body font (from Fontshare, not Google Fonts)
```

**Gotcha:** Outfit is from Fontshare (api.fontshare.com), not Google Fonts. `next/font/google` does not support it. Two options:
1. Download Outfit woff2 files and use `next/font/local` (preferred — zero external requests).
2. Keep the Fontshare `<link>` in layout.tsx `<head>` (works but adds a render-blocking request).

IBM Plex Mono is on Google Fonts, so `next/font/google` works for it.

### Root metadata (replaces `<head>` meta tags)

```tsx
// src/app/layout.tsx
export const metadata: Metadata = {
  title: 'Hype On Media — YouTube. Engineered.',
  description: '5B+ organic views. $4M+/month revenue built. 50+ channels scaled across 15 languages.',
  metadataBase: new URL('https://hypeon.media'),
  openGraph: {
    title: 'Hype On Media — YouTube. Engineered.',
    description: '5B+ organic views. $4M+/month revenue built. 50+ channels scaled.',
    type: 'website',
    url: 'https://hypeon.media',
    images: ['/og-image.jpg'],
  },
  twitter: { card: 'summary_large_image' },
  themeColor: '#09090b',
  icons: { icon: '/favicon.svg' },
};
```

---

## 2. Splitting the Monolithic HTML into React Components

### Section inventory (from maquette lines 2769-3558)

The maquette has 14 distinct sections plus layout chrome. Here is the component mapping with Server/Client classification:

| # | Section | Maquette lines | Component | Server/Client | Why |
|---|---------|---------------|-----------|---------------|-----|
| - | Skip link | 2772 | layout.tsx | Server | Static HTML |
| - | Scroll progress | 2775 | `ScrollProgress.tsx` | **Client** | scroll event listener |
| - | Noise overlay | 2778 | layout.tsx | Server | Pure CSS, no JS |
| - | Custom cursor | 2781 | `CustomCursor.tsx` | **Client** | mousemove + rAF loop |
| - | Nav | 2784-2799 | `Nav.tsx` | Server | Static links, anchor hrefs |
| - | Mobile menu | 2802-2809 | `MobileMenu.tsx` | **Client** | open/close state, body overflow |
| 1 | Hero | 2813-2862 | `Hero.tsx` (Server wrapper) + `RotatingText.tsx` (Client child) | Mixed | Static markup + rotating text interval |
| - | Ticker | 2865-2884 | `Ticker.tsx` | Server | Pure CSS animation (`tickerScroll` keyframe) |
| - | Trust strip | 2887-2889 | `TrustStrip.tsx` | Server | Static text |
| - | Credibility strip | 2892-2902 | `CredibilityStrip.tsx` | Server | Static text |
| - | Showreel | 2905-2920 | `Showreel.tsx` | Server | iframe with `loading="lazy"`, no JS |
| 2 | Proof/Analytics | 2923-3069 | `AnalyticsDashboard.tsx` | **Client** | IntersectionObserver, count-ups, dynamic element generation, 6 sub-animations |
| - | Dividers | 3071 etc. | `Divider.tsx` | Server (wrapped by RevealOnScroll) | CSS animation triggered by `.visible` class |
| 3 | Services | 3074-3143 | `Services.tsx` | **Client** | Accordion open/close state, maxHeight |
| - | Process | 3148-3219 | `Process.tsx` | Server (wrapped by stagger-reveal) | Static markup, animations via CSS `.visible` class |
| 4 | Work | 3224-3256 | `Work.tsx` | Server (wrapped by stagger-reveal) | Static cards |
| - | Testimonials | 3261-3284 | `Testimonials.tsx` | Server (wrapped by stagger-reveal) | Static cards |
| 5 | Different | 3289-3325 | `Different.tsx` | Server | Static two-column layout |
| 6 | About | 3330-3367 | `About.tsx` | Server | Static two-column layout |
| - | FAQ | 3372-3470 | `FAQ.tsx` | **Client** | Accordion open/close state |
| 7 | Contact | 3475-3533 | `ContactForm.tsx` | **Client** | Form state, pills, validation, conditional fields |
| - | Footer | 3537-3558 | `Footer.tsx` | Server | Static |
| - | Sticky mobile CTA | 3561-3565 | `StickyMobileCTA.tsx` | **Client** | IntersectionObserver on hero, dismiss state |
| - | Exit intent modal | 3568-3579 | `ExitIntentModal.tsx` | **Client** | mouseout event, sessionStorage, form |
| - | Inline CTAs | scattered | Part of parent section | Server | Static `<a>` links |

### Component count

- **Server Components:** 12 (Nav, Ticker, TrustStrip, CredibilityStrip, Showreel, Process, Work, Testimonials, Different, About, Footer, Hero wrapper)
- **Client Components:** 10 (ScrollProgress, CustomCursor, MobileMenu, RotatingText, AnalyticsDashboard, Services, FAQ, ContactForm, StickyMobileCTA, ExitIntentModal)
- **Shared UI (Client):** 2 (RevealOnScroll wrapper, MagneticButton)

### The page composition pattern

```tsx
// src/app/page.tsx — Server Component
import Hero from '@/components/landing/Hero';
import Ticker from '@/components/landing/Ticker';
// ... etc

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Ticker />
      <TrustStrip />
      <CredibilityStrip />
      <Showreel />
      <AnalyticsDashboard />
      <Divider />
      <Services />
      {/* ... all 14 sections */}
      <Footer />
      <StickyMobileCTA />
      <ExitIntentModal />
    </>
  );
}
```

`page.tsx` stays a Server Component. Client interactivity is pushed to leaf components. This maximizes static HTML and minimizes JS bundle.

### RevealOnScroll — reusable wrapper

Many Server Components need scroll-triggered `.visible` class addition. Instead of making each one a Client Component, create a thin wrapper:

```tsx
// src/components/ui/RevealOnScroll.tsx
'use client';
import { useRef, useEffect, useState, type ReactNode } from 'react';

export default function RevealOnScroll({
  children,
  className = 'reveal',
  threshold = 0.15,
  stagger = false,
}: {
  children: ReactNode;
  className?: string;
  threshold?: number;
  stagger?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  const base = stagger ? 'stagger-reveal' : className;
  return (
    <div ref={ref} className={`${base}${visible ? ' visible' : ''}`}>
      {children}
    </div>
  );
}
```

This lets static sections stay as Server Components while getting scroll-reveal behavior through a Client wrapper.

---

## 3. Animation Systems: Server vs Client Classification

### The 12 animation systems

| # | Animation | Needs `'use client'`? | Reason | Migration approach |
|---|-----------|----------------------|--------|-------------------|
| 1 | Scroll progress bar | **Yes** | `window.addEventListener('scroll')` | Dedicated `ScrollProgress.tsx` with useEffect + passive scroll listener |
| 2 | Rotating headline | **Yes** | `setInterval` + DOM manipulation | `RotatingText.tsx` with useEffect + cleanup `clearInterval` |
| 3 | Service accordion | **Yes** | Click handler + `useState` for active item | `Services.tsx` Client Component |
| 4 | Scroll reveal (fade-in) | **Yes** | IntersectionObserver | `RevealOnScroll.tsx` wrapper (reusable) |
| 5 | Analytics dashboard | **Yes** | IntersectionObserver + count-ups + dynamic elements + rAF | `AnalyticsDashboard.tsx` single Client Component |
| 6 | Custom cursor | **Yes** | mousemove + rAF loop | `CustomCursor.tsx` with useEffect + cleanup |
| 7 | Magnetic buttons | **Yes** | mousemove on element | `MagneticButton.tsx` with onMouseMove prop |
| 8 | Parallax bg numbers | **Yes** | rAF continuous loop | `ParallaxBgNumber.tsx` with useEffect + cleanup |
| 9 | FAQ accordion | **Yes** | Click handler + `useState` | `FAQ.tsx` Client Component |
| 10 | Exit intent modal | **Yes** | mouseout event + sessionStorage | `ExitIntentModal.tsx` Client Component |
| 11 | Sticky mobile CTA | **Yes** | IntersectionObserver on hero | `StickyMobileCTA.tsx` Client Component |
| 12 | Gold pulse on contact | **Yes** | IntersectionObserver (once) + CSS animation class | Part of `ContactForm.tsx` |

### What stays server-side (CSS-only animations, no JS)

These animations use pure CSS keyframes and do NOT need `'use client'`:

- **Ticker scroll** (`@keyframes tickerScroll`) — CSS `animation: tickerScroll 30s linear infinite`
- **Hero fadeUp entries** (`@keyframes fadeUp`) — CSS `animation: fadeUp ...` on hero elements
- **Scroll line indicator** (`@keyframes scrollDown`) — CSS animation on `.scroll-line::after`
- **Urgency pulse** (`@keyframes urgencyPulse`) — CSS animation
- **Badge pulse** (`@keyframes badgePulse`) — CSS animation
- **Divider draw-on** — CSS transition triggered by `.visible` class (needs RevealOnScroll wrapper, but the animation itself is CSS)
- **Analytics card top border** — CSS transition triggered by `.visible` on parent grid
- **Hover effects** (nav links, buttons, cards) — all CSS `:hover` transitions

### Key: CSS animations stay in globals.css, JS triggers move to useEffect

The maquette's CSS already handles all visual transitions. The JS only adds/removes classes or sets inline styles. In React:
- CSS stays in `globals.css` unchanged
- `document.querySelector` becomes `useRef`
- `el.classList.add('visible')` becomes `className={visible ? 'visible' : ''}`
- `el.style.height = ...` becomes `style={{ height: ... }}`

### prefers-reduced-motion (LAND-10)

The maquette already has comprehensive `@media (prefers-reduced-motion: reduce)` rules in CSS (lines 1785-1800, 2188-2221). These stay in globals.css. For JS-controlled animations, add a `useReducedMotion` hook:

```tsx
// src/hooks/useReducedMotion.ts
'use client';
import { useState, useEffect } from 'react';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}
```

Every animation Client Component checks this and either skips the animation or shows the final state.

---

## 4. PM2 + nginx Setup Alongside Orbit

### Current server state

- Orbit runs on port 3000 via PM2 process `orbit-main` (or similar)
- Orbit lab runs on port 3201 via PM2 process `orbit-lab-sender`
- nginx has server blocks for Orbit's domain(s)
- Server: DigitalOcean droplet at 167.172.246.198, Ubuntu

### Hype On deployment

**Directory:** `/opt/hypeon-website` (same pattern as `/opt/orbit`)

**PM2 ecosystem config:**

```js
// ecosystem.config.js (at repo root)
module.exports = {
  apps: [{
    name: 'hypeon-website',
    cwd: '/opt/hypeon-website',
    script: 'node_modules/.bin/next',
    args: 'start -p 3100',
    env: {
      NODE_ENV: 'production',
      NEXT_TELEMETRY_DISABLED: '1',
    },
    // Env vars with secrets loaded from .env.local by Next.js automatically
    // Do NOT put SUPABASE_SERVICE_ROLE_KEY here
  }],
};
```

**nginx server block** (`/etc/nginx/sites-available/hypeon.media`):

```nginx
server {
    listen 80;
    server_name hypeon.media www.hypeon.media;

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**SSL setup:**

```bash
sudo ln -s /etc/nginx/sites-available/hypeon.media /etc/nginx/sites-enabled/
sudo nginx -t                    # ALWAYS test before reload
sudo nginx -s reload
sudo certbot --nginx -d hypeon.media -d www.hypeon.media
```

Certbot will modify the nginx config to add the SSL block. Verify renewal: `sudo certbot renew --dry-run`.

### Deployment script

```bash
#!/bin/bash
# deploy.sh — run on the server
set -e
cd /opt/hypeon-website
git pull origin main
npm ci
npm run build
pm2 reload hypeon-website --update-env
echo "Deploy complete. Testing..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3100 | grep -q "200" && echo "OK" || echo "FAIL"
```

### Safety protocol (INFRA-04)

1. `nginx -t` before every `nginx -s reload`
2. After any nginx change, verify Orbit: `curl -s http://localhost:3000` (or Orbit's domain)
3. Use `pm2 reload` (graceful, zero-downtime) not `pm2 restart`
4. Run `pm2 startup` + `pm2 save` so both apps survive server reboots
5. Hype On and Orbit have completely separate: directory, PM2 process, port, nginx server block, SSL cert

### Node.js version check

Orbit may pin a different Node version. Check with `ssh alpha "node -v"`. If Orbit uses Node 22.x and Hype On needs 24.x, use nvm:

```bash
# In ecosystem.config.js
interpreter: '/home/deploy/.nvm/versions/node/v24.x.x/bin/node',
```

Or set nvm alias in the deploy script. This is a potential gotcha to verify during Plan 1.1.

### DNS (domain transfer)

hypeon.media is currently on Tilda/Namecheap. To point to DigitalOcean:
1. In Namecheap DNS, set A record: `@` -> `167.172.246.198`
2. Set A record: `www` -> `167.172.246.198`
3. TTL: 300 (5 min) during migration, raise to 3600 after verified
4. DNS propagation takes up to 48 hours (usually 15-30 min)

**Important:** Do this AFTER nginx + SSL are ready. While DNS propagates, the old Tilda site still shows for some users.

---

## 5. Supabase Form Integration with Server Actions

### Schema (Phase 1 only needs `leads` table)

```sql
CREATE TABLE leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service_interest text NOT NULL CHECK (service_interest IN ('youtube', 'creative', 'products', 'unsure')),
  channel_url text,
  name text NOT NULL,
  email text NOT NULL,
  message text,
  created_at timestamptz DEFAULT now(),
  -- Anti-spam
  honeypot text,  -- must be empty
  ip_address inet
);

-- No RLS needed — leads table is write-only from the public
-- Use service role key server-side for inserts
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- No SELECT policy = no one can read via anon key
-- INSERT via server action uses service role key
```

### Server Action pattern

```tsx
// src/lib/actions/leads.ts
'use server';

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Server-only, NOT NEXT_PUBLIC_
);

const LeadSchema = z.object({
  service_interest: z.enum(['youtube', 'creative', 'products', 'unsure']),
  channel_url: z.string().url().optional().or(z.literal('')),
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  message: z.string().max(2000).optional(),
  honeypot: z.string().max(0),  // Must be empty
});

export async function submitLead(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = LeadSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: 'Validation failed' };
  }

  // Honeypot check
  if (parsed.data.honeypot) {
    return { success: true };  // Fake success for bots
  }

  const { error } = await supabase.from('leads').insert({
    service_interest: parsed.data.service_interest,
    channel_url: parsed.data.channel_url || null,
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message || null,
  });

  if (error) {
    console.error('Lead insert error:', error);
    return { success: false, error: 'Something went wrong' };
  }

  return { success: true };
}
```

### Client-side form integration with react-hook-form

```tsx
// In ContactForm.tsx ('use client')
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { submitLead } from '@/lib/actions/leads';

// Use useTransition for pending state during server action call
const [isPending, startTransition] = useTransition();

async function onSubmit(data: FormValues) {
  const formData = new FormData();
  Object.entries(data).forEach(([k, v]) => formData.append(k, v));

  startTransition(async () => {
    const result = await submitLead(formData);
    if (result.success) {
      // Show success state
    }
  });
}
```

### Rate limiting

Server Actions run in the Next.js server process. For IP-based rate limiting without Redis:

Option A: In-memory Map (sufficient for Phase 1, resets on PM2 reload):
```tsx
const ipCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + 3600_000 }); // 1 hour window
    return true;
  }
  if (entry.count >= 3) return false;  // Max 3 per hour
  entry.count++;
  return true;
}
```

Option B: nginx rate limiting (simpler, more robust):
```nginx
limit_req_zone $binary_remote_addr zone=leads:10m rate=3r/h;

location /api/ {
    limit_req zone=leads burst=2;
    proxy_pass http://127.0.0.1:3100;
    # ... headers
}
```

### Environment variables

```
# .env.local (not in git)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...      # Safe to expose — RLS enforces access
SUPABASE_SERVICE_ROLE_KEY=eyJ...           # Server-only — bypasses RLS

# .env.example (in git, placeholder values)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 6. Stack-Specific Gotchas

### Next.js 16.2 + React 19

**Gotcha 1: Next.js 16.2 is 3 days old.** Pin exact version in package.json (`"next": "16.2.0"` not `"^16.2.0"`). If a bug surfaces, check the Next.js GitHub issues before debugging locally.

**Gotcha 2: React 19 Server Components are the default.** Any file without `'use client'` is a Server Component. Importing `useState`, `useEffect`, `useRef`, or any hook in a Server Component crashes the build with a clear error. BUT: importing a Client Component into a Server Component is fine — Next.js handles the boundary.

**Gotcha 3: `useFormStatus` hook (React 19).** For the submit button pending state, React 19 has `useFormStatus` which works with `<form action={serverAction}>`. This is an alternative to `useTransition` + manual `startTransition`. Either pattern works.

**Gotcha 4: Turbopack in dev, webpack in prod.** `next dev --turbo` uses Turbopack (fast). `next build` uses webpack. If something works in dev but breaks in build, this is likely why. Always run `next build` locally before deploying.

### motion 12 (formerly framer-motion)

**Gotcha 5: Import from `motion/react`, not `framer-motion`.** The package is `motion` on npm, import path is `motion/react`.

**Gotcha 6: Every motion component needs `'use client'`.** motion components use hooks internally. Any component that imports from `motion/react` must be a Client Component.

**Gotcha 7: We may not need motion for Phase 1.** The maquette achieves all animations with CSS transitions + vanilla JS. The research decided motion is "available for complex orchestration if needed" but vanilla CSS + useEffect may be sufficient. This avoids adding 35KB+ to the bundle. Decision point: try CSS + useEffect first. If magnetic cursor or parallax feels janky, add motion for those specific components.

### Hydration

**Gotcha 8: HTML entities in maquette.** The maquette uses `&mdash;`, `&ldquo;`, `&rarr;` etc. In JSX, use the Unicode characters directly: `—`, `"`, `→`. Or use `{'\u2014'}` etc.

**Gotcha 9: `class` -> `className`, `for` -> `htmlFor`.** Every HTML attribute must be converted. Also: `frameborder` -> `frameBorder`, `allowfullscreen` -> `allowFullScreen`, `tabindex` -> `tabIndex`, `viewbox` -> `viewBox` (already correct in maquette SVGs).

**Gotcha 10: Inline styles.** The maquette has some inline `style="..."` attributes (e.g., process subtitle, service-expand initial maxHeight). In JSX: `style={{ color: 'var(--white-60)', fontSize: '1rem' }}`. camelCase properties.

**Gotcha 11: `aria-hidden="true"` works as-is in JSX.** Boolean HTML attributes like `aria-hidden`, `aria-expanded` are strings in JSX (which is correct for ARIA).

### CSS

**Gotcha 12: globals.css import order matters.** In `layout.tsx`, `import './globals.css'` must come before component imports. Next.js processes CSS imports in order. If a component has its own CSS Module (Phase 2+), it will override globals.css due to later insertion.

**Gotcha 13: `:has()` selector used in maquette.** Line 650: `.container:has(> .divider)`. This is supported in all modern browsers (2024+). No polyfill needed.

**Gotcha 14: CSS custom properties work across Server/Client boundary.** `:root` variables defined in globals.css are available to all components regardless of rendering strategy. No special handling needed.

### Self-hosted deployment

**Gotcha 15: sharp must be installed as production dependency.** Without it, `next start` falls back to `squoosh` for image optimization (10x slower). Verify after deploy: `node -e "require('sharp')"` should not error.

**Gotcha 16: `next build` is slow on 1GB RAM droplets.** The DigitalOcean server may need a swap file if builds OOM. Check with `free -h`. If RAM < 2GB, add 2GB swap:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
```

**Gotcha 17: `.env.local` is NOT read by `next build` on the server if running as a different user.** Ensure the `.env.local` file is in the project root (`/opt/hypeon-website/.env.local`) and readable by the PM2 process user.

---

## 7. Maquette Analysis — Migration Complexity by Section

### Straightforward migrations (copy HTML, convert to JSX, done)

These sections are static HTML with no JS behavior. Copy markup, convert attributes, wrap in a component:

- **Ticker** (lines 2865-2884) — CSS-only animation. Duplicate `ticker-content` div for seamless loop.
- **Trust strip** (lines 2887-2889) — One line of text.
- **Credibility strip** (lines 2892-2902) — Spans with separator elements.
- **Showreel** (lines 2905-2920) — iframe with `loading="lazy"`.
- **Process** (lines 3148-3219) — 6 steps, static markup. Only needs RevealOnScroll wrapper.
- **Work** (lines 3224-3256) — 4 cards, static markup. Only needs stagger-reveal wrapper.
- **Testimonials** (lines 3261-3284) — 3 cards, static markup.
- **Different** (lines 3289-3325) — Two-column layout, static.
- **About** (lines 3330-3367) — Two-column layout, static.
- **Footer** (lines 3537-3558) — Static with SVG icons.

**Effort estimate:** Low. ~30 min per section.

### Medium complexity (state management, event handlers)

- **Nav + MobileMenu** — Hamburger toggle, body overflow lock, aria-expanded. Two components: Nav (Server) + MobileMenu (Client).
- **Hero + RotatingText** — Hero is Server Component (static markup). RotatingText is Client (setInterval, transition manipulation). The `rotating-wrapper::after` content trick for width reservation is pure CSS.
- **Services accordion** — Click toggles active state, maxHeight animation. Single Client Component.
- **FAQ accordion** — Same pattern as Services. Single Client Component.
- **StickyMobileCTA** — IntersectionObserver on hero, dismiss button. Small Client Component.

**Effort estimate:** Medium. ~1-2 hours per section.

### High complexity (the risk items)

- **AnalyticsDashboard** — The hardest migration. 6 sub-animations orchestrated by one IntersectionObserver. Dynamically generates 54 dots, 20 play button SVGs, 15 language segments. Count-up animation with rAF. Multiple `setTimeout` cascades for staggered reveals. All in one Client Component. ~200 lines of JS in the maquette (lines 3669-3827).

- **ContactForm** — Form with pills (service selection), conditional YouTube URL field visibility, CTA text changes per selection, placeholder text changes, YouTube URL validation, gold pulse animation on first view, honeypot field, server action integration. The CRO logic (lines 3935-3967, 3970-4011) is tightly coupled.

- **CustomCursor** — rAF loop with lerp interpolation. Hover state changes for interactive elements. Must detect all `a`, `button`, `.service-item`, `.work-card` elements. In React, this means either a global event listener or passing hover state down.

- **ExitIntentModal** — mouseout detection, sessionStorage check, form that copies value to main form and scrolls to contact section. Cross-component communication (exit form -> contact form).

**Effort estimate:** High. 2-4 hours per section. AnalyticsDashboard is the single riskiest item.

---

## 8. CSS Migration Strategy

### globals.css construction

Extract lines 32-2767 from `index.html` (everything inside `<style>...</style>`). This becomes `src/app/globals.css` verbatim. Do NOT refactor, rename, or reorganize the CSS during Phase 1.

**Exception:** Remove the `<style>` in `<head>` for the skip link (line 22) and merge it into globals.css at the top.

### What to verify after CSS extraction

1. All `@keyframes` declarations are present (fadeUp, scrollDown, tickerScroll, drawSparkline, urgencyPulse, badgePulse, goldPulse)
2. All `@media` queries are present and in the correct order (specificity matters)
3. `prefers-reduced-motion` rules are at the end (lines 1785-1800, 2188-2221)
4. No duplicate selectors (the maquette has some intentional overrides, e.g., `.divider` is defined twice — lines 644-648 and 1740-1749)
5. The SVG data URI in `.noise` (line 1730) is preserved correctly

### Responsive breakpoints documented

| Breakpoint | Elements affected |
|-----------|------------------|
| `max-width: 1024px` | Contact layout goes single column |
| `max-width: 768px` | Hero grid -> single column, nav links hidden, hamburger shown, analytics grid -> single column, work grid -> single column, testimonials -> single column, different/about layouts -> single column, section-bg-numbers hidden, section padding reduced |
| `max-width: 480px` | Service pills smaller, footer right alignment left, analytics grid single column (redundant with 768px) |
| `pointer: coarse` | Custom cursor hidden |

---

## 9. Execution Order for Plan 1.1, 1.2, 1.3

### Plan 1.1: Scaffold + Infra (covers INFRA-01 through INFRA-06)

1. Initialize Next.js project with TypeScript
2. Create `next.config.ts` (minimal)
3. Create `ecosystem.config.js` for PM2
4. Extract globals.css from maquette
5. Create `layout.tsx` with fonts + metadata + noise overlay
6. Create empty `page.tsx` with just "Hello World"
7. Push to server, `npm ci && npm run build && pm2 start ecosystem.config.js`
8. Create nginx server block, `nginx -t && nginx -s reload`
9. Verify: `curl http://localhost:3100` returns the page
10. Verify Orbit still works
11. Set up `.env.local` with Supabase credentials
12. Create `leads` table in Supabase
13. Set up SSL with certbot (after DNS points to server)

**Ship gate:** Empty Next.js app running on server via PM2, accessible via nginx.

### Plan 1.2: Sections + Animations (covers LAND-01, LAND-02, LAND-06, LAND-07, LAND-10)

1. Migrate static sections first (Ticker, TrustStrip, CredibilityStrip, Showreel, Process, Work, Testimonials, Different, About, Footer)
2. Create RevealOnScroll wrapper
3. Migrate Nav + MobileMenu
4. Migrate Hero + RotatingText
5. Migrate Services accordion
6. Migrate FAQ accordion
7. Migrate AnalyticsDashboard (highest risk — budget 3-4 hours)
8. Migrate CustomCursor
9. Create MagneticButton wrapper
10. Migrate ParallaxBgNumber (if keeping, or simplify)
11. Migrate ScrollProgress
12. Migrate StickyMobileCTA
13. Test prefers-reduced-motion on every animated component

**Ship gate:** All 14 sections render correctly with animations. Responsive at 480/768/1024.

### Plan 1.3: Form + Polish + Ship (covers LAND-03, LAND-04, LAND-05, LAND-08, LAND-09, LAND-11)

1. Migrate ContactForm with pills, conditional fields, validation
2. Integrate Server Action for Supabase leads insert
3. Add honeypot field + rate limiting
4. Migrate ExitIntentModal with cross-form communication
5. OG tags verification (curl + social debuggers)
6. Responsive QA at all breakpoints
7. WCAG AA: contrast audit, focus states, skip link, aria labels
8. DNS switch (A records to DigitalOcean)
9. SSL cert via certbot
10. Final deploy + Orbit verification

**Ship gate:** Site live at hypeon.media with working form, all CRO elements, passing accessibility checks.

---

## 10. Open Questions to Resolve at Build Time

1. **Node.js version on server.** Is Orbit pinned to an older version? If so, nvm is required.
2. **Server RAM.** Is swap configured? `next build` can OOM on 1GB.
3. **Outfit font.** Download woff2 for `next/font/local` or keep Fontshare link?
4. **motion library.** Try CSS + useEffect first. Only add motion if magnetic cursor or parallax is janky without it.
5. **Parallax bg numbers.** The maquette runs a continuous rAF loop for parallax on section numbers. On mobile these are hidden. Consider simplifying to a CSS-only parallax (`transform: translateZ`) or removing the rAF loop entirely — the visual impact is subtle.
6. **Exit modal -> contact form communication.** The maquette copies the email from exit form to the main form's channel URL field. In React, this needs shared state (context, or ref lifting). Design the state flow before building.
7. **YouTube embed privacy.** Currently loads from `youtube.com`. Consider `youtube-nocookie.com` for GDPR compliance. Low effort change.

---

*Research complete. This document informs Plan 1.1, 1.2, and 1.3 implementation. Versions and patterns verified against maquette source (4133 lines) and project planning docs.*
