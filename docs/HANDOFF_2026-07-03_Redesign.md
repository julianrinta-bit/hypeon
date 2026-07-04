# HANDOFF — hypeon.media Redesign V2
**Date:** 2026-07-03 | **Repo:** `~/projects/hypeon-website` | **Branch:** `feature/redesign-v2` | **Last commit:** `4b6d792`

---

## PROMPT DE ARRANQUE (copy-paste para abrir la próxima sesión)

```
Seguimos con el rediseño de hypeon.media. Lee el handoff completo en `~/projects/hypeon-website/docs/HANDOFF_2026-07-03_Redesign.md`. Repo `~/projects/hypeon-website`, rama `feature/redesign-v2`. Estamos calcando 1:1 el mockup de Claude Design (los `.dc.html` en `~/projects/hypeon-website-v2-staging/design_handoff_hypeon_website/` son la fuente de verdad, NO el README). Retoma en este orden: (1) badge 'CLIENT PORTAL' → dejar solo el dot verde (quitar el azul/morado); (2) retratos hablados de los placeholders restantes (creator strip del hero, poster del video, thumbnails del blog); (3) destino del botón 'Book a Call'; (4) quitar protección SSO del preview de Vercel; (5) promover a producción por DigitalOcean. Método de imágenes = 'retrato hablado' (ver handoff, reglas de Julian). Deploy = Vercel preview + alias `hypeon-redesign.vercel.app`, pero VERIFICA por el URL directo del último deploy (el alias cachea con el SSO).
```

---

## 1. FUENTE DE VERDAD — Origen del diseño

- **ZIP original** entregado por Claude Design: `~/Downloads/Hype On Media Website.zip`
- **Extraído a:** `~/projects/hypeon-website-v2-staging/design_handoff_hypeon_website/`
- **Contenido del ZIP:**
  - `README.md` — handoff de Claude Design: secciones, tokens, animaciones, tabla de botones a conectar, notas Next.js
  - `landing-v2.dc.html` — mockup de la Landing principal
  - `blog.dc.html` — mockup del Blog
  - `article.dc.html` — mockup de Article individual
  - `legal.dc.html` — mockup de Legal (privacy/terms)
  - `chat.dc.html` — mockup del Chat
  - `assets/email-logo.png` — logo para emails

### ⚠️ REGLA CRÍTICA: `.dc.html` > README

El README describe el diseño pero **difiere** del `.dc.html` renderizado en varios puntos (colores exactos, orden de secciones, presencia/ausencia de elementos). **LOS `.dc.html` SON LA FUENTE DE VERDAD.** Calcar leyendo sus valores exactos (colores hex, tipografía, spacing, orden de secciones). NO interpretar el README.

**Por qué:** Una primera reconstrucción basada en el README dio 58% de fidelidad visual. Corregida leyendo el `.dc.html` directamente, subió a alta fidelidad. La diferencia cuesta una sesión entera.

El mockup también es visible en la app Claude Design (claude.ai/design).

---

## 2. ESTADO TÉCNICO DEL REPO

### Stack
- **Framework:** Next.js 16.2, React 19
- **Estilos:** CSS vanilla en un único `src/app/globals.css`
  - **REGLA:** el CSS es ADITIVO. Solo añadir bloques comentados al final. NUNCA borrar reglas base existentes.
- **Blog:** velite (MDX local) — posts en `content/posts/`
- **Fuentes:** cargadas vía next/font en root layout
- **Pixel/noise:** `ScrollProgress` + noise overlay en root layout

### Arquitectura de layouts (route group)

```
src/app/
├── layout.tsx                  ← Root: html, fonts, pixel, noise, ScrollProgress
├── (marketing)/
│   ├── layout.tsx              ← Shell: Nav + Footer + ExitIntentModal
│   ├── page.tsx                ← Landing homepage
│   ├── blog/
│   ├── legal/
│   └── ...
└── chat/
    ├── layout.tsx              ← Layout minimal (sin Nav/Footer)
    └── page.tsx
```

