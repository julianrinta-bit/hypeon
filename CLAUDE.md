<!-- GSD:project-start source:PROJECT.md -->
## Project

**Hype On Media — Website Platform**

A full-stack website platform for Hype On Media FZCO (YouTube performance agency, Dubai). Migrating from a polished single-page HTML maquette to a Next.js application with three capabilities: a marketing landing page, an SEO-optimized blog, and an authenticated client portal with dashboard.

**Core Value:** The landing page must convert visitors into free audit submissions. Every other feature (blog, portal) exists to support that conversion — either by driving traffic (blog/SEO) or by retaining clients (portal).

### Constraints

- **Timeline**: Phase 1 (landing page) must be live within 3 days
- **Infrastructure**: Must coexist with Orbit on the same DigitalOcean server (different PM2 process, different nginx location block, different port)
- **Design fidelity**: Every animation and interaction from the HTML maquette must be preserved in React
- **Faceless brand**: No individual names or photos anywhere on the public site
- **SEO**: Blog pages must be server-rendered / statically generated for indexation
- **Auth**: Client portal must be behind authentication (Supabase Auth)
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Runtime
| Component | Version | Confidence | Rationale |
|-----------|---------|------------|-----------|
| **Node.js** | 24.x LTS (Krypton) | High | Current LTS, supported through April 2028. Server already runs Node for Orbit — use nvm to manage versions if Orbit pins an older one. |
| **npm** | 11.x (ships with Node 24) | High | No reason to add pnpm/yarn to a single-developer project. npm workspaces not needed (monorepo not in scope). |
## Framework & Rendering
| Package | Version | Confidence | Rationale |
|---------|---------|------------|-----------|
| **next** | 16.2.x | High | Latest stable (released 2026-03-18). App Router is the default. Turbopack dev is 400% faster. SSG for landing + blog, SSR for dashboard — all native. |
| **react** | 19.x | High | Ships with Next.js 16. Server Components, Actions, `use()` hook all stable. |
| **react-dom** | 19.x | High | Matches React version. |
| **sharp** | 0.34.x | High | Required for Next.js image optimization in self-hosted production (`next start`). Not optional on DigitalOcean — without it, image optimization falls back to slow `squoosh`. |
### What NOT to use
- **Next.js Pages Router** — Legacy. App Router is the default since Next.js 13. No reason to use Pages for a greenfield project.
- **Remix / Astro** — Astro is excellent for content sites but the client portal needs React interactivity. Remix adds no value over Next.js App Router for this use case.
- **Vite + React** — No SSG/SSR out of the box. Would require reinventing what Next.js provides.
## Content Layer (Blog)
| Package | Version | Confidence | Rationale |
|---------|---------|------------|-----------|
| **velite** | 0.2.x | High | Turns MDX/YAML/JSON into a typed data layer with Zod schema validation. Active development, Contentlayer replacement. Works with Turbopack. |
| **@mdx-js/mdx** | 3.x | High | MDX v3 compiler — velite uses this under the hood. |
| **rehype-pretty-code** | 0.14.x | Medium | Syntax highlighting for code blocks in blog posts (uses Shiki). Better than rehype-highlight. |
| **rehype-slug** + **rehype-autolink-headings** | latest | High | Anchor links on headings for blog SEO and UX. |
### Why velite over alternatives
| Option | Verdict | Reason |
|--------|---------|--------|
| **Contentlayer** | Dead | Abandoned since 2023. Does not support Next.js 14+, let alone 16. |
| **@next/mdx** | Too basic | No frontmatter support, no typed collections, no content validation. Fine for docs pages, not for a blog with structured metadata. |
| **next-mdx-remote** | Security risk | CVE-2026-0969 affected versions 4.3.0–5.0.0. v6.0.0 patches it with `blockJS: true` by default, but the library is oriented toward remote/dynamic MDX, not local files. Velite is simpler for file-based content. |
| **next-mdx-remote-client** | Unnecessary complexity | Fork of next-mdx-remote. Useful if loading MDX from a CMS — not needed when files are in the repo. |
| **Custom fs + compileMDX** | Maintenance burden | Rolling your own content layer means hand-writing frontmatter parsing, type generation, and caching. Velite does this in ~20 lines of config. |
### Blog file structure (velite pattern)
## Styling
| Package | Version | Confidence | Rationale |
|---------|---------|------------|-----------|
| **globals.css** (no library) | N/A | High | Board decision: preserve cascade and custom properties from the HTML maquette. No CSS-in-JS, no Tailwind. All current CSS stays in one file initially. |
| **CSS custom properties** | N/A | High | Design tokens (#FFD300, font stacks, spacing) defined as `--var` in `:root`. Already used in the maquette. |
| **CSS Modules** | Built into Next.js | Medium | Use for component-scoped styles only when globals.css becomes unwieldy (Phase 2+). Not needed in Phase 1. |
### What NOT to use
- **Tailwind CSS** — The maquette has ~4000 lines of handcrafted CSS with complex animations, custom properties, and cascade dependencies. Rewriting into Tailwind utilities would take longer than migrating the CSS as-is and add no value. Wrong tool for preserving an existing design system.
- **styled-components / Emotion** — Runtime CSS-in-JS. Performance penalty with Server Components (requires client boundary). Unnecessary when you have a working CSS file.
- **Sass/SCSS** — Adds a build dependency for nesting and variables that CSS already supports natively in 2026 (`:has()`, `@layer`, nesting, custom properties all shipped).
## Animation
| Package | Version | Confidence | Rationale |
|---------|---------|------------|-----------|
| **motion** (formerly framer-motion) | 12.36.x | High | Import from `motion/react`. Needed for: magnetic cursor, parallax, count-ups, section reveals, accordion transitions. The maquette uses vanilla JS for these — React equivalents need a declarative animation library. |
### What NOT to use
- **framer-motion** (old package name) — Same library, but `motion` is the current package. New projects should use `motion`.
- **GSAP** — Powerful but overkill. License complexity (free for personal use, paid for commercial). Motion covers every animation in the maquette.
- **react-spring** — Less ecosystem adoption than Motion. Fewer examples, less documentation for Next.js App Router.
- **CSS-only animations** — Use for simple transitions (hover, focus). Not sufficient for scroll-triggered parallax, magnetic cursor, or orchestrated sequences.
## Authentication & Database
| Package | Version | Confidence | Rationale |
|---------|---------|------------|-----------|
| **@supabase/supabase-js** | 2.99.x | High | Already used by Orbit. Same Supabase project, separate tables. |
| **@supabase/ssr** | latest | High | Replaces deprecated `@supabase/auth-helpers-nextjs`. Handles cookie-based sessions in Server Components, middleware, and Route Handlers. Two functions: `createBrowserClient` + `createServerClient`. |
### Auth strategy
- Magic link (email) for client portal login. No passwords to manage.
- Supabase RLS (Row Level Security) on portal tables — clients see only their own data.
- Middleware (`middleware.ts`) refreshes tokens and protects `/portal/*` routes.
### What NOT to use
- **NextAuth.js / Auth.js** — Adds a second auth system. Supabase Auth already handles everything: sessions, magic links, RLS integration. Using both creates token conflicts.
- **Clerk / Kinde** — Third-party auth providers. Adds cost, vendor lock-in, and complexity when Supabase Auth is already in the stack.
- **@supabase/auth-helpers-nextjs** — Deprecated. Use `@supabase/ssr` instead.
## Forms & Validation
| Package | Version | Confidence | Rationale |
|---------|---------|------------|-----------|
| **react-hook-form** | 7.x (stable) | High | Minimal re-renders, uncontrolled components. The audit form has multiple fields — RHF handles state without performance cost. v8 is in beta — do not use yet. |
| **@hookform/resolvers** | 5.2.x | High | Connects RHF to Zod for schema validation. |
| **zod** | 4.3.x | High | Runtime validation + TypeScript type inference. Already used by velite for content schemas — one validation library for everything. |
### What NOT to use
- **Formik** — Heavier, more re-renders, less maintained than RHF. No advantage in 2026.
- **react-hook-form v8** — Still in beta (v8.0.0-beta.1, Jan 2026). Breaking changes. Wait for stable.
- **yup** — Zod is strictly better: smaller bundle, native TypeScript inference, same API surface.
## SEO
| Package | Version | Confidence | Rationale |
|---------|---------|------------|-----------|
| **Next.js built-in Metadata API** | (part of Next.js 16) | High | `generateMetadata()` in layouts/pages. OG images via `opengraph-image.tsx`. Sitemap via `app/sitemap.ts`. Robots via `app/robots.ts`. No external packages needed. |
### What NOT to use
- **next-sitemap** — Last published 3 years ago (v4.2.3). Next.js App Router has native `sitemap.ts` and `robots.ts` file conventions. Zero dependencies needed.
- **next-seo** — Designed for Pages Router. The App Router Metadata API replaces it entirely.
## Deployment Stack (DigitalOcean)
| Component | Version/Config | Confidence | Rationale |
|-----------|---------------|------------|-----------|
| **PM2** | latest | High | Already running Orbit. New PM2 process for Hype On (`ecosystem.config.js`). Different port (e.g., 3100, Orbit is on 3000). |
| **nginx** | system package | High | Reverse proxy. New `server` block for `hypeon.media` → `localhost:3100`. Separate from Orbit's block. |
| **certbot** | system package | High | SSL via Let's Encrypt. `certbot --nginx -d hypeon.media -d www.hypeon.media`. |
| **next start** | (part of Next.js) | High | Production server. Do NOT use `next export` (static export) — the dashboard needs SSR and API routes. |
### PM2 ecosystem config (pattern)
### nginx pattern
### Build & deploy flow
### What NOT to use
- **Vercel** — Board decision: DigitalOcean. Server is already paid for. Full control over caching, SSL, and coexistence with Orbit.
- **Docker** — Adds complexity for a single Next.js app. PM2 is sufficient. Docker makes sense at 5+ services, not 2.
- **output: 'standalone'** — Useful for Docker containers. With PM2 + `next start` in the repo directory, standard output mode is simpler and well-supported.
## Dev Tooling
| Package | Version | Confidence | Rationale |
|---------|---------|------------|-----------|
| **typescript** | 5.7.x | High | Type safety across the entire project. Next.js 16 has first-class TS support. |
| **eslint** | 9.x | High | Next.js ships `eslint-config-next`. Use flat config (`eslint.config.mjs`). |
| **prettier** | 3.x | Medium | Optional but useful for consistent formatting. Single developer — less critical than in a team. |
### What NOT to use
- **Biome** — Fast linter/formatter but `eslint-config-next` catches Next.js-specific issues (Image alt text, Link usage, metadata). Biome does not have these rules.
## Full dependency list (copy-paste ready)
### Production
### Development
### Total: 14 direct dependencies (7 prod, 7 dev)
## Explicitly NOT in this stack
| Omission | Reason |
|----------|--------|
| **Tailwind CSS** | Existing 4000-line CSS maquette. Migration cost > benefit. |
| **shadcn/ui** | Requires Tailwind. Also, the landing page has a fully custom design — component libraries homogenize. Portal dashboard could use it later if the CSS approach becomes painful. |
| **Prisma / Drizzle** | Supabase JS client handles all DB operations. Adding an ORM is redundant unless you outgrow Supabase's query builder. |
| **tRPC** | Single developer, no API contract issues. Server Actions + Supabase client cover all data fetching. |
| **Storybook** | Single developer, no component library handoff. Adds significant devDependencies. Revisit if the team grows. |
| **Playwright / Cypress** | Out of scope for Phase 1. Add Playwright for portal E2E tests in Phase 2. |
| **Sentry / error tracking** | Not Phase 1. PM2 logs + Supabase dashboard sufficient initially. |
| **Analytics** | Add Plausible or Umami (self-hosted) post-launch. Not a stack dependency. |
| **Redis** | No caching layer needed. SSG pages are static files. Portal data is real-time from Supabase. |
## Risk register
| Risk | Mitigation |
|------|------------|
| Next.js 16.2 is 3 days old — potential bugs | Pin exact version in package.json. Update after 16.2.1+ patch. |
| React 19 Server Components + motion (client-only) | Mark animation components with `'use client'`. Static content stays in Server Components. Clear boundary. |
| Velite is pre-1.0 (0.2.x) | Low blast radius — it runs at build time only, outputs static JSON. If it breaks, replacing it with manual `fs` + `compileMDX` is a few hours of work. |
| Sharp native bindings on DigitalOcean | Ubuntu + Node 24 LTS: `npm install sharp` compiles cleanly. Test during first deploy. Fallback: `NEXT_SHARP_PATH` env var to prebuilt binary. |
| Coexistence with Orbit on same server | Different PM2 process, different port, different nginx server block, different directory. No shared state. Already proven pattern (Orbit lab runs alongside prod). |
- [Next.js 16.2 Release](https://nextjs.org/blog/next-16)
- [Next.js Releases](https://github.com/vercel/next.js/releases)
- [Supabase JS SDK (npm)](https://www.npmjs.com/package/@supabase/supabase-js)
- [Supabase SSR Auth Docs](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Velite (GitHub)](https://github.com/zce/velite)
- [Motion (formerly Framer Motion)](https://motion.dev/)
- [Sharp (npm)](https://www.npmjs.com/package/sharp)
- [Node.js Releases](https://nodejs.org/en/about/previous-releases)
- [Zod v4 Release Notes](https://zod.dev/v4)
- [React Hook Form + Zod Guide 2026](https://dev.to/marufrahmanlive/react-hook-form-with-zod-complete-guide-for-2026-1em1)
- [next-mdx-remote Vulnerability (CVE-2026-0969)](https://cyberpress.org/vulnerability-in-next-mdx-remote-enables/)
- [Next.js Metadata API](https://nextjs.org/docs/app/guides/mdx)
- [Contentlayer Alternatives](https://www.wisp.blog/blog/contentlayer-has-been-abandoned-what-are-the-alternatives)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

## Conventions — Learned the Hard Way

### CSS Specificity

**`.prose a` overrides EVERYTHING inside articles.** Any `<a>` element inside `.prose` inherits `color: var(--accent)` (gold text). This makes buttons with gold background + dark text INVISIBLE. Always add `.prose .your-button-class` with `color: var(--bg) !important` and `text-decoration: none !important` when placing clickable elements inside prose.

**`mix-blend-mode: difference` is dangerous on navbars.** It inverts colors against whatever is below — works on solid dark hero, becomes invisible over lighter sections. Use glassmorphism instead: `backdrop-filter: blur(14px) saturate(160%)` + `rgba(9, 9, 11, 0.82)` background on scroll.

### Next.js + Velite Pipeline

**Velite `clean: true` deletes images before Next.js serves them.** Always use `clean: false` in velite.config.ts. The build script is `"build": "velite build && next build"` — velite runs FIRST and completes before Next.js starts. Never rely on the async `import('velite').then(...)` in next.config.ts for production builds — this causes race conditions where images aren't ready.

**Velite requires `slug:` in frontmatter.** Without it, articles are silently skipped — no error, no warning. Always include `slug: {directory-name}` matching the folder name. After any batch content generation, verify with: `grep -rL "^slug:" content/blog/*/index.mdx`

**`aspect-ratio` conflicts with Next.js Image component.** Next.js `<Image>` sets explicit `width` and `height` attributes. Adding CSS `aspect-ratio` with a different ratio causes cropping/distortion. Either match the ratio exactly or use `height: auto` and let the image size naturally.

### Navigation

**Anchor links must be absolute from subpages.** Use `/#section` not `#section`. Links like `#proof` only work on the landing page — from `/blog` or `/login` they resolve to nothing.

**Every page needs a way back.** Blog → "← Back to home". Article → "← All articles". Login → "← Back to home" + clickable logo. No dead ends.

**Mobile menu must mirror desktop nav.** If desktop has "Log in", mobile must too. Audit both when adding any nav link.

### Accessibility

**Modals and overlays need focus traps.** When open: Tab/Shift+Tab cycles within the modal. On close: restore focus to the trigger element. Use `inert` attribute on closed overlays to prevent tab-through.

**`document.body.style.overflow = 'hidden'` must be cleaned up on unmount.** If a component sets overflow hidden (for modals, menus), add `useEffect(() => () => { document.body.style.overflow = ''; }, [])`.

**`role="navigation"` on `<nav>` and `role="contentinfo"` on `<footer>` are redundant.** HTML5 semantic elements already have implicit ARIA roles.

### Blog Design

**Counter animations (0 → 5B+) feel cheap in 2026.** Show values instantly. Keep data visualizations (sparklines, bar charts) — those add value.

**Cover images must be visible on dark backgrounds.** Black-on-black placeholders are invisible. Use gradient + typography covers with brand colors.

**Cover images must be unique per article.** Copying the same file to 50 folders makes the grid look broken.

**Thumbnails use "HYPE ON MEDIA" as a subtle watermark** — NOT a bottom bar, NOT a logo stamp. The watermark should be barely visible (8-12% opacity white text), positioned bottom-right or bottom-left. It says "this came from Hype On" without being a design element.

**Thumbnail typography should hint at the website's brand** — use the same font family as the hero (Plus Jakarta Sans for display, or a condensed bold variant). Brand color hints: #FFD300 (gold) as accent, #0A0A0A (near-black) as base. But thumbnails are NOT forced into the website palette — they use whatever works best for CTR, with subtle brand cues.

**Obsidian linking rule:** Every new framework, skill, or engagement doc must have a `## Related` section with `[[wiki-links]]` to connected documents. See vault CLAUDE.md for full linking rules.

**Text inside articles should be 18px (`1.125rem`) on a 720px column.** This gives ~70 characters per line — optimal reading measure.

**Articles need a two-column layout on desktop (≥1100px).** 720px body + 240px sticky TOC sidebar = ~1000px total. The outer container must be 1000px, not 720px, or the sidebar squeezes the body.

**55+ articles require pagination.** Show 12 at a time with a "Load more" button and a search bar. Never render all posts in one grid — it's slow and overwhelming.

**Search bar must be visible on dark themes.** `rgba(255,255,255,0.05)` is invisible on `#0A0A0A`. Use at minimum `rgba(255,255,255,0.18)` border + search icon + focus glow (`box-shadow: 0 0 0 3px rgba(255,255,255,0.06)`).

**Scroll-to-top button is needed on long pages (8+ sections).** 44×44px circle, bottom-right, glassmorphism at rest, accent fill on hover, appears after 1vh scroll. On mobile, position `bottom: 88px` to sit above any sticky CTA.

### Blog Content (AEO/GEO/SEO)

**Every H2 must be followed by a 40-60 word answer block.** This is what AI chatbots and Google AI Overviews extract.

**Every article must end with an FAQ section.** 3-5 Q&A items with specific, data-backed answers.

**Never say "AI will let you do it yourself."** Always say "Hype On already does this." See `.claude/skills/hypeon-blog-writer/SKILL.md` for the full brand voice guide.

### Deployment

**Server port 3400** for Hype On website (Orbit uses 3000, 3100 was taken by PM2 daemon, 3200/3202/3300 by other Orbit processes).

**Deploy sequence:** `git push` → SSH to alpha → `git pull && npm run build && pm2 restart hypeon-website`.

**PM2 ecosystem file must be `.cjs`** because package.json has `"type": "module"`. `module.exports` syntax doesn't work in `.js` files.

### GSD Plan Files

**Frontmatter must be the VERY FIRST thing in the file** (line 1 = `---`). Heading goes AFTER the closing `---`. The GSD tool takes the LAST `---` block in the file, so code examples with `---` break parsing.

**No parenthetical comments in `files_modified`** values. `- src/app/layout.tsx (add X)` breaks YAML. Use `- src/app/layout.tsx` only.

**`depends_on` uses plan IDs, not filenames.** Use `[01-01]` not `[01-PLAN-01]`.

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
