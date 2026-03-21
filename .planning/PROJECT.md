# Hype On Media — Website Platform

## What This Is

A full-stack website platform for Hype On Media FZCO (YouTube performance agency, Dubai). Migrating from a polished single-page HTML maquette to a Next.js application with three capabilities: a marketing landing page, an SEO-optimized blog, and an authenticated client portal with dashboard.

## Core Value

The landing page must convert visitors into free audit submissions. Every other feature (blog, portal) exists to support that conversion — either by driving traffic (blog/SEO) or by retaining clients (portal).

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Landing page with all current sections migrated to React components
- [ ] All animations preserved (magnetic cursor, parallax, count-ups, sparklines, ticker, accordions, rotating text)
- [ ] Form submissions stored in Supabase (leads table)
- [ ] Blog system with MDX, SSG, SEO optimization
- [ ] Blog articles indexable by search engines with proper meta tags, OG images
- [ ] Client authentication (Supabase Auth — magic link or email/password)
- [ ] Client dashboard showing: deliverables, channel metrics, project timeline, communication thread
- [ ] Deployed on DigitalOcean alpha server (167.172.246.198) with nginx reverse proxy + PM2
- [ ] Domain hypeon.media pointing to the server with SSL (certbot)
- [ ] Responsive across all devices (mobile-first, same quality as current maquette)
- [ ] prefers-reduced-motion respected on all animations
- [ ] WCAG AA accessibility compliance

### Out of Scope

- Orbit integration — separate product, separate repo
- E-commerce / payment processing — no billing through the site yet
- CMS GUI — Julian is the only author, MDX in repo is sufficient
- Mobile app — web-first
- Multi-language site — English only for now (content can reference multilingual capabilities)
- Real-time chat — communication thread is async, not live chat

## Context

**Existing assets:**
- Polished HTML maquette at `/Users/julianrinta/hypeon-media-site/index.html` (~4000+ lines) — the design source of truth
- Currently deployed as preview at https://julianrinta-bit.github.io/hypeon/
- YouTube showreel video: https://www.youtube.com/watch?v=4rx33ktY-NA
- Brand profile at `CREATIVE AGENCY OS/05_MARKETING/Brand/_Brand_Profile.md`

**Infrastructure:**
- DigitalOcean server "alpha" (167.172.246.198) — already runs Orbit (Next.js + PM2)
- Supabase project exists (used by Orbit) — can create new tables or use same project
- Domain hypeon.media on Namecheap — currently pointed to Tilda, needs DNS change
- GitHub account: julianrinta-bit — repo `hypeon` already exists for preview

**Board decisions (from this session):**
- YouTube-first positioning, other verticals secondary
- Faceless brand (no individual names)
- #FFD300 Cyber Gold accent, Plus Jakarta Sans / Outfit / IBM Plex Mono
- Free channel audit as primary CTA with service pills for other verticals
- Analytics dashboard proof section with unique visualizations per metric
- Process, FAQ, testimonials, video showreel sections all designed and built
- NDA explanation for why no client logos
- Blog articles: 5 planned (YouTube revenue, audit framework, B2B YouTube, AI costs, thumbnails)

**Tech decisions (board + CTO):**
- Next.js App Router (not Pages)
- SSG for landing page + blog, SSR for dashboard
- Supabase for auth + database
- MDX for blog (no CMS)
- PM2 + nginx on DigitalOcean (not Vercel)
- globals.css with all current CSS (no premature splitting)
- Server Components for static content, Client Components for interactive elements

## Constraints

- **Timeline**: Phase 1 (landing page) must be live within 3 days
- **Infrastructure**: Must coexist with Orbit on the same DigitalOcean server (different PM2 process, different nginx location block, different port)
- **Design fidelity**: Every animation and interaction from the HTML maquette must be preserved in React
- **Faceless brand**: No individual names or photos anywhere on the public site
- **SEO**: Blog pages must be server-rendered / statically generated for indexation
- **Auth**: Client portal must be behind authentication (Supabase Auth)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router | Starting fresh, App Router is the default for new projects | — Pending |
| MDX over CMS | Julian is the only author, no need for GUI editor | — Pending |
| DigitalOcean over Vercel | Already paying for the server, control, coexists with Orbit | — Pending |
| Supabase for everything | Already used by Orbit, proven stack, auth + DB in one | — Pending |
| globals.css monolith | Preserves cascade and custom properties from maquette | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-21 after initialization*
