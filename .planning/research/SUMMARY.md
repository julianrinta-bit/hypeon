# Research Summary — Hype On Media Website Platform

Synthesis of STACK.md, FEATURES.md, ARCHITECTURE.md, and PITFALLS.md. Every statement below is an actionable constraint for requirements and roadmap.

---

## 1. Recommended Stack

| Layer | Choice | Version |
|-------|--------|---------|
| Runtime | Node.js (nvm) | 24.x LTS |
| Framework | Next.js (App Router, Turbopack) | 16.2.x |
| UI | React (Server Components default) | 19.x |
| Styling | globals.css monolith + CSS custom properties | N/A |
| Animation | motion (formerly framer-motion) | 12.36.x |
| Content | velite (MDX + Zod schemas, build-time) | 0.2.x |
| Auth + DB | Supabase (@supabase/supabase-js + @supabase/ssr) | 2.99.x |
| Forms | react-hook-form + zod | 7.x / 4.3.x |
| Images | sharp (required for self-hosted optimization) | 0.34.x |
| Deploy | PM2 + nginx + certbot on DigitalOcean | existing server |
| Dev | TypeScript 5.7, ESLint 9 (flat config) | — |

**14 direct dependencies (7 prod, 7 dev). No Tailwind, no CSS-in-JS, no ORM, no Docker.**

---

## 2. Feature Scope

### v1 — Ships

**Landing Page (Phase 1):**
- Hero with rotating text, magnetic cursor, parallax background numbers
- Showreel (lazy YouTube embed), analytics proof section (count-ups, sparklines, dot grid, bar chart)
- Services accordion, process steps, case studies, testimonials, NDA transparency, about, FAQ accordion
- Contact form (name + email + channel URL + service pills) with server-side validation + honeypot
- Exit intent modal (desktop), sticky mobile CTA
- prefers-reduced-motion support on all animations
- Supabase `leads` table insert via Server Action

**Blog (Phase 2):**
- MDX pipeline via velite, SSG at build time
- /blog index + /blog/[slug] with prose styling, reading time, auto-generated TOC
- Structured data (JSON-LD Article + Organization + Breadcrumb)
- sitemap.ts, robots.ts, RSS feed
- OG images (static fallback initially, per-article generation later)
- Inline audit CTA reusing Phase 1 form component
- 2-3 launch articles

