# Architecture Research — Hype On Media Website Platform

Research dimension for PROJECT.md. Covers component boundaries, data flow, build order, file structure, and animation migration strategy.

---

## 1. Component Boundaries

The platform has three distinct capabilities that share infrastructure but differ in rendering strategy and authentication requirements.

### A. Marketing Landing Page (SSG, public)

Static at build time. No auth. No client-side data fetching except form submission.

```
Landing Page
  ├── Layout Shell (Nav, Footer, CustomCursor, ScrollProgress)
  ├── Hero (rotating text, CTA)
  ├── Ticker (infinite scroll marquee)
  ├── Showreel (YouTube embed, lazy)
  ├── Proof / Analytics Dashboard (sparklines, count-ups, dot grid, bar chart, segments)
  ├── Services (accordion)
  ├── Process (timeline/steps)
  ├── Work / Case Studies (cards)
  ├── Testimonials (carousel or grid)
  ├── Different (value props)
  ├── About (team/agency)
  ├── FAQ (accordion)
  ├── Contact Form (service pills, conditional fields, validation, exit intent modal)
  ├── Sticky Mobile CTA
  └── Exit Intent Modal (desktop)
```

**What talks to what:**
- Contact form --> Supabase `leads` table (server action or API route)
- Exit intent modal --> copies value into contact form (client-side only)
- Service pills --> toggle conditional fields + CTA text (client-side only)
- All scroll/reveal animations --> IntersectionObserver (client-side only)

### B. Blog (SSG via MDX, public)

Statically generated at build time from MDX files in the repo. No runtime data fetching.

```
Blog
  ├── /blog (index — list of posts with metadata)
  └── /blog/[slug] (individual post, rendered from MDX)
```

**What talks to what:**
- MDX files on disk --> Next.js build process (contentlayer or next-mdx-remote)
- Blog layout --> shared Layout Shell (Nav, Footer)
- OG image generation --> Next.js ImageResponse API (build-time or on-demand)

### C. Client Portal (SSR, authenticated)

Server-rendered on each request. Behind Supabase Auth. Dashboard data fetched server-side.

```
Portal
  ├── /portal/login (magic link or email/password)
  ├── /portal (dashboard — deliverables, metrics, timeline, comms)
  └── /portal/[section] (if needed later)
```

