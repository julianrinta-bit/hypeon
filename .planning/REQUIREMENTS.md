# Requirements: Hype On Media Website Platform

**Defined:** 2026-03-21
**Core Value:** Convert visitors into free audit submissions

## v1 Requirements

### Landing Page

- [ ] **LAND-01**: All sections from HTML maquette converted to React components (Hero, Ticker, Credibility, Showreel, Proof, Services, Process, Work, Testimonials, Different, About, FAQ, Contact, Footer)
- [ ] **LAND-02**: All 12 animation systems preserved (magnetic cursor, parallax bg numbers, count-up counters, rotating headline, noise texture, scroll reveals, sparkline draw, bar chart fill, dot cascade, play button pulse, language segments, cost reduction)
- [ ] **LAND-03**: Service pills in contact form conditionally show/hide YouTube URL field based on selection
- [ ] **LAND-04**: Form submissions stored in Supabase `leads` table with all fields (service_interest, channel_url, name, email, message)
- [ ] **LAND-05**: Exit intent modal (desktop) and sticky mobile CTA functional
- [ ] **LAND-06**: Scroll progress bar, hamburger mobile menu, FAQ accordion, service accordion all functional
- [ ] **LAND-07**: YouTube video embed loads lazily and plays correctly
- [ ] **LAND-08**: OG tags, meta description, theme-color, favicon, Twitter card all present
- [ ] **LAND-09**: Responsive at 480px, 768px, 1024px breakpoints — mobile-first
- [ ] **LAND-10**: prefers-reduced-motion disables all animations, shows static content
- [ ] **LAND-11**: WCAG AA compliance (contrast, focus states, skip link, aria labels, semantic HTML)

### Blog

- [ ] **BLOG-01**: MDX content system with Velite — articles as .mdx files with frontmatter (title, date, description, tags, slug)
- [ ] **BLOG-02**: Blog index page at /blog listing all articles (SSG, sorted by date)
- [ ] **BLOG-03**: Individual article pages at /blog/[slug] with SSG
- [ ] **BLOG-04**: Each article has: proper meta tags, OG image, canonical URL, JSON-LD structured data
- [ ] **BLOG-05**: Auto-generated sitemap.xml including all blog URLs
- [ ] **BLOG-06**: robots.txt allowing indexation
- [ ] **BLOG-07**: Blog layout matches site design system (dark theme, Plus Jakarta Sans, gold accent)
- [ ] **BLOG-08**: Inline CTA within articles linking to free audit form
- [ ] **BLOG-09**: First 3 articles written and published

### Client Portal

- [ ] **PORT-01**: Supabase Auth with magic link login at /login
- [ ] **PORT-02**: Auth middleware protecting /dashboard/* routes
- [ ] **PORT-03**: Client dashboard at /dashboard showing: welcome message, deliverables list, project timeline
- [ ] **PORT-04**: Deliverables section with downloadable files (audit PDFs, strategy decks)
- [ ] **PORT-05**: Async communication thread (simple message list, not real-time)
- [ ] **PORT-06**: Dashboard uses same design system as public site (dark + gold)

### Infrastructure

- [ ] **INFRA-01**: Next.js app running on DigitalOcean alpha (167.172.246.198) via PM2 on port 3100
- [ ] **INFRA-02**: nginx reverse proxy routing hypeon.media to port 3100
- [ ] **INFRA-03**: SSL via certbot for hypeon.media
- [ ] **INFRA-04**: Coexists with Orbit (port 3000) without conflicts
- [ ] **INFRA-05**: Environment variables secured (.env.local, not in git)
- [ ] **INFRA-06**: PM2 ecosystem config for process management

## v2 Requirements

### Blog Enhancements

- **BLOG-V2-01**: RSS feed at /blog/rss.xml
- **BLOG-V2-02**: Auto-generated OG images per article (using @vercel/og or satori)
- **BLOG-V2-03**: Table of contents auto-generated from headings
- **BLOG-V2-04**: Related articles section at bottom of each post
- **BLOG-V2-05**: Reading time estimate

### Portal Enhancements

- **PORT-V2-01**: YouTube Data API integration showing client channel metrics
- **PORT-V2-02**: Before/after performance snapshots
- **PORT-V2-03**: Deliverable approval workflow (client can approve/request changes)
- **PORT-V2-04**: Onboarding checklist for new clients
- **PORT-V2-05**: Role-based access (admin vs client)

### Marketing

- **MKT-V2-01**: Analytics integration (Plausible or Umami, privacy-first)
- **MKT-V2-02**: A/B testing on CTA copy
- **MKT-V2-03**: LinkedIn share optimization per article

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time chat | High complexity, async thread sufficient for v1 |
| Payment/invoicing | Not needed until billing structure defined |
| CMS GUI | Julian is only author, MDX in repo is sufficient |
| Multi-language site | English only, multilingual capabilities mentioned in copy |
| Mobile app | Web-first |
| Docker containerization | Overkill for 2 apps on one server |
| Tailwind CSS | Existing maquette CSS must be preserved |
| Vercel deployment | Using own server for control and cost |
| Comments on blog | Low value, spam risk, moderation overhead |
| Newsletter popup | Conflicts with brand positioning |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAND-01 through LAND-11 | Phase 1 | Pending |
| INFRA-01 through INFRA-06 | Phase 1 | Pending |
| BLOG-01 through BLOG-09 | Phase 2 | Pending |
| PORT-01 through PORT-06 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 32 total
- Mapped to phases: 32
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-21*
*Last updated: 2026-03-21 after initial definition*