**Portal MVP (Phase 3):**
- Supabase Auth (magic link), middleware-protected /portal/* routes
- Deliverables list (upload/download, status)
- Channel metrics overview (manual data entry first, YouTube API later)
- Project timeline / milestones
- Async communication thread (Supabase table, not real-time)

### Deferred to v2

- Deliverable approval workflow
- Before/after performance snapshots
- Email notifications (new deliverable, new message)
- Onboarding checklist for new clients
- YouTube Data API integration (replace manual metrics entry)
- Per-article OG image auto-generation
- Analytics (Plausible or Umami, self-hosted)
- Playwright E2E tests for portal
- Sentry error tracking

### Explicitly Out

Live chat, chatbot, invoicing/payments, CMS GUI, pricing page, multi-step wizard form, pop-ups, newsletter signup, comments, social share buttons, client self-service editing, Kanban/task board, multi-user per client, custom report builder, background audio.

---

## 3. Architecture Overview

### Rendering Strategy

| Surface | Rendering | Auth | Data Source |
|---------|-----------|------|-------------|
| Landing page | SSG (static at build) | None | Form submit to Supabase |
| Blog | SSG (static at build via velite) | None | MDX files on disk |
| Portal | SSR (per-request) | Supabase Auth (magic link) | Supabase tables with RLS |

### Component Map

```
src/
  app/
    page.tsx              ← Landing page (composes ~15 section components)
    layout.tsx            ← Root layout: fonts, metadata, body
    globals.css           ← Full maquette CSS (monolith)
    blog/
      page.tsx            ← Blog index (SSG)
      [slug]/page.tsx     ← Blog post (SSG)
    portal/
      login/page.tsx      ← Magic link login
      layout.tsx          ← Portal shell
      page.tsx            ← Dashboard (SSR)
    sitemap.ts, robots.ts
  components/
    layout/    ← Nav, Footer (Server), ScrollProgress, CustomCursor (Client)
    landing/   ← 15 section components (mix of Server + Client)
    ui/        ← MagneticButton, RevealOnScroll, ParallaxBgNumber, RotatingText (all Client)
    blog/      ← PostCard, MDXComponents
    portal/    ← MetricsCard, DeliverablesList, Timeline, MessageThread
  lib/
    supabase/  ← client.ts, server.ts, middleware.ts
    actions/   ← leads.ts (Server Action)
    blog.ts    ← MDX utilities
  hooks/       ← useIntersectionObserver, useMousePosition, useReducedMotion
middleware.ts  ← Auth guard for /portal/*
```

### Data Flow

- **Form:** Client validates -> Server Action -> Supabase `leads` table -> success/error response
- **Blog:** MDX on disk -> velite build -> typed JSON -> generateStaticParams -> static HTML
- **Portal:** middleware checks cookie -> Server Component fetches Supabase (deliverables, metrics, messages) -> SSR HTML

### Supabase Tables (same project as Orbit)

`leads`, `clients`, `deliverables`, `channel_metrics`, `messages` — all with `client_id` FK. RLS: `auth.uid() = clients.auth_user_id` on every table.

### Infrastructure

- PM2 process `hypeon-website` on port 3100, separate from Orbit
- nginx server block for `hypeon.media` -> `localhost:3100`
- SSL via certbot (separate cert from Orbit)
- Deploy: `git pull && npm ci && npm run build && pm2 reload hypeon-website --update-env`

---

## 4. Critical Risks

| # | Risk | Impact | Prevention |
|---|------|--------|------------|
| 1 | **Animation breakage during React migration** | Landing page ships broken or janky. 12 animation systems must be converted from vanilla JS to useRef + useEffect with cleanup. | Wrap each animation in a dedicated Client Component. Test in isolation before composing. Keep CSS animations in globals.css, replace DOM queries with refs. |
| 2 | **Hydration mismatches from HTML port** | Console floods, layout flickers, debugging time sink. | Run automated JSX converter on maquette HTML first. Treat every hydration warning as a blocking bug. Zero browser APIs in Server Components. |
| 3 | **globals.css cascade conflicts in Phase 2+** | Blog or portal styles break landing page. Specificity wars, !important proliferation. | Namespace custom properties (--hero-*, --blog-*, --portal-*). Use CSS Modules for blog and portal. Do not extend globals.css beyond the landing page. |
| 4 | **PM2 + nginx deployment errors** | Both Hype On and Orbit go down. Port conflicts, missing build step, SSL renewal failure. | Deploy script (not manual). Dedicated port 3100. Separate nginx server block. `nginx -t` before reload. `pm2 startup` + `pm2 save`. Test Orbit after every nginx change. |
| 5 | **Form spam without rate limiting** | Supabase leads table fills with garbage, corrupts conversion data. | Server-side Zod validation, honeypot field, IP rate limit (3/hour). Add CAPTCHA only if spam becomes real. |

---

## 5. Key Decisions Made

These are locked. Changing them requires revisiting the research.

1. **No Tailwind.** The 4000-line maquette CSS migrates as-is into globals.css. CSS custom properties for design tokens. CSS Modules only for Phase 2+ component isolation.
2. **No animation library for Phase 1.** Vanilla CSS transitions + JS class toggling (same as maquette). motion (framer-motion) available for complex orchestration if needed.
3. **velite for MDX, not Contentlayer or next-mdx-remote.** Build-time typed JSON, Zod validation, zero runtime cost. Pre-1.0 but low blast radius (replaceable in hours).
4. **Supabase for everything** (auth, DB, storage). Same project as Orbit, separate tables. No second auth system (no NextAuth/Clerk).
5. **Self-hosted on DigitalOcean**, not Vercel. Full SSG rebuild on deploy for blog updates. No ISR until article count exceeds ~20.
6. **Server Components by default.** `'use client'` only for components needing browser APIs, hooks, or event handlers. Static sections stay server-rendered.
7. **Manual YouTube metrics entry first.** YouTube Data API integration deferred to v2 to avoid OAuth complexity blocking portal launch.
8. **No `output: 'standalone'`** in next.config. Standard output with `next start` via PM2 in the repo directory.

---

## 6. Build Sequence

Each phase produces a deployable increment. Dependencies noted.

### Phase 1: Foundation + Landing Page (days 1-3)

```
1a. Scaffold — next.js app, globals.css, layout.tsx, fonts, PM2 config, nginx block
    Deploy empty shell to confirm infra works.
    ↓
1b. Layout Shell — Nav, Footer (Server), ScrollProgress, CustomCursor (Client)
    ↓
1c. Static Sections — Hero, Ticker, Showreel, Services, Process, Work,
    Testimonials, Different, About, FAQ. All Server Components, no animations.
    ↓
1d. Interactive Sections — AnalyticsDashboard, accordions, RotatingText,
    MagneticButton, ParallaxBgNumber, RevealOnScroll, StickyMobileCTA.
    All Client Components. Test each animation in isolation.
    ↓
1e. Contact Form + Supabase — Form with pills/validation, ExitIntentModal,
    Server Action, leads table, honeypot, rate limiting.
    ↓
1f. Deploy — DNS, SSL, nginx finalized. Verify Orbit unaffected.
```

**Blocker:** Animation migration (1d) is the highest-risk step. Budget extra time.

### Phase 2: Blog (days 4-5)

```
2a. MDX Pipeline — velite config, /content/blog/ directory, frontmatter schema,
    2 dummy posts. Verify generateStaticParams produces static HTML.
    Depends on: Phase 1 layout shell.
    ↓
2b. Blog Pages — /blog index, /blog/[slug] with prose styling, reading time,
    TOC, inline audit CTA (reuses Phase 1 form component).
    ↓
2c. SEO — sitemap.ts, robots.ts, JSON-LD, RSS feed, OG images (static fallback).
    Validate with curl + OG debuggers.
```

**Blocker:** Get velite pipeline right with dummy posts before writing real articles.

### Phase 3: Portal MVP (days 6-8)

```
3a. Supabase Schema + RLS — Define tables (clients, deliverables, channel_metrics,
    messages) and RLS policies BEFORE any UI work.
    Depends on: Supabase already configured from Phase 1.
    ↓
3b. Auth — @supabase/ssr, middleware.ts, /portal/login. Test behind nginx,
    not just localhost.
    ↓
3c. Dashboard — /portal with deliverables list, metrics display, timeline,
    message thread. Build one vertical slice end-to-end first (deliverables).
```

**Blocker:** Schema and RLS must be defined before UI. Test auth behind nginx early.

---

*Synthesized 2026-03-21 from STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md. This document feeds directly into requirements definition and roadmap creation.*