El route group `(marketing)` se creó para que `/chat` tenga layout minimal propio. El root layout no incluye Nav/Footer; eso queda en el layout del grupo.

### Archivos clave
| Archivo | Qué hace |
|---|---|
| `src/app/globals.css` | TODO el CSS del rediseño (tokens + componentes) |
| `src/app/(marketing)/page.tsx` | Landing: composición de todas las secciones |
| `src/components/sections/Hero.tsx` | Hero con chat widget y creator strip |
| `src/components/sections/StatsProof.tsx` | Stats multicolor sobre fondo cream |
| `src/components/sections/Services.tsx` | Services fondo blanco |
| `src/components/sections/WhatWeMake.tsx` | Grid 3×2 de formatos con imágenes |
| `src/components/sections/WhyHypeOn.tsx` | Sección creada desde cero (faltaba) |
| `src/components/sections/ClientPortal.tsx` | Badge + CTA + logo "h" en dashboard |
| `src/components/sections/Testimonials.tsx` | Featured (Daniel K.) + 2 cards |
| `src/components/sections/Team.tsx` | Stats estáticos + headline Distilled/Deployed |
| `src/components/sections/Video.tsx` | Poster placeholder |
| `src/components/sections/LatestInsight.tsx` | Blog strip con thumbnails |
| `src/lib/chat-responses.ts` | Keyword-matching para el chat widget |
| `public/images/whatwemake/` | Las 6 imágenes reales de What We Make |
| `docs/REDESIGN_V2_BLUEPRINT.md` | Blueprint técnico de la arquitectura |
| `qa-screenshots/` | Screenshots de QA visual |
| `scripts/generate-influencers-card.mjs` | Script base reutilizable para retratos hablados |

---

## 3. LO QUE HICIMOS — Calco del mockup (de 58% a alta fidelidad)

### 3.1 Route group + tokens

Creado el route group `(marketing)/` con su propio layout. Tokens light/cream añadidos de forma aditiva en `globals.css` (bloques comentados al final, sin tocar los tokens base).

### 3.2 Las 9 divergencias corregidas (en orden de trabajo)

**1. Hero centrado, 1 columna, headline "YouTube./Engineered."**
- Layout centrado 1 columna (el README sugería 2 columnas).
- Headline animado con texto rotante: el keyframe `heroWord` termina en `opacity:0` (es el comportamiento correcto del rotante). El headline principal usa `heroFadeIn`. No confundir los dos keyframes.

**2. Stats/Proof MULTICOLOR sobre fondo cream**
- 6 stat-cards, cada una con su propio acento: indigo / verde / ámbar / teal / violeta / rojo.
- Julian aprobó multicolor explícitamente para ESTE proyecto. El mockup manda sobre la regla general de acento único.
- Cifras: **22B+ views** (Julian autorizó — total sumando su equipo). Resto de stats del mockup: 75+ channels, $4M+/mo, 15 languages, 48h turnaround, 20+ Play Buttons. Confirmadas por Julian.

**3. Services fondo BLANCO**
- El README decía cream; el `.dc.html` muestra blanco. Se usó blanco.

**4. What We Make — dark #111, grid fijo 3×2**
- Bug resuelto: CSS residual del carrusel (`width:320px` / `min-width:320px`) aplastaba las cards. Se quitó. Ahora las cards son 430px en el grid fijo.
- Las 6 cards tienen imágenes reales (ver §5).

**5. Team — headline "Distilled from the best. Deployed at scale." + stats estáticos**
- Stats no animados (el mockup no tiene animación en esta sección).

**6. Sección "Why Hype On" — CREADA DESDE CERO**
- Faltaba por completo en la implementación previa.
- Cream background, 4 feat-cards + testimonial Rachel M. (texto literal del `.dc.html`).

**7. Orden de secciones corregido al del `.dc.html`**
```
Hero → Ticker → Video → Stats/Proof → Services → WhyHypeOn →
WhatWeMake → Team → ClientPortal → Testimonials → FAQ → Blog → Contact
```

**8. Testimonials — formato featured**
- Daniel K. como testimonio featured (card grande arriba) + 2 cards secundarias.
- Textos literales del `.dc.html`.

