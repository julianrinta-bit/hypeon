# Redesign v2 — Blueprint de reconstrucción (hypeon.media)

Fuente de diseño: `/Users/julianrinta/projects/hypeon-website-v2-staging/design_handoff_hypeon_website/` (README.md + 5 .dc.html). Rama: `feature/redesign-v2`. Deploy: Vercel preview por rama = staging.

## Decisiones de producto
1. Landing = las 16 secciones EXACTAS del handoff. Se retiran del render `Work.tsx`, `UseCases.tsx`, `Guarantee.tsx` (archivos NO se borran). Actualizar los links del Nav que apunten a esas secciones.
2. Chat = prototipo por keyword-matching (copiar literal las respuestas de `HypeOn Chat.dc.html` líneas 223-244 a `src/lib/chat-responses.ts`). Sin IA real todavía.

## Fase 0 — Fundaciones (hecha por este agente)
- Rama `feature/redesign-v2` desde `feature/homepage-v2`. npm install + build baseline verde.
- Tokens light + clases `.section--white`/`.section--cream` + keyframes faltantes en globals.css (aditivo).

## Fase 0.3 — Route group para el shell (SIGUIENTE, secuencial, delicada)
Mover el shell (Nav, Footer, ExitIntentModal, ScrollToTop, StickyMobileCTA) del root `src/app/layout.tsx` a un nuevo `src/app/(marketing)/layout.tsx`. Root layout queda con `<html>`, fonts, pixel, noise, ScrollProgress. Mover `/` (page.tsx), `/blog`, `/privacy`, `/terms` DENTRO de `(marketing)`. `/chat` queda FUERA con su propio layout minimal. Verificar que las URLs NO cambian (route groups no afectan el path) y que cada ruta renderiza su shell correcto. Fallback si es muy arriesgado: dejar shell en root y que /chat oculte Nav/Footer vía CSS.

## Fase 1 — Shell + páginas nuevas
- Nav.tsx → fondo blanco, height 64px, texto dark, "Book a Call" verde + "Log in" ghost, blur on scroll, links a `/#seccion`. Arreglar links a secciones eliminadas.
- Footer.tsx → simplificar (logo+company izq, nav+social der, dark).
- CREAR `src/app/chat/layout.tsx` + `src/app/chat/page.tsx` (server lee searchParams.q) + `src/components/chat/ChatClient.tsx` (state messages/inputValue/isTyping/showChips; on mount con ?q= auto-envía tras 400ms). Nav minimal "Logo+Beta+← Back", sin Footer/ExitModal. max-width 760px. Bubbles user rgba(200,255,46,.1)/bot dark. Textarea auto-resize ≤120px, Enter=send Shift+Enter=newline.
- CREAR `src/lib/chat-responses.ts` → `getReply(q): {text, cta}` con las 6 ramas + fallback literales del .dc.html.
- Legal: conservar rutas `/privacy` y `/terms`; crear `src/components/legal/LegalTabs.tsx` (client, tabs que hacen router.push entre ambas, border-bottom verde en activo). Body 2-col prose + sticky sidebar. Reusa `.prose`.

## Fase 2 — Secciones LIGHT (paralelizable, 1 archivo por agente)
- 2.1 `AnalyticsDashboard.tsx`→`StatsProof.tsx`: `.section--white`, "Proof, not promises.", 6 cards 3×2, hairlines `--border-light`, borde verde top scaleX on scroll, CountUp 0→N (reusar observer+CountUp existentes). Cards: 22B+ views, $4M+/mo, 75+ channels, 15 langs, 48h audit, 20+ Play Buttons. Contraste ≥4.5:1.
- 2.2 `Showreel.tsx`→`Video.tsx`: `.section--white`, headline izq + `<video>` autoplay muted loop der, CTA "Book a Discovery Call →".
- 2.3 `ContentProduction.tsx`→`WhatWeMake.tsx`: `.section--cream`, 6 cards horizontal scroll hover→video (reusar useDragScroll/useAutoScroll). Categorías: Kids&Family, Documentaries, Podcasts, Influencers, Live Action, Brand Content. Imágenes propias en /public.
- 2.4 CREAR `FAQ.tsx`: `.section--white`, border-top 4px #111, 2-col sticky (headline izq sticky, accordion der), 7 items, active border-left verde, −/+. Reusar patrón accordion de Services.
- 2.5 CREAR `ClientPortal.tsx`: `.section--white`, 2-col copy izq + mockup der con borde verde top, CTA "Request Early Access →".

## Fase 3 — Secciones DARK (paralelizable)
- 3.1 `Hero.tsx` 2-col (+ CREAR `ChatWidget.tsx`): headline "YouTube,/Engineered." (engineerGlow), rotating word 3.2s, video embed der. ChatWidget: white card chatGlow, eq bars, dot, 3 chips, placeholder cicla 6/3.2s. On submit/chip/Enter → router.push('/chat?q='+encodeURIComponent(text)). Línea "3 new audit slots..." mono.
- 3.2 `Services.tsx`: accordion → tabs sticky 2-col, state activeService 0-4, active border-left verde. 5 servicios: Channel Strategy, Content Production, Thumbnail & SEO, Analytics & Reporting, Content Localization.
- 3.3 `CredibilityStrip.tsx`→`Ticker.tsx`: marquee 17 tipos de canal alternando verde/gris sep ◆, translateX(-50%) 40s.
- 3.4 `Testimonials.tsx`: reusar 3 quote cards + AÑADIR tabla comparativa YouTube(rojo)/IG/TikTok(gris). Headline "Your numbers are the only metric we care about."
- 3.5 `Different.tsx`→`Team.tsx`: stat grande izq (10+ yrs/6 countries/4 langs) + headline "Built inside the industry. Not outside it." Locations US·UAE·EUROPE·LATAM·E.EUROPE·ASIA.
- 3.6 `ContactForm.tsx`: SOLO CSS, `.form-input` → border-bottom, verde on focus. Lógica intacta (ya tiene los 4 campos).
- 3.7 `ExitIntentModal.tsx`: añadir input channel_url y pasarlo en la navegación. Resto intacto.
- 3.8 `LatestInsight.tsx`: 3-col grid, cards lift on hover, "See all →" → /blog. Thumbnails propios.

## Fase 4 — Blog (verificar, reusar)
Motor velite intacto. Verificar filter chips (7 categorías), reemplazar thumbnails placeholder por propios/generados con hypeon-imagery, verificar article template.

## page.tsx — orden final (integración, LO ÚLTIMO)
Hero → Ticker → StatsProof → Video → WhatWeMake → Services → Team → ClientPortal → Testimonials → LatestInsight → FAQ → ContactForm. (Nav/Footer/ExitModal en (marketing)/layout.)

## QA + deploy
Build limpio → verify by artifact (Work/UseCases/Guarantee NO en el DOM) → QA flujos con Chrome DevTools MCP → WCAG ≥4.5:1 (ojo --fg-dark-muted #888 ≈3.5:1 solo para texto grande; --accent verde nunca texto sobre blanco) → human visual QA → push a feature/redesign-v2 → preview Vercel → aprobación Julian → prod.