**What talks to what:**
- Supabase Auth --> middleware checks session cookie on every /portal/* request
- Dashboard server components --> Supabase DB (deliverables, metrics, messages tables)
- Communication thread --> Supabase table + potential real-time subscription (async, not live chat per scope)

---

## 2. Data Flow

### Form Submission (Landing Page)

```
User fills form
  --> Client Component validates (YouTube URL, required fields)
  --> Submit calls Server Action (or POST to /api/leads)
  --> Server Action inserts into Supabase `leads` table
  --> Returns success/error
  --> Client shows confirmation state
```

No email sending from the app initially. Julian checks Supabase directly or sets up a Supabase webhook/trigger later.

### Blog Content

```
MDX files in /content/blog/
  --> Build step reads frontmatter + body
  --> generateStaticParams() produces all slugs
  --> Each page is pre-rendered as static HTML
  --> Served as static files by Next.js (via PM2)
```

### Client Portal

```
User visits /portal/*
  --> Next.js middleware reads Supabase session cookie
  --> No session? Redirect to /portal/login
  --> Has session? Server Component fetches:
      - deliverables (from `deliverables` table, filtered by client_id)
      - metrics (from `channel_metrics` table)
      - messages (from `messages` table)
  --> Renders dashboard HTML server-side
  --> Ships to client (minimal JS for interactions)
```

### Authentication

```
/portal/login
  --> User enters email (magic link) or email+password
  --> Supabase Auth handles verification
  --> Sets httpOnly cookie via @supabase/ssr
  --> Redirect to /portal

Middleware (middleware.ts)
  --> Runs on /portal/* routes
  --> Refreshes session if needed
  --> Redirects to /portal/login if no valid session
```

---

## 3. Suggested Build Order

Dependencies flow downward. Each phase produces a deployable increment.

### Phase 1: Foundation + Landing Page (days 1-3)

```
1a. Project scaffold
    - next.js app, globals.css (full maquette CSS), layout.tsx, fonts
    - PM2 ecosystem config, nginx server block
    - Deploy empty shell to confirm infra works

1b. Layout Shell
    - Nav (Server Component, anchor links)
    - Footer (Server Component)
    - ScrollProgress (Client Component — scroll listener)
    - CustomCursor (Client Component — mousemove listener)
    Dependencies: 1a

1c. Static sections (no animations yet)
    - Hero, Ticker, Showreel, Services, Process, Work,
      Testimonials, Different, About, FAQ
    - All as Server Components with static HTML
    Dependencies: 1b

1d. Interactive sections (Client Components)
    - AnalyticsDashboard (count-ups, sparklines, animations)
    - ServiceAccordion, FAQAccordion
    - RotatingText
    - MagneticButton
    - ParallaxBgNumber
    - RevealOnScroll (IntersectionObserver wrapper)
    - StickyMobileCTA
    Dependencies: 1c

1e. Contact Form + Supabase
    - ContactForm Client Component (pills, validation, conditional fields)
    - ExitIntentModal Client Component
    - Server Action for lead submission
    - Supabase `leads` table schema
    Dependencies: 1d

1f. Deploy Phase 1
    - DNS change (hypeon.media --> DigitalOcean)
    - SSL cert via certbot
    - nginx config finalized
    Dependencies: 1e
```

### Phase 2: Blog (days 4-5)

```
2a. MDX pipeline
    - Choose: next-mdx-remote (simpler) or contentlayer (richer)
    - /content/blog/ directory with frontmatter schema
    - generateStaticParams, generateMetadata
    Dependencies: Phase 1

2b. Blog pages
    - /blog index page (card grid)
    - /blog/[slug] layout (prose styling, reading time, TOC)
    - OG image generation
    Dependencies: 2a

2c. SEO hardening
    - sitemap.ts, robots.ts
    - JSON-LD structured data for articles
    - RSS feed (optional, low effort)
    Dependencies: 2b
```

### Phase 3: Client Portal (days 6-8)

```
3a. Auth setup
    - @supabase/ssr configuration
    - middleware.ts for /portal/* protection
    - /portal/login page
    Dependencies: Phase 1

3b. Database schema
    - clients, deliverables, channel_metrics, messages tables
    - RLS policies (client sees only their data)
    Dependencies: 3a

3c. Dashboard
    - /portal page with data fetching
    - Deliverables list, metrics display, timeline, message thread
    Dependencies: 3b
```

---

## 4. File/Folder Structure

```
hypeon-website/
├── .planning/                    # Planning docs (not deployed)
├── content/
│   └── blog/                     # MDX files
│       ├── youtube-revenue-guide.mdx
│       └── ...
├── public/
│   ├── fonts/                    # Self-hosted if needed
│   ├── og-image.jpg
│   └── ...
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout: fonts, metadata, body wrapper
│   │   ├── globals.css           # Full maquette CSS (monolith, per tech decision)
│   │   ├── page.tsx              # Landing page (composes all sections)
│   │   ├── blog/
│   │   │   ├── page.tsx          # Blog index
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Blog post
│   │   ├── portal/
│   │   │   ├── login/
│   │   │   │   └── page.tsx      # Login page
│   │   │   ├── layout.tsx        # Portal layout (sidebar? topbar?)
│   │   │   └── page.tsx          # Dashboard
│   │   ├── api/
│   │   │   └── leads/
│   │   │       └── route.ts      # Alternative to server action if needed
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Nav.tsx           # Server Component
│   │   │   ├── Footer.tsx        # Server Component
│   │   │   ├── ScrollProgress.tsx # Client Component
│   │   │   └── CustomCursor.tsx  # Client Component
│   │   ├── landing/
│   │   │   ├── Hero.tsx          # Server Component (wrapper) + RotatingText (Client)
│   │   │   ├── Ticker.tsx        # CSS animation only, Server Component
│   │   │   ├── Showreel.tsx      # Client Component (lazy YouTube embed)
│   │   │   ├── AnalyticsDashboard.tsx  # Client Component (heavy animations)
│   │   │   ├── Services.tsx      # Client Component (accordion)
│   │   │   ├── Process.tsx       # Server Component
│   │   │   ├── Work.tsx          # Server Component
│   │   │   ├── Testimonials.tsx  # Server Component
│   │   │   ├── Different.tsx     # Server Component
│   │   │   ├── About.tsx         # Server Component
│   │   │   ├── FAQ.tsx           # Client Component (accordion)
│   │   │   ├── ContactForm.tsx   # Client Component
│   │   │   ├── ExitIntentModal.tsx # Client Component
│   │   │   └── StickyMobileCTA.tsx # Client Component
│   │   ├── ui/
│   │   │   ├── MagneticButton.tsx    # Client Component
│   │   │   ├── RevealOnScroll.tsx    # Client Component (IntersectionObserver)
│   │   │   ├── ParallaxBgNumber.tsx  # Client Component
│   │   │   └── RotatingText.tsx      # Client Component
│   │   ├── blog/
│   │   │   ├── PostCard.tsx
│   │   │   └── MDXComponents.tsx     # Custom MDX component overrides
│   │   └── portal/
│   │       ├── MetricsCard.tsx
│   │       ├── DeliverablesList.tsx
│   │       ├── Timeline.tsx
│   │       └── MessageThread.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser client (for portal interactions)
│   │   │   ├── server.ts         # Server client (for server components/actions)
│   │   │   └── middleware.ts     # Session refresh helper
│   │   ├── blog.ts               # MDX reading utilities (frontmatter, slugs)
│   │   └── actions/
│   │       └── leads.ts          # Server action: insertLead()
│   ├── hooks/
│   │   ├── useIntersectionObserver.ts
│   │   ├── useMousePosition.ts
│   │   └── useReducedMotion.ts
│   └── types/
│       └── index.ts              # Shared TypeScript types
├── middleware.ts                  # Next.js middleware (auth redirect for /portal)
├── next.config.ts
├── ecosystem.config.js           # PM2 config
├── package.json
└── tsconfig.json
```

### Key structural decisions

**globals.css monolith:** Per the tech decision in PROJECT.md, all maquette CSS goes into one file. CSS custom properties and cascade remain intact. Component-specific CSS stays in globals.css organized by the same section headers as the maquette. No CSS modules, no Tailwind, no CSS-in-JS.

**Server vs Client Components:** The default is Server Component. Only add `'use client'` when the component needs: browser APIs (IntersectionObserver, mousemove, scroll), useState/useEffect, or event handlers (onClick, onSubmit). Sections like Process, Work, Testimonials, Different, About are pure HTML -- they stay as Server Components. The interactive wrapper (RevealOnScroll) can wrap them client-side for scroll reveals.

**middleware.ts at root:** Next.js requires middleware at the project root (not inside `src/app/`). It intercepts `/portal/*` routes and checks Supabase session.

---

## 5. Animation Migration Strategy

The maquette has 12 distinct animation/interaction systems. Each needs a specific migration approach.

### Inventory of animations

| # | Animation | Trigger | Current Implementation | Migration Target |
|---|-----------|---------|----------------------|-----------------|
| 1 | Scroll progress bar | scroll event | Vanilla JS, passive scroll listener | `ScrollProgress.tsx` Client Component |
| 2 | Rotating headline text | setInterval (3s) | DOM manipulation, translate Y + opacity | `RotatingText.tsx` Client Component |
| 3 | Service accordion | click | classList toggle + maxHeight | `Services.tsx` Client Component, useState |
| 4 | Scroll reveal (fade-in) | IntersectionObserver | `.reveal` + `.visible` class | `RevealOnScroll.tsx` wrapper or `useIntersectionObserver` hook |
| 5 | Analytics dashboard suite | IntersectionObserver (once) | Count-ups, sparkline draw, bar heights, dot grid, play buttons, segments, cost bar | `AnalyticsDashboard.tsx` single Client Component |
| 6 | Custom cursor (magnetic follow) | mousemove + rAF | lerp follow (0.15 factor), `.hovering` class | `CustomCursor.tsx` Client Component |
| 7 | Magnetic buttons | mousemove on element | translate based on mouse offset from center | `MagneticButton.tsx` Client Component |
| 8 | Parallax background numbers | rAF continuous | translateY based on section-to-viewport offset | `ParallaxBgNumber.tsx` Client Component |
| 9 | FAQ accordion | click | Same pattern as service accordion | `FAQ.tsx` Client Component, useState |
| 10 | Exit intent modal | mouseout (clientY <= 0) | sessionStorage flag, overlay toggle | `ExitIntentModal.tsx` Client Component |
| 11 | Sticky mobile CTA | IntersectionObserver on hero | Show when hero leaves viewport, dismiss on click | `StickyMobileCTA.tsx` Client Component |
| 12 | Gold pulse on contact view | IntersectionObserver (once) | CSS animation class added on first view | Part of `ContactForm.tsx` |

### Migration principles

**1. Keep all CSS animations in globals.css.** The keyframes, transitions, `.visible` state rules, and `.animated` classes stay exactly where they are. Do not move them into component files. The CSS is the source of truth for visual behavior.

**2. Replace DOM queries with refs.** Every `document.querySelector` becomes a `useRef`. Every `document.querySelectorAll` becomes either multiple refs or a single ref on the parent with `ref.current.querySelectorAll` inside a useEffect.

**3. Replace imperative class toggling with state-driven classes.**
```
// Before (vanilla)
el.classList.add('visible');

// After (React)
const [visible, setVisible] = useState(false);
<div className={`reveal ${visible ? 'visible' : ''}`}>
```

**4. Preserve requestAnimationFrame loops.** The custom cursor, parallax, and count-up animations use rAF loops. These go inside useEffect with cleanup:
```tsx
useEffect(() => {
  let frameId: number;
  function loop() {
    // ... animation logic using refs
    frameId = requestAnimationFrame(loop);
  }
  frameId = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(frameId);
}, []);
```

**5. Respect prefers-reduced-motion.** The maquette already checks `window.matchMedia('(prefers-reduced-motion: reduce)')`. Create a `useReducedMotion` hook that returns a boolean. Every animation component checks it. When true, skip animation and show final state immediately.

**6. IntersectionObserver becomes a reusable hook.** Many sections use the same observe-once-then-add-class pattern. A single `useIntersectionObserver(ref, options)` hook returns `isIntersecting`. Components use it to conditionally add classes or trigger one-time animations.

**7. Keep the analytics dashboard as one component.** The maquette treats the entire analytics grid as a single animation unit (one observer triggers all sub-animations). Do not split it into 6 separate observed components. One `AnalyticsDashboard.tsx` Client Component with one observer and internal refs for each sub-animation.

**8. setInterval for rotating text needs cleanup.** The maquette uses a bare `setInterval(rotateText, 3000)` that never clears. In React, this goes in useEffect with `return () => clearInterval(id)` to prevent memory leaks on unmount (relevant for dev mode / hot reload).

**9. Event listeners on window/document need cleanup.** Scroll, mousemove, mouseout listeners added in useEffect must be removed in the cleanup function.

**10. Do not use Framer Motion or GSAP.** The maquette achieves everything with CSS transitions + vanilla JS. Introducing an animation library adds bundle weight and changes timing curves. Keep the same approach: CSS handles the visual transition, JS triggers it via class or style changes.

### The one risky migration: dynamic element generation

The analytics dashboard builds elements dynamically (54 dots, 20 play buttons, 15 segments). In React, these become mapped arrays:

```tsx
{Array.from({ length: 54 }, (_, i) => (
  <div key={i} className={`analytics-dot ${animated ? 'lit' : ''}`}
       style={{ transitionDelay: `${i * 40}ms` }} />
))}
```

The staggered delay (currently `setTimeout` per element) becomes `transition-delay` in CSS, which is cleaner and already how the CSS is structured. The JS `setTimeout` approach in the maquette is actually fighting against what CSS can do natively.

---

## 6. Infrastructure Notes

### PM2 + nginx (not Vercel)

Next.js on DigitalOcean with PM2 requires `next build` then `next start`. The ecosystem config:

```js
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'hypeon-website',
    script: 'node_modules/.bin/next',
    args: 'start -p 3100',
    cwd: '/opt/hypeon-website',
    env: {
      NODE_ENV: 'production',
      NEXT_PUBLIC_SUPABASE_URL: '...',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: '...',
      SUPABASE_SERVICE_ROLE_KEY: '...',
    }
  }]
};
```

nginx block (separate from Orbit which runs on another port):

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
# certbot will add SSL block automatically
```

### SSG behavior without Vercel

On Vercel, ISR and on-demand revalidation work out of the box. On a self-hosted PM2 setup:

- `generateStaticParams` + `export const dynamic = 'force-static'` works normally at build time.
- To update blog posts, rebuild and restart: `next build && pm2 restart hypeon-website`.
- If on-demand revalidation is needed later, it works via `revalidatePath()` called from an API route, but requires the server to be running (which it is under PM2).
- No CDN edge caching. nginx can be configured with `proxy_cache` for static assets if needed, but Next.js built-in caching is sufficient initially.

### Supabase: same project, new tables

Use the same Supabase project as Orbit. New tables with `hypeon_` prefix or a separate schema:

- `leads` (id, name, email, channel_url, service_interest, message, created_at)
- `clients` (id, email, company, auth_user_id)
- `deliverables` (id, client_id, title, status, due_date, file_url)
- `channel_metrics` (id, client_id, date, views, subscribers, revenue, watch_hours)
- `messages` (id, client_id, sender, body, created_at)

RLS: clients table linked to auth.users via auth_user_id. All other tables filtered by client_id with a policy that checks `auth.uid() = clients.auth_user_id`.

---

*Research complete. This document informs implementation but does not prescribe specific library versions or exact API signatures. Those decisions happen at build time.*
