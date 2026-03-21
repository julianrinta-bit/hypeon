# Pitfalls — Hype On Media Website Platform

Common failure modes for Next.js agency website projects, specifically calibrated to this stack: HTML maquette migration, App Router SSG/SSR, MDX blog, Supabase auth portal, self-managed DigitalOcean deployment with PM2 + nginx.

---

## 1. Animation Breakage During React Migration

Converting vanilla JS animations (IntersectionObserver, requestAnimationFrame, GSAP timelines, magnetic cursor, parallax) into React components is the single highest-risk task. Animations that depend on direct DOM manipulation silently break when React re-renders the component tree.

**Warning signs:**
- Animations fire on mount but not on route changes
- Scroll-triggered counters re-trigger when navigating back
- Magnetic cursor loses tracking after a state update
- `useEffect` cleanup not running, leaving orphaned event listeners and memory leaks

**Prevention strategy:**
- Wrap every animation in a dedicated Client Component with explicit `useRef` + `useEffect` cleanup
- Never mix `useState` triggers with animation timelines — let refs own the DOM nodes
- Test each animation in isolation before composing into page layouts
- Add `prefers-reduced-motion` media query from day one, not as an afterthought

**Phase:** Phase 1 (Landing Page migration) — must be resolved before launch.

---

## 2. Hydration Mismatch From Porting Raw HTML

Pasting HTML maquette markup into JSX without conversion causes hydration errors. Common offenders: `class` vs `className`, `for` vs `htmlFor`, self-closing tags, inline `style` strings, `onclick` handlers, and HTML comments.

**Warning signs:**
- Console floods with "Hydration failed because the server-rendered HTML didn't match the client"
- Layout flickers on initial load (server HTML replaced by client render)
- Suppressing hydration warnings with `suppressHydrationWarning` instead of fixing root cause

**Prevention strategy:**
- Use an automated JSX converter on the maquette HTML before touching it manually
- Treat every hydration warning as a bug, never suppress
- Validate that Server Components contain zero browser APIs (`window`, `document`, `localStorage`)

**Phase:** Phase 1 — catches fire immediately during migration.

---

## 3. Client/Server Component Boundary Confusion

App Router's Server Components are the default. Importing a hook (`useState`, `useEffect`, `useRef`) or browser API in a Server Component crashes the build. The inverse problem: marking everything `"use client"` defeats SSG and bloats the JS bundle.

**Warning signs:**
- Entire page wrapped in `"use client"` because one child needs interactivity
- Static marketing content shipping as client-side JavaScript
- `window is not defined` errors during build or SSR

**Prevention strategy:**
- Keep page-level components as Server Components; push interactivity into small leaf Client Components
- Structure: `page.tsx` (Server) renders `<HeroSection>` (Server for markup) which contains `<CountUpNumber client>` (Client for animation)
- Never pass functions as props from Server to Client Components — serialize data only

**Phase:** Phase 1 — architectural decision that cascades through every phase.

---

## 4. globals.css Cascade Conflicts With Component Isolation

The decision to keep a monolithic `globals.css` preserves the maquette's cascade but creates landmines: class name collisions between page sections, specificity wars when adding blog/portal styles, and CSS custom properties leaking across routes.

**Warning signs:**
- Styling a blog element accidentally changes a landing page section
- `!important` declarations appearing to fix layout issues
- Custom properties defined globally but only meaningful in one context

**Prevention strategy:**
- Namespace all custom properties: `--hero-*`, `--blog-*`, `--portal-*`
- Use CSS Modules or scoped classes for blog and portal components added after Phase 1
- Keep `globals.css` for the landing page (it already works) but do not extend it for new features
- Document which selectors in `globals.css` are global resets vs section-specific

**Phase:** Phase 1 establishes the pattern; Phase 2 (Blog) and Phase 3 (Portal) must not pollute it.

---

## 5. MDX Build Configuration Rabbit Hole