**9. Client Portal — cream + CTA + logo**
- Fondo cream, CTA "Get access with your audit →", logo "h" visible en el dashboard.

### 3.3 Chat widget del hero

- **Quitado:** header "Hype On Advisor" + barras de equalizador + urgency line "3 audit slots remaining" (el `.dc.html` no los tiene — eran invenciones).
- `max-width: 640px`.
- Placeholder siempre visible: keyframe `phAppear`. **NO usar `placeholderFade`** (dejaba el placeholder vacío después de 2 segundos — bug visual).
- Keyword-matching copiado literalmente del `.dc.html` a `src/lib/chat-responses.ts`.

### 3.4 Navegación y rutas

- Nav: "Log in" → `/login`
- `/chat`: funcional con layout minimal (sin Nav/Footer)
- `/legal`: con tabs (privacy / terms)

---

## 4. MÉTODO "RETRATO HABLADO" — Cómo generar imágenes

### El método

Se pasa una imagen de **referencia** como `inlineData` a NanoBanana (modelo `gemini-3-pro-image-preview` o `gemini-3.1-flash-image-preview`) + un prompt CORTO pidiendo recrear FIELMENTE la escena con una persona ORIGINAL no identificable.

**La imagen de referencia manda. El prompt largo NO.**

Script base reutilizable: `~/projects/hypeon-website/scripts/generate-influencers-card.mjs`

### Reglas de Julian (aprendidas a golpes en esta sesión)

**(a) Fidelidad MÁXIMA a la referencia.** La imagen generada debe ser una "fotocopia" con cara nueva. No reinterpretar la composición, el encuadre, la iluminación ni el tipo de escena.

**(b) MANTENER el mismo demographic / target-audience de la referencia.** No cambiar la etnia ni el tipo de persona. Cambiar la cara: sí. Cambiar el tipo de persona: no.
- Ejemplo de fallo: se pasó una referencia de podcaster occidental y se generó un podcaster South Asian. Julian rechazó: "no es mi TA, mal retrato hablado."

**(c) QUITAR overlays ajenos ANTES de pasarla como referencia:**
- Texto de thumbnail (ej. "extinct")
- UI de YouTube (barra de progreso, controles)
- Watermarks (ej. depositphotos)
- Branding real de terceros (ej. "Bad Friends")
- Barras de campaña política u otras sobreimpresiones

**(d) La parte inferior de la imagen debe tolerar un overlay oscuro.** Las cards de What We Make ponen texto sobre la mitad inferior. La referencia (y la generación) debe tener la zona inferior relativamente limpia o con fondo oscurable.

**(e) NUNCA cambiar cifras/números sin permiso explícito de Julian.** Si la referencia tiene un número, o la card tiene una stat, no inventar ni "mejorar" por cuenta propia.

### Flujo de referencias

Julian pasa las referencias por `~/Downloads/` (screenshots que él mismo elige). Él hace la curación. El agente ejecuta el retrato hablado.

### Integración en WhatWeMake.tsx

Patrón `image` en la card → `background-image: cover` + overlay `wmm-card__overlay--photo` (gradiente que oscurece la zona inferior para que el texto sea legible).

---

## 5. IMÁGENES DE WHAT WE MAKE — Estado actual

Todas en `~/projects/hypeon-website/public/images/whatwemake/`

| Card | Archivo | Estado | Nota |
|---|---|---|---|
| Influencers | `influencers.jpg` | ✅ Aprobada | Rubia editorial en pasillo con tapete |
| Documentaries | `documentaries.jpg` | ✅ Aprobada | Paleontólogo/cráneo de dinosaurio |
| Podcasts & Talk Shows | `podcasts.jpg` | ✅ Aprobada | Podcaster occidental, versión final SIN neón |
| Live Action | `liveaction.jpg` | ✅ Aprobada | Presentadora en set de estudio, composición de 2 referencias |
| Multi-Language | `multilanguage.jpg` | ✅ Aprobada | Mercado callejero internacional |
| Kids & Family | `kidsfamily.jpg` | ✅ Aprobada | Imagen LITERAL de Bamboo Kids (contenido propio — sin retrato hablado, no aplica) |

