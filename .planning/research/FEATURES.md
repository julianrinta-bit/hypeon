# Features Research — Hype On Media Website Platform

Research date: 2026-03-21

## Scope

Three surfaces: marketing landing page, SEO blog, authenticated client dashboard.
Core value from PROJECT.md: **the landing page must convert visitors into free audit submissions.** Everything else supports that conversion (blog drives traffic, portal retains clients).

---

## 1. LANDING PAGE

### Table Stakes (must have or users leave)

| Feature | Complexity | Notes |
|---------|-----------|-------|
| Clear value proposition above the fold | Low | Headline + subhead + single CTA. Visitors decide in <3s |
| Single primary CTA (free audit form) | Low | Every section should funnel toward it |
| Mobile-responsive layout | Medium | 83% of traffic is mobile; mobile converts ~50% worse than desktop if not optimized |
| Page load <3s (ideally <1.5s) | Medium | 53% of mobile users abandon at 3s+. 0.1s improvement = 8-10% conversion lift |
| Social proof section | Low | Testimonials, metrics, logos. NDA constraint means metrics-based proof instead of logos |
| Service descriptions | Low | What the agency does, for whom, pricing signals |
| Contact/audit form with minimal fields | Low | Form field reduction delivers up to 120% conversion lift. Name + email + channel URL is sufficient |
| SSL / HTTPS | Low | Already planned (certbot). Non-negotiable for trust + SEO |
| Accessible (WCAG AA) | Medium | Already in requirements. Contrast 4.5:1, keyboard nav, screen reader support |
| Cookie consent / privacy basics | Low | GDPR baseline even for Dubai entity serving global clients |

### Differentiators (competitive advantage)

| Feature | Complexity | Notes |
|---------|-----------|-------|
| Interactive analytics proof section | High | Unique visualizations per metric (already designed in maquette). Most agencies show static screenshots |
| Video showreel embed | Low | YouTube-first agency should lead with video. Autoplay-on-scroll with poster frame |
| Magnetic cursor + micro-animations | Medium | Already built in maquette. Conveys craft. Most agency sites are static |
| Sparkline ticker / live-feel data | Medium | Already designed. Creates perception of real-time performance |
| NDA transparency section | Low | Turns a weakness (no logos) into credibility. Few agencies do this |
| Process visualization | Low-Medium | Step-by-step with animations. Sets expectations, reduces friction |
| Multi-vertical service pills | Low | YouTube-first but shows breadth. Lets visitors self-identify |
| prefers-reduced-motion support | Low | Already in requirements. Most agency sites ignore this entirely |

### Anti-Features (deliberately NOT building)

| Feature | Reason |
|---------|--------|
| Live chat widget | Adds complexity, requires staffing or AI. Async form is sufficient for an agency selling high-ticket services |
| Pricing page / calculator | High-ticket custom services. Pricing on-page filters out leads prematurely |
| Multi-step wizard form | Over-engineered for a free audit. Single form, minimal fields |
| Pop-up / exit-intent modals | Damages trust for a premium brand. The CTA is already prominent |
| Chatbot | Same as live chat. Adds maintenance burden, brand risk |
| Testimonial carousel auto-rotation | Accessibility issue, annoys users. Static or user-controlled only |
| Background music/audio | Never |

---

## 2. SEO BLOG

### Table Stakes

| Feature | Complexity | Notes |
|---------|-----------|-------|
| SSG/SSR pages (not client-rendered) | Low | Already decided (Next.js SSG). Required for indexation |
| Proper meta tags per article | Low | title, description, canonical, robots |
| Open Graph + Twitter Card meta | Low | Required for social sharing. OG images per article |
| Semantic HTML (article, header, nav, main) | Low | Critical for SEO + accessibility |
| Structured data / JSON-LD | Medium | Article schema, Organization schema, BreadcrumbList. Enables rich snippets |
| Sitemap.xml (auto-generated) | Low | Next.js can generate this. Required for crawl efficiency |
| robots.txt | Low | Basic crawl directives |
| Internal linking between articles | Low | Content strategy concern, but template should support related posts |
| Responsive typography + images | Low | Already covered by site-wide responsive design |
| Fast page load (Core Web Vitals green) | Medium | LCP, FID/INP, CLS. SSG helps. Image optimization critical |
| RSS feed | Low | Standard for blogs. Low effort with MDX pipeline |

