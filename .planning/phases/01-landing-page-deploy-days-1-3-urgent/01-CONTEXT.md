# Phase 1: Landing Page + Deploy — Context

**Gathered:** 2026-03-21
**Status:** Ready for execution

<domain>
## Phase Boundary

Migrate the polished HTML maquette (`/Users/julianrinta/hypeon-media-site/index.html`, ~4000 lines) to a Next.js 16 App Router application. Deploy on DigitalOcean server alpha (167.172.246.198) alongside Orbit. Site live at hypeon.media with SSL, form submissions flowing to Supabase.

</domain>

<decisions>
## Implementation Decisions

### Design Source of Truth
- The HTML maquette at `/Users/julianrinta/hypeon-media-site/index.html` is the SINGLE source of truth for design
- Every pixel, animation, interaction must match
- Design tokens: `#FFD300` accent, `#09090b` bg, Plus Jakarta Sans / Outfit / IBM Plex Mono
- Sharp edges (0px radius everywhere), noise texture, magnetic cursor

### Faceless Brand
- No individual names anywhere on the public site
- All copy uses "we" / "our team"
- Video features "Chris from the strategy team" (not Julian)

### Animation Approach
- CSS + vanilla JS (useEffect + rAF) for Phase 1 — matching the maquette's approach
- `motion` library deferred to Phase 2 if needed
- 12 animation systems: magnetic cursor, parallax bg numbers, count-up counters, rotating headline, noise texture, scroll reveals, sparkline draw, bar chart fill, dot cascade, play button pulse, language segments, cost reduction
- All must respect prefers-reduced-motion

### Form & CRO
- Contact form with 4 service pills (YouTube/Creative/Products/Not sure)
- YouTube URL field shows/hides based on pill selection
- Form submits to Supabase `leads` table via Server Action with Zod validation
- Exit intent modal (desktop), sticky mobile CTA, inline CTAs after sections
- Urgency indicator with pulsing badge ("2 spots available")
- Friction reducers below submit button

### Infrastructure
- Port 3100 (Orbit is on 3000)
- PM2 process: `hypeon-website`
- nginx server block for `hypeon.media`
- SSL via certbot
- Node.js 24.x (check server, use nvm if needed)
- Same Supabase project as Orbit, new `leads` table

### What NOT to do
- No Tailwind (preserve existing CSS)
- No react-hook-form in Phase 1 (useState + Server Action is sufficient)
- No motion/framer-motion in Phase 1 (CSS + useEffect matches maquette)
- No Docker
- No separate API routes — use Server Actions

### Claude's Discretion
- Component file naming convention (PascalCase recommended)
- Exact hook implementations for animations
- CSS organization within globals.css (maintain maquette's section comments)
- Error handling patterns for Server Actions

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before implementing.**

### Design
- `/Users/julianrinta/hypeon-media-site/index.html` — THE source of truth (HTML/CSS/JS maquette)

### Project
- `.planning/PROJECT.md` — Project context, constraints, key decisions
- `.planning/REQUIREMENTS.md` — All 17 Phase 1 requirements with traceability
- `.planning/ROADMAP.md` — Phase goals and success criteria
- `CLAUDE.md` — Tech stack, conventions, deployment patterns

### Research
- `.planning/research/STACK.md` — Exact versions and rationale for every dependency
- `.planning/research/ARCHITECTURE.md` — Component structure, data flow, file organization
- `.planning/research/PITFALLS.md` — 15 documented pitfalls with prevention strategies
- `.planning/phases/01-landing-page-deploy-days-1-3-urgent/01-RESEARCH.md` — Phase-specific migration guide (22 components, 12 animations classified)

</canonical_refs>

<specifics>
## Specific References

- YouTube showreel video ID: `4rx33ktY-NA`
- Formspree placeholder: `https://formspree.io/f/PLACEHOLDER` (replace with Supabase Server Action)
- DigitalOcean server: `167.172.246.198` (ssh alias: `alpha`)
- GitHub repo: `julianrinta-bit/hypeon-website`
- Domain registrar: Namecheap (hypeon.media)
- Supabase project: same as Orbit

</specifics>

<deferred>
## Deferred to Phase 2+

- Blog (MDX + Velite + SSG)
- Client portal (Supabase Auth + dashboard)
- `motion` animation library (evaluate after Phase 1)
- react-hook-form (add if client-side validation needed)
- Analytics (Plausible/Umami)
- OG image auto-generation per page (Phase 2 has `opengraph-image.tsx` for landing only)

</deferred>

---

*Phase: 01-landing-page-deploy-days-1-3-urgent*
*Context gathered: 2026-03-21 from session decisions + board recommendations*