MDX in Next.js App Router requires `@next/mdx` or `next-mdx-remote` or `contentlayer` — each with different trade-offs. Misconfiguring the MDX pipeline causes: no syntax highlighting, broken imports in MDX files, missing frontmatter parsing, or MDX pages not included in static generation.

**Warning signs:**
- Blog posts render as raw markdown text instead of HTML
- Custom components inside MDX files throw "Component not found" errors
- `generateStaticParams` not picking up MDX files, resulting in 404s
- Build times exploding because MDX is re-parsed on every request instead of at build time

**Prevention strategy:**
- Choose one MDX approach and commit: `next-mdx-remote` with `gray-matter` for frontmatter is the most flexible for file-based content
- Create a `content/blog/` directory with a clear naming convention (`slug.mdx`)
- Build a `getBlogPosts()` utility that reads the filesystem once and caches
- Test with 2 dummy posts before writing real content
- Verify that `generateStaticParams` produces correct paths and that pages are truly static (check `.next/server/app/blog/` for HTML files)

**Phase:** Phase 2 (Blog) — get the pipeline right before writing articles.

---

## 6. SEO Metadata Omissions

Next.js App Router uses `export const metadata` or `generateMetadata()` — not `<Head>` from Pages Router. Missing or incorrect metadata means blog posts are not indexable, OG images do not render on social shares, and canonical URLs are wrong.

**Warning signs:**
- Social media link previews show the site title instead of article title
- Google Search Console reports "Page is not indexed" for blog URLs
- Duplicate `<title>` tags in the HTML output
- No `sitemap.xml` or `robots.txt` served

**Prevention strategy:**
- Create a `generateMetadata()` function for every dynamic route (`/blog/[slug]`)
- Generate `sitemap.xml` using Next.js `sitemap.ts` convention
- Add `robots.ts` allowing crawlers on public pages, blocking `/portal/*`
- Validate with `curl -s URL | grep '<title>'` and Open Graph debuggers before launch
- Set canonical URLs explicitly to prevent `www` vs non-`www` duplication

**Phase:** Phase 2 (Blog) — non-negotiable for the blog's reason to exist.

---

## 7. Supabase Auth Session Handling in App Router

Supabase Auth with Next.js App Router requires `@supabase/ssr` (not the old `@supabase/auth-helpers-nextjs`). Session tokens must flow through cookies, and the middleware must refresh them. Getting this wrong means: users logged out on every page navigation, infinite redirect loops on protected routes, or sessions that work in dev but break in production.

**Warning signs:**
- User is authenticated but `getUser()` returns null on server-side page load
- Login succeeds but redirects back to login page
- Auth works on `localhost:3000` but not behind nginx reverse proxy
- Cookies set with wrong domain or path, invisible in browser dev tools

**Prevention strategy:**
- Use `@supabase/ssr` `createServerClient` in Server Components and middleware, `createBrowserClient` in Client Components
- Implement `middleware.ts` that refreshes the session on every request to `/portal/*`
- Test auth flow behind nginx from day one, not just in `next dev`
- Ensure nginx passes `Host`, `X-Forwarded-Proto`, and `X-Forwarded-For` headers — Supabase cookie domain depends on this
- Set `NEXT_PUBLIC_SITE_URL` correctly for the production domain

**Phase:** Phase 3 (Portal) — but test the auth plumbing in Phase 2 if possible.

---

## 8. PM2 + nginx Deployment Misconfigurations

Self-managed deployment has no guardrails. Common failures: wrong `NODE_ENV`, missing build step before restart, port conflicts with Orbit, nginx not proxying WebSocket (if needed), SSL renewal failing silently, and no zero-downtime deploy strategy.

**Warning signs:**
- `next start` runs in development mode (no static optimization)
- 502 Bad Gateway after deploy because PM2 restarted before `next build` finished
- Orbit goes down because both apps tried to bind the same port
- SSL certificate expires with no warning (certbot cron not set or email not configured)
- No logs visible — PM2 log rotation not configured, disk fills up