**Nota sobre Podcasts:** hubo una versión con neón rechazada y una versión final sin neón aprobada. `podcasts.jpg` es la versión aprobada.

**Nota sobre Live Action:** construida componiendo 2 referencias que Julian pasó. La composición final es una presentadora en un set de estudio televisivo.

---

## 6. DEPLOY — Cómo y dónde

### Staging (Vercel)

```bash
cd ~/projects/hypeon-website
vercel --yes            # SIN --prod — genera URL único con hash
```

Cada deploy genera un **URL único** (ej. `https://hypeon-website-v52bs2krq-julian-rintas-projects.vercel.app/`). Los deploys viejos quedan congelados en sus propios URLs.

**Alias estable:** `https://hypeon-redesign.vercel.app`
Re-asignar tras CADA deploy:
```bash
vercel alias set <URL-nuevo-con-hash> hypeon-redesign.vercel.app
```

**Último deploy al cierre de sesión:** `https://hypeon-website-v52bs2krq-julian-rintas-projects.vercel.app/`

### ⚠️ CACHÉ del alias — Problema activo

El alias `hypeon-redesign.vercel.app` está detrás del login SSO de Vercel y sirve versiones viejas aunque apunte al deploy correcto.

**Regla:** verificar SIEMPRE por el **URL directo del último deploy** (el que tiene el hash), NO por el alias.

**Fix pendiente:** quitar "Deployment Protection / Vercel Authentication" en el dashboard de Vercel (Settings del proyecto `hypeon-website`). Esto dejará el alias público, sin caché, y resolverá el problema de raíz.

### Producción real — DigitalOcean

El Vercel actual es **solo staging**. La producción real de `hypeon.media` corre en DigitalOcean / PM2.

Flujo de deploy a producción (del `CLAUDE.md` del repo):
```
git push → SSH alpha → git pull && npm run build && pm2 restart hypeon-website
```
Puerto: 3400.

La promoción final a `hypeon.media` va por este flujo, O Julian puede decidir migrar a Vercel si prefiere ese CI/CD.

---

## 7. PENDIENTES — En orden, con por qué

### Pendiente 1 — Badge "CLIENT PORTAL" (PRIMER PENDIENTE, hacer ya)

**Qué:** En `src/components/sections/ClientPortal.tsx`, el badge "CLIENT PORTAL" tiene UN DOT AZUL/MORADO que no debería existir. El mockup (`.dc.html`) solo tiene UN dot verde acid (`#c8ff2e`) a la izquierda del texto.

**Qué hacer:** Quitar el dot azul/morado. Dejar solo el dot verde.

**Por qué no se hizo:** El agente terminó la sesión justo antes de recibir el fix.

**Archivo:** `src/components/sections/ClientPortal.tsx` + regla CSS correspondiente en `globals.css`.

---

### Pendiente 2 — Retratos hablados de los placeholders restantes

Julian pasa las referencias por `~/Downloads/`. Una vez que pase cada imagen, ejecutar el retrato hablado con el método de §4.

**Placeholders pendientes:**

**(a) Creator strip del Hero** (`src/components/sections/Hero.tsx`)
- Actualmente: gradientes de color sólido como placeholders de los creadores.
- Lo que debe ser: tira horizontal de retratos de creadores (estilo avatar/foto circular o rectangular).
- Mismo método retrato hablado. Julian pasa las referencias.

**(b) Poster del video** (`src/components/sections/Video.tsx`)
- Actualmente: placeholder gris o vacío.
- Lo que debe ser: poster thumbnail del video demo de Hype On.
- Julian pasa la referencia o decide si usar un frame real del video.

**(c) Thumbnails del blog** (`src/components/sections/LatestInsight.tsx` + posts de velite en `content/posts/`)
- Actualmente: placeholders genéricos.
- Lo que debe ser: thumbnails con estilo editorial coherente con la marca.
- Julian pasa las referencias o decide si son retratos hablados o ilustraciones.

---