### Differentiators

| Feature | Complexity | Notes |
|---------|-----------|-------|
| MDX with interactive components | Medium | Embed YouTube players, calculators, before/after sliders inside articles. Few agency blogs do this |
| Audit CTA embedded in articles | Low | Contextual conversion. Not just a sidebar ad, but inline after key insights |
| Reading time + progress indicator | Low | Small UX touch that signals quality content |
| Code/data syntax highlighting | Low | For technical YouTube articles (API, analytics). Signals expertise |
| Article-specific OG images (auto-generated) | Medium | Consistent brand template. Can use @vercel/og or similar at build time |
| Table of contents (auto-generated from headings) | Low | Improves UX on long-form articles. Can become defined links in Google SERPs |
| Category/tag taxonomy | Low | Five articles planned now, but structure should scale |

### Anti-Features

| Feature | Reason |
|---------|--------|
| Comments system | Moderation burden. No community value at this stage. Social media handles discussion |
| Newsletter popup | Premature. No email list strategy yet. The CTA is audit, not subscribe |
| CMS GUI / admin panel | Julian is the only author. MDX in repo is explicitly sufficient (PROJECT.md out of scope) |
| AI-generated content pipeline | Brand risk. Five planned articles are hand-crafted for authority |
| Pagination (vs load-more or single list) | With 5-20 articles, pagination adds clicks for no benefit. Single page or infinite scroll |
| Share buttons (social) | Cluttered, rarely clicked. A clean copy-link button is enough |

---

## 3. CLIENT DASHBOARD (Authenticated Portal)

### Table Stakes

| Feature | Complexity | Notes |
|---------|-----------|-------|
| Authentication (login/logout) | Medium | Supabase Auth (magic link or email/password). Already decided |
| Protected routes (auth guard) | Low | Next.js middleware. Unauthenticated users see nothing |
| Deliverables list/grid | Medium | Files, links, assets organized by project/month. Core reason clients log in |
| Channel metrics overview | Medium-High | Views, subscribers, watch time, revenue. Pulled from YouTube API or manually updated |
| Project timeline / milestones | Medium | What's been done, what's next, current phase. Reduces "status update" calls |
| Communication thread (async) | Medium | Per-project messaging. Not real-time chat (explicitly out of scope). Think Basecamp-style |
| Role-based access | Low-Medium | At minimum: admin (Julian) vs client. Clients see only their data |
| Responsive dashboard | Medium | Must work on mobile. Clients check on phones |
| Session management | Low | Supabase handles this. Refresh tokens, logout, session expiry |
| Loading/error states | Low | Skeleton screens, error boundaries. Professional feel |

### Differentiators

| Feature | Complexity | Notes |
|---------|-----------|-------|
| YouTube analytics visualizations (branded) | High | Not just numbers in a table. Sparklines, trend charts, period comparisons in the agency's design language. This IS the product experience for retained clients |
| Deliverable approval workflow | Medium | Client can approve/request changes on deliverables. Reduces email back-and-forth |
| Before/after performance snapshots | Medium | Show channel state at engagement start vs now. Powerful retention tool |
| White-labeled portal feel | Low-Medium | Custom domain, agency branding, no "powered by" anything. Already inherent since it's custom-built |
| Notification system (email on new deliverable) | Medium | Email when something needs attention. Keeps clients engaged without requiring login |
| Onboarding checklist | Low-Medium | New clients see a guided setup (connect YouTube, confirm branding, etc.) |

### Anti-Features