**Prevention strategy:**
- Deployment script (not manual commands): `git pull && npm ci && npm run build && pm2 reload hypeon --update-env`
- Use `pm2 reload` (graceful) not `pm2 restart` (hard kill)
- Assign a dedicated port (e.g., 3002) in `.env` and `ecosystem.config.js`, different from Orbit's
- nginx config: separate `server` block or `location` block for hypeon.media with `proxy_pass http://127.0.0.1:3002`
- Set up certbot with `--deploy-hook "nginx -s reload"` and verify renewal with `certbot renew --dry-run`
- Add PM2 startup script: `pm2 startup` + `pm2 save` so the app survives server reboots

**Phase:** Phase 1 (Deployment) — must be solid before anything goes live.

---

## 9. Static Generation Invalidation on Self-Managed Server

On Vercel, ISR (Incremental Static Regeneration) works out of the box. On a self-managed server with `next start`, ISR behavior depends on the cache handler. Without configuration, adding a new blog post requires a full rebuild and PM2 reload — there is no automatic revalidation.

**Warning signs:**
- New blog post published but the blog index still shows old content
- `revalidatePath` or `revalidateTag` calls do nothing in production
- Build times grow linearly with number of blog posts

**Prevention strategy:**
- For Phase 2 (5 articles), full SSG rebuild on deploy is perfectly fine — do not over-engineer
- Use `output: 'standalone'` in `next.config.js` for smaller deployment footprint
- When article count grows past ~20, evaluate adding a webhook that triggers `next build` on content change
- Do not implement ISR unless there is a concrete need — it adds complexity on self-hosted

**Phase:** Phase 2 (Blog) — accept the trade-off now, revisit if article volume demands it.

---

## 10. Form Submission Without Validation or Rate Limiting

The free audit form is the primary conversion mechanism. Shipping it without server-side validation and rate limiting invites spam bots to flood the Supabase `leads` table, corrupt analytics, and potentially hit Supabase row limits.

**Warning signs:**
- Supabase `leads` table filling with garbage entries (empty fields, lorem ipsum, bot signatures)
- No server-side validation — relying only on HTML `required` attributes
- Form accepts submissions faster than a human could type

**Prevention strategy:**
- Server Action or API route validates all fields (email format, non-empty name, URL format for channel link)
- Add a honeypot field (hidden input that bots fill, humans do not)
- Rate limit by IP: max 3 submissions per hour (implement in the API route or nginx)
- Optional: add Turnstile (Cloudflare) or hCaptcha if spam becomes a real problem — do not add it preemptively as it hurts conversion
- Return proper error messages to the client for validation failures

**Phase:** Phase 1 — the form ships with the landing page.

---

## 11. Environment Variable Leaks and Mismanagement

Next.js has a `NEXT_PUBLIC_` prefix convention. Variables without this prefix are server-only and invisible to the browser. Mixing this up leaks secrets to the client or makes public config unavailable where needed.

**Warning signs:**
- `SUPABASE_SERVICE_ROLE_KEY` visible in the browser's network tab or page source
- `NEXT_PUBLIC_SUPABASE_URL` undefined in a Client Component
- `.env.local` committed to git
- Different behavior between `next dev` and `next start` because env vars are baked at build time

**Prevention strategy:**
- Only two public variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Everything else (service role key, any secrets) stays server-only — no `NEXT_PUBLIC_` prefix
- Add `.env.local` and `.env` to `.gitignore` from the first commit
- Create `.env.example` with placeholder values for documentation
- In the deploy script, source env vars from a file on the server, not from the repo

**Phase:** Phase 1 — must be correct from the first commit.

---

## 12. Responsive Design Regression During Component Extraction

The HTML maquette is responsive. Extracting sections into React components often breaks responsive behavior because: media queries referenced parent selectors that no longer exist, viewport-dependent JS calculations lost their context, or flexbox/grid containers were split across component boundaries.

