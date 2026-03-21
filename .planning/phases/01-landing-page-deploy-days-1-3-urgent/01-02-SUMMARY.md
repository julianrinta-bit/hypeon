---
phase: 01
plan: 01-02
completed: 2026-03-21
---

# Plan 01-02 Summary: Sections + Animations

## What was built

All 14 landing page sections from the HTML maquette were converted to React components (Server Components for static content, Client Components for interactive elements). All 12 animation systems were migrated from vanilla JS to useRef + useEffect with IntersectionObserver, proper cleanup, and prefers-reduced-motion support via a shared useReducedMotion hook. The full landing page now renders with all sections composed in page.tsx with layout-level Nav, Footer, ScrollProgress, and CustomCursor.

## Key files created

- `src/hooks/useReducedMotion.ts` — shared reduced motion hook
- `src/components/ui/RevealOnScroll.tsx` — IntersectionObserver scroll reveal wrapper
- `src/components/ui/MagneticButton.tsx` — magnetic hover effect wrapper
- `src/components/ui/RotatingText.tsx` — cycling hero headline text
- `src/components/ui/ParallaxBgNumber.tsx` — parallax background section numbers
- `src/components/layout/ScrollProgress.tsx` — scroll progress bar
- `src/components/layout/CustomCursor.tsx` — custom cursor with hover states
- `src/components/layout/Nav.tsx` — Server Component navigation
- `src/components/layout/MobileMenu.tsx` — Client Component mobile hamburger menu
- `src/components/layout/Footer.tsx` — Server Component footer with social SVGs
- `src/components/landing/Hero.tsx` — Hero section with RotatingText and ParallaxBgNumber
- `src/components/landing/Ticker.tsx` — CSS-only infinite ticker
- `src/components/landing/TrustStrip.tsx` — Trust signals strip
- `src/components/landing/CredibilityStrip.tsx` — Credentials strip
- `src/components/landing/Showreel.tsx` — YouTube embed with youtube-nocookie
- `src/components/landing/AnalyticsDashboard.tsx` — 6-card analytics dashboard with count-ups, sparkline, bar chart, dots grid, play buttons, segments bar, and cost reduction animations (353 lines)
- `src/components/landing/Services.tsx` — Service accordion (3 items)
- `src/components/landing/Process.tsx` — 6-step process timeline
- `src/components/landing/Work.tsx` — 4 work/case study cards
- `src/components/landing/Testimonials.tsx` — 3 testimonial cards
- `src/components/landing/Different.tsx` — Two-column differentiator section
- `src/components/landing/About.tsx` — Two-column about section
- `src/components/landing/FAQ.tsx` — FAQ accordion (8 items)
- `src/app/page.tsx` — Full page composition with all sections and dividers
- `src/app/layout.tsx` — Updated with ScrollProgress, CustomCursor, Nav, Footer

## Deviations from plan

- The plan's acceptance criteria expected 10+ FAQ items but the maquette only contains 8 FAQ items. The component faithfully reproduces the maquette.
- CustomCursor uses `document.querySelectorAll` for hover targets (a, button, .service-item, .work-card) because these are global document-wide targets that cannot be captured by a single ref. This matches the plan's own code in task 1.2.7.

## Issues encountered

- TypeScript null-check error in CustomCursor.tsx: `dot` variable captured in closures was flagged as possibly null despite the early return guard. Fixed by assigning to an explicitly typed `const dot: HTMLDivElement = el`.
- No other build errors encountered. `npm run build` exits with code 0.
