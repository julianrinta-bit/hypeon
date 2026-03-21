# Roadmap: Hype On Media Website Platform

**Created:** 2026-03-21
**Granularity:** Coarse (3 phases, 1-3 plans each)
**Core Value:** Convert visitors into free audit submissions

---

## Phase 1: Landing Page + Deploy (Days 1-3) — URGENT

**Goal:** The full marketing site is live at hypeon.media, pixel-perfect match to the HTML maquette, form submissions flowing to Supabase.

### Requirements

| ID | Requirement |
|----|-------------|
| LAND-01 | All 14 sections converted to React components |
| LAND-02 | All 12 animation systems preserved |
| LAND-03 | Service pills conditionally show/hide YouTube URL field |
| LAND-04 | Form submissions stored in Supabase `leads` table |
| LAND-05 | Exit intent modal + sticky mobile CTA |
| LAND-06 | Scroll progress, hamburger menu, FAQ/service accordions |
| LAND-07 | Lazy YouTube embed |
| LAND-08 | OG tags, meta, favicon, Twitter card |
| LAND-09 | Responsive at 480/768/1024 breakpoints |
| LAND-10 | prefers-reduced-motion disables all animations |
| LAND-11 | WCAG AA compliance |
| INFRA-01 | Next.js on DigitalOcean via PM2, port 3100 |
| INFRA-02 | nginx reverse proxy for hypeon.media |
| INFRA-03 | SSL via certbot |
| INFRA-04 | Coexists with Orbit without conflicts |
| INFRA-05 | Environment variables secured |
| INFRA-06 | PM2 ecosystem config |

### Plans

**Plan 1.1 — Scaffold + Infra**
Scaffold Next.js app, globals.css monolith, layout with fonts, PM2 config, nginx server block. Deploy empty shell to confirm infra works. DNS + SSL.

**Plan 1.2 — Sections + Animations**
Migrate all 14 sections as React components (Server Components for static, Client Components for interactive). Port all 12 animation systems using refs + useEffect. Test each animation in isolation.

**Plan 1.3 — Form + Polish + Ship**
Contact form with service pills, Supabase Server Action, honeypot, validation. Exit intent modal, sticky mobile CTA. Responsive QA, accessibility audit, OG tags. Final deploy.

### Success Criteria

1. A visitor on mobile can scroll the full page, tap the hamburger menu, and submit the audit form — submission appears in Supabase `leads` table.
2. A visitor on desktop sees all animations (parallax, magnetic cursor, count-ups, sparklines) — with prefers-reduced-motion ON, all animations are disabled and content is static.
3. `curl -I https://hypeon.media` returns 200 with valid SSL certificate, and Orbit at port 3000 continues to respond normally.
4. Lighthouse accessibility score >= 90; no contrast ratio below 4.5:1.

---

## Phase 2: Blog (Week 2-3)

**Goal:** SEO-optimized blog driving organic traffic to the audit form. First articles published and indexable.

### Requirements

| ID | Requirement |
|----|-------------|
| BLOG-01 | MDX content system with velite |
| BLOG-02 | Blog index page at /blog (SSG) |
| BLOG-03 | Article pages at /blog/[slug] (SSG) |
| BLOG-04 | Meta tags, OG image, canonical URL, JSON-LD per article |
| BLOG-05 | Auto-generated sitemap.xml |
| BLOG-06 | robots.txt allowing indexation |
| BLOG-07 | Blog layout matches design system |
| BLOG-08 | Inline CTA linking to audit form |
| BLOG-09 | First 3 articles written and published |

### Plans

**Plan 2.1 — MDX Pipeline + Pages**
Configure velite with frontmatter schema, create /content/blog/ directory, build blog index and [slug] pages with SSG. Prose styling matching dark theme + gold accent.

**Plan 2.2 — SEO + Content**
sitemap.ts, robots.ts, JSON-LD structured data, OG images (static fallback). Write and publish first 3 articles with inline audit CTAs. Validate with Google Rich Results Test.

### Success Criteria

1. Google Search Console shows all blog URLs as "Valid" after submitting sitemap.
2. A visitor reads a blog article and clicks the inline CTA — it scrolls/navigates to the audit form, which works identically to Phase 1.
3. `curl https://hypeon.media/blog/[slug]` returns full HTML with article content (not client-rendered shell), valid JSON-LD, and OG meta tags.

---

## Phase 3: Client Portal (Week 4-6, only when client signs)

**Goal:** Authenticated portal where clients can view deliverables, track project progress, and communicate async. Ships only when there is a paying client.

### Requirements

| ID | Requirement |
|----|-------------|
| PORT-01 | Supabase Auth with magic link at /login |
| PORT-02 | Auth middleware protecting /dashboard/* |
| PORT-03 | Dashboard: welcome, deliverables, timeline |
| PORT-04 | Downloadable deliverables (PDFs, decks) |
| PORT-05 | Async communication thread |
| PORT-06 | Dashboard matches site design system |

### Plans

**Plan 3.1 — Auth + Schema**
Define Supabase tables (clients, deliverables, channel_metrics, messages) with RLS policies. Implement magic link auth flow, middleware protection. Test behind nginx.

**Plan 3.2 — Dashboard**
Build /dashboard with deliverables list (download), project timeline, and async message thread. Same dark + gold design system. One vertical slice (deliverables) end-to-end first, then expand.

### Success Criteria

1. An unauthenticated visitor hitting /dashboard/* is redirected to /login. After magic link auth, they land on the dashboard.
2. A client can download a deliverable PDF and send a message — both persist across sessions.
3. Dashboard renders server-side (view-source shows content), not a blank client shell.

---

## Coverage Validation

| Category | Requirements | Phase | Count |
|----------|-------------|-------|-------|
| Landing Page | LAND-01 to LAND-11 | Phase 1 | 11 |
| Infrastructure | INFRA-01 to INFRA-06 | Phase 1 | 6 |
| Blog | BLOG-01 to BLOG-09 | Phase 2 | 9 |
| Portal | PORT-01 to PORT-06 | Phase 3 | 6 |
| **Total** | | | **32** |

**Unmapped v1 requirements: 0**

---
*Created: 2026-03-21*
*Last updated: 2026-03-21*