### Pendiente 3 — Destino del botón "Book a Call"

**Qué:** El botón verde "Book a Call" (CTA principal, aparece en Hero y en otras secciones) actualmente va a `#contact` (scroll a la sección de contacto).

**Decisión pendiente de Julian:** ¿Adónde debe ir?
- Opción A: Calendly (link directo a reserva de llamada)
- Opción B: `/analyze` (flujo de onboarding propio)
- Opción C: formulario de contacto (mantener `#contact`)
- Opción D: otro

**No cambiar hasta que Julian decida.** Basta con preguntarle al inicio de la próxima sesión.

---

### Pendiente 4 — Quitar protección SSO del preview de Vercel

**Qué:** En el dashboard de Vercel → proyecto `hypeon-website` → Settings → "Deployment Protection" → deshabilitar "Vercel Authentication".

**Por qué:** Con SSO activo, el alias `hypeon-redesign.vercel.app` requiere login y sirve versiones cacheadas. Desactivar = alias público y actualizable en tiempo real.

**Cómo:** Dashboard web de Vercel, no hay comando CLI directo para esto.

---

### Pendiente 5 — Promover a producción (DigitalOcean)

**Cuándo:** Cuando Julian apruebe el staging completo (todos los pendientes anteriores resueltos).

**Flujo:**
```bash
# En el servidor alpha (DigitalOcean)
git pull origin feature/redesign-v2   # o main si ya se mergeó
npm run build
pm2 restart hypeon-website
```

**Decisión previa:** Julian debe decidir si mergear `feature/redesign-v2` → `main` antes del deploy, o deployar directo desde la rama.

---

## 8. BUGS CONOCIDOS / LECCIONES DE SESIÓN

### Bug 1 — CSS residual del carrusel (RESUELTO)
`width:320px` y `min-width:320px` en `.wmm-card` aplastaban las cards de What We Make. Eliminado. Las cards ahora son 430px en el grid fijo 3×2.

### Bug 2 — Placeholder del chat siempre vacío (RESUELTO)
El keyframe `placeholderFade` hacía desaparecer el texto del placeholder después de 2 segundos. Reemplazado por `phAppear` que mantiene el texto visible permanentemente.

### Lección — README vs `.dc.html`
El README de Claude Design es una descripción aproximada, no la especificación exacta. Siempre que haya duda, abrir el `.dc.html` en el browser y medir valores directamente (DevTools → Computed Styles).

### Lección — Retratos hablados: el demographic importa
Cambiar la cara de la persona de referencia es correcto. Cambiar el tipo de persona (etnia, target audience) es incorrecto. Julian rechazó un podcaster South Asian porque "no es mi TA". La referencia define el demographic; el retrato hablado solo cambia la identidad.

---

## 9. ÍNDICE DE ARCHIVOS CLAVE

| Ruta | Descripción |
|---|---|
| `~/projects/hypeon-website/` | Repo principal del rediseño |
| `~/projects/hypeon-website/src/app/globals.css` | Todo el CSS del rediseño (aditivo) |
| `~/projects/hypeon-website/src/app/(marketing)/page.tsx` | Composición de la landing |
| `~/projects/hypeon-website/src/components/sections/` | Todas las secciones del sitio |
| `~/projects/hypeon-website/src/lib/chat-responses.ts` | Keyword-matching del chat widget |
| `~/projects/hypeon-website/public/images/whatwemake/` | 6 imágenes aprobadas de What We Make |
| `~/projects/hypeon-website/scripts/generate-influencers-card.mjs` | Script base para retratos hablados |
| `~/projects/hypeon-website/docs/REDESIGN_V2_BLUEPRINT.md` | Blueprint técnico de arquitectura |
| `~/projects/hypeon-website/qa-screenshots/` | Screenshots de QA visual |
| `~/projects/hypeon-website-v2-staging/design_handoff_hypeon_website/` | Fuente de verdad: `.dc.html` + README de Claude Design |
| `~/Downloads/Hype On Media Website.zip` | ZIP original de Claude Design |

---

*Handoff escrito: 2026-07-03*