| Feature | Reason |
|---------|--------|
| Real-time chat | Explicitly out of scope in PROJECT.md. Async thread is sufficient |
| Invoicing / payments | Out of scope. No billing through the site |
| Client self-service (edit their own data) | Clients consume dashboards, they don't manage them. Admin-only data entry for now |
| Multi-user per client account | Over-engineered for early stage. One login per client is enough |
| File versioning system | Deliverables are final assets, not collaborative documents. Upload and replace is sufficient |
| Third-party integrations marketplace | YouTube API is the only integration needed. No Zapier/webhook ecosystem |
| Custom report builder | Clients don't build their own reports. Julian curates what they see |
| Kanban/task board for clients | This is a dashboard, not a project management tool. Timeline view covers progress |

---

## Dependencies Between Features

```
Landing Page Form ──→ Supabase leads table ──→ (future: email notification to Julian)

Blog Articles ──→ Inline Audit CTA ──→ Same form/Supabase leads table

Authentication (Supabase Auth) ──→ All dashboard features depend on this

Channel Metrics ──→ YouTube Data API integration OR manual data entry
                   ──→ Visualizations depend on data shape being defined first

Deliverables ──→ File storage (Supabase Storage or S3)
              ──→ Approval workflow depends on deliverables existing first

Communication Thread ──→ Supabase table (messages)
                      ──→ Email notifications depend on thread existing

Project Timeline ──→ Supabase table (milestones)
                  ──→ Can share data model with deliverables (milestone has deliverables)

Structured Data (JSON-LD) ──→ Depends on blog article metadata being well-defined in MDX frontmatter

OG Images ──→ Depends on blog metadata + a generation script/API route
```

### Critical Path (Phase 1 → Phase 2 → Phase 3)

**Phase 1: Landing Page** (no dependencies on other phases)
- All landing page features are self-contained
- Form submissions go to Supabase leads table
- Deploy target: 3 days (per PROJECT.md constraint)

**Phase 2: Blog** (light dependency on Phase 1)
- Shares layout shell, navigation, footer with landing page
- Inline audit CTA reuses the same form component from Phase 1
- MDX pipeline + SSG is independent work

**Phase 3: Dashboard** (depends on auth infrastructure)
- Supabase Auth must be set up first (auth tables, RLS policies)
- YouTube API integration is the highest-risk item (API quota, OAuth consent screen, data freshness)
- Deliverables need a storage decision (Supabase Storage is simplest)
- Communication thread and timeline are independent of each other but both need auth

### Risk Flags

| Risk | Impact | Mitigation |
|------|--------|------------|
| YouTube API quota / OAuth complexity | Dashboard metrics blocked | Start with manual data entry, add API later |
| Dashboard scope creep | Phase 3 never ships | Ship MVP: metrics view + deliverables list + thread. No approval workflow in v1 |
| Blog OG image generation | Delays blog launch | Use static fallback OG image initially, generate per-article later |
| Animation performance on mobile | Landing page feels sluggish | Profile on real devices early. prefers-reduced-motion is the escape hatch |

---

## Summary: Build Priority

1. **Landing page with form** -- the conversion engine. Ship first, validate.
2. **Blog with 2-3 articles** -- SEO takes months to compound. Start early.
3. **Dashboard MVP** (auth + metrics view + deliverables) -- client retention. Can be lean at launch.
4. **Dashboard v2** (thread, timeline, approval workflow, notifications) -- iterate based on client feedback.

Sources:
- [AgencyAnalytics YouTube Dashboard](https://agencyanalytics.com/dashboards/youtube-dashboard)
- [15 Best Client Portals for 2026](https://www.weweb.io/blog/client-portals-buying-guide)
- [Client Portals for Marketing Agencies](https://www.knack.com/blog/client-portals-for-marketing-agencies/)
- [Top 10 Client Dashboard Software for Agencies 2026](https://www.fanruan.com/en/blog/top-client-dashboard-software-for-agencies)
- [Landing Page Optimization Guide 2026](https://vwo.com/landing-page-optimization/)
- [Landing Page Best Practices 2026](https://lovable.dev/guides/landing-page-best-practices-convert)
- [Full Technical SEO Checklist 2026](https://www.yotpo.com/blog/full-technical-seo-checklist/)
- [7 Best Client Portals for Marketing Agencies 2026](https://www.moxo.com/blog/best-client-portals-for-marketing-agencies)