**Warning signs:**
- Desktop layout looks perfect, mobile layout is broken (or vice versa)
- Media queries in `globals.css` target selectors that were renamed during componentization
- Scroll-based animations jank on mobile because they were only tested on desktop

**Prevention strategy:**
- Test every component on mobile viewport (375px) immediately after extraction, not at the end
- Keep CSS media queries co-located with the selectors they modify — do not split a component's desktop and mobile styles across files
- Use browser DevTools device mode continuously during Phase 1
- The maquette's responsive breakpoints are the source of truth — document them once and reference consistently

**Phase:** Phase 1 — regressions compound if not caught during migration.

---

## 13. Dashboard Data Architecture Without a Contract

The client portal needs to display deliverables, metrics, timelines, and communication threads. Building the frontend before defining the Supabase schema and RLS (Row Level Security) policies leads to: data shape mismatches, N+1 query patterns, and security holes where clients can see each other's data.

**Warning signs:**
- Frontend mocks data with hardcoded JSON, then the real schema does not match
- No RLS policies — any authenticated user can query any row
- Dashboard makes 10+ Supabase calls per page load because tables were not designed for the access pattern
- `user_id` foreign key missing from tables, making RLS impossible to write

**Prevention strategy:**
- Define the Supabase schema and RLS policies before writing any dashboard UI
- Tables: `clients`, `deliverables`, `metrics_snapshots`, `timeline_events`, `messages` — all with `client_id` FK
- RLS: `auth.uid() = client_id` on every table, no exceptions
- Create a typed Supabase client with `supabase.gen.ts` from the CLI
- Build one vertical slice first (e.g., deliverables list) end-to-end before expanding

**Phase:** Phase 3 (Portal) — schema design happens before UI implementation.

---

## 14. Nginx Routing Conflicts With Orbit

Both Orbit and Hype On run on the same server. A misconfigured nginx setup can: route Hype On traffic to Orbit, break Orbit's existing functionality, or cause SSL certificate conflicts between domains.

**Warning signs:**
- Visiting `hypeon.media` shows the Orbit application
- Orbit stops working after adding the Hype On nginx config
- Certbot fails because both configs claim the same `server_name`
- WebSocket connections (if Orbit uses them) break after nginx changes

**Prevention strategy:**
- Hype On gets its own `server` block with `server_name hypeon.media www.hypeon.media`
- Orbit keeps its existing config untouched — do not modify it
- Run `nginx -t` before every `nginx -s reload`
- Obtain SSL cert for `hypeon.media` separately: `certbot --nginx -d hypeon.media -d www.hypeon.media`
- Test Orbit still works after every nginx config change

**Phase:** Phase 1 (Deployment) — get wrong once, two products go down.

---

## 15. Image Optimization Assumptions

Next.js `<Image>` component expects specific configuration for external images and static imports. The maquette likely uses raw `<img>` tags with unoptimized assets. Blindly converting to `<Image>` without configuration causes build errors or broken images in production.

**Warning signs:**
- `next/image` throws "Invalid src" for external URLs (YouTube thumbnails, etc.)
- Images work in dev but return 500 in production because Sharp is not installed
- Layout shifts (CLS) because width/height are not specified
- Massive bundle size because images are not optimized

**Prevention strategy:**
- Add external domains to `images.remotePatterns` in `next.config.js` (YouTube, any CDN)
- Install `sharp` as a production dependency for the self-hosted image optimizer
- Set explicit `width` and `height` on every `<Image>` to prevent CLS
- For decorative/background images where the optimization pipeline adds complexity, `<img>` with manual optimization (WebP export, srcset) is acceptable
- Use `priority` prop only on above-the-fold hero images

**Phase:** Phase 1 — affects Core Web Vitals from day one.

---

*This document covers architectural and deployment pitfalls. Design-specific pitfalls (typography, color, spacing, accessibility) are addressed by the design system and audit tools during implementation.*
