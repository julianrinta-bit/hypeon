---
name: hypeon-imagery
description: >
  Generate ALL images for Hype On Media — blog thumbnails, social media visuals,
  photos, infographics, portraits, and any visual asset. The "ferretería" for imagery.
  Use when: "generate image", "create thumbnail", "make photo", "generate cover",
  "blog image", "OG image", "social media image", "portrait", "infographic",
  "hazme una foto", "genera una imagen", or ANY request involving visual generation.
metadata:
  version: 5.0.0
  author: Hype On Media
  domain: ai-image-generation
  style: adaptive (documentary, infographic, statement, hybrid — board decides per piece)
---

# Hype On Imagery — The Visual Ferretería

Generate ANY image for Hype On Media. Photos, portraits, infographics, social posts, thumbnails.

## Architecture: Two Layers

This skill operates in two layers. **Layer 1 always runs. Layer 2 only runs when the image has a destination format.**

```
LAYER 1: THE IMAGE
  Input: "What do you want to see?"
  Output: A standalone image at maximum quality.
  Standard: Indistinguishable from real (photos) or world-class (graphics).

LAYER 2: THE FORMAT (optional)
  Input: Layer 1 output + "Where is this going?"
  Output: Adapted for destination (thumbnail, ad, social, OG image).
  Standard: Optimized for CTR, scroll-stop, platform specs.
```

**If Julian says "hazme una foto de X"** → Layer 1 only.
**If Julian says "hazme el thumbnail del artículo X"** → Layer 1 + Layer 2.

---

# LAYER 1 — THE IMAGE

The sole goal of Layer 1 is to produce the best possible standalone image. A photo must pass as a real photograph. An infographic must pass as professional design. An illustration must pass as hand-crafted art. No compromises.

## Step 0: READ FRAMEWORKS FIRST (MANDATORY — before ANY generation)

**Before generating a single pixel, read the relevant vault frameworks.**

For **photos/portraits** (read ALL of these):
```
~/Library/Mobile Documents/com~apple~CloudDocs/Julian's Documents/CREATIVE AGENCY OS/01_FRAMEWORKS/Production/
├── Photorealistic_Portrait_Prompts.md    — 8 pillars, skin tiers, expression, anti-patterns
├── Photo_Realism_Micro_Details.md        — master prompt block (dust, pores, chromatic aberration)
├── Lighting_And_Background_Realism.md    — mixed light, blown windows, background people
├── Visual_Realism_Masterclass.md         — wardrobe by region, breaking the AI look, film stocks
└── NanoBanana_Prompt_Guide.md            — SCHEMA framework, model specs, style keywords
```

For **infographics** (read these):
```
├── NanoBanana_Prompt_Guide.md            — SCHEMA framework, 8 infographic templates
└── Eye_Catching_Infographics.md          — layouts, colors, data viz patterns
```

For **illustrations/graphics** (read these):
```
├── NanoBanana_Prompt_Guide.md            — style keywords, composition control
└── Visual_Realism_Masterclass.md         — typography rules, font choices
```

**You MUST read these before writing any prompt. If you find yourself writing a prompt without having read the frameworks, STOP — you are improvising.**

---

## Step 1: Determine Image Type

| Type | Standard | Key frameworks |
|------|----------|---------------|
| **Photo/Portrait** | Indistinguishable from a real photograph taken by a real camera in a real place | All 5 Production frameworks |
| **Infographic** | Passes as professional design agency output | NanoBanana + Eye_Catching |
| **Illustration** | Passes as hand-crafted art in the specified style | NanoBanana + Visual_Realism |

---

## Step 2: Construct the Prompt (Photos/Portraits)

### 2.1 The 8 Pillars (ALL must be addressed)

Every photo prompt must explicitly address all 8 pillars from Photorealistic_Portrait_Prompts.md:

1. **Skin physics** — pores, SSS, peach fuzz (Tier 1 keywords always, Tier 2 pick 2-4)
2. **Imperfections** — asymmetry, moles, flyaway hair, undereye shadow
3. **Optics** — specific camera body + lens + aperture + ISO
4. **Light** — direction, quality, color temperature in Kelvin, mixed sources
5. **Expression** — mid-verb/mid-action, never posed, never stock smile
6. **Hair** — flyaway strands, translucency at edges, imperfect parting
7. **Clothing** — material specificity with fabric texture, wear details, pulled thread
8. **Color grade** — specific film stock (Portra 400, etc.)

### 2.2 Camera Specs (Non-Negotiable — include in every photo prompt)

```
Shot on [camera body] with [focal length] f/[aperture] lens, ISO [value].
[Film stock] tonality — [specific color characteristics].
```

Default: `Shot on Canon EOS R5 with 85mm f/1.8 lens, ISO 640. Kodak Portra 400 tonality — warm skintones, lifted shadows, slightly golden midtones, matte film finish.`

For candid/selfie: `Shot on iPhone 15 Pro, 26mm equivalent, slight barrel distortion, natural available light only.`

### 2.3 Lighting (Non-Negotiable — always specify sources)

**NEVER use:** `natural light`, `soft light`, `window light` alone.
**ALWAYS specify:** the light SOURCE, the light FAILURE, and the COLOR CONFLICT.

Every indoor photo needs mixed color temperature:
```
[Source 1: type, Kelvin, direction] + [Source 2: type, Kelvin, direction]
No fill, no correction — the color temperature split is the point.
```

From Lighting_And_Background_Realism.md — key rules:
- Real rooms have 2+ light sources at DIFFERENT color temperatures
- Windows should be partially blown out (overexposed) — AI refuses this by default
- Shadow side has NO fill — just natural darkness
- Skin shows color cast from dominant source (warm side vs cool side)
- Far corners of room are dark — light doesn't reach everywhere

### 2.4 Micro-Realism (append to EVERY photo prompt)

From Photo_Realism_Micro_Details.md — the MASTER PROMPT BLOCK:

```
MICRO-REALISM MODIFIER:

// Environmental
faint dust motes suspended near light source, slight lens vignetting at corners, subtle chromatic aberration at frame edges with faint purple-cyan fringing, natural sensor noise in shadow regions, cat-eye bokeh at frame corners, subtle lens flare artifact from practical light

// Skin and Face
realistic pore variation by zone (fine on forehead, enlarged on nose and cheeks), faint vein tracery at temples, off-white sclera with thin red capillaries at inner corners, tear film glint on lower eyelid, subtle facial asymmetry (one eyebrow very slightly higher), natural skin specularity on forehead and nose bridge, slight under-eye shadow, redness at nostril edges

// Hair
individual flyaway strands at perimeter, fine hair translucency at edges with backlight halo, split ends on longer strands, natural hair grouping with micro-separation

// Lips and Teeth
vertical lip lines with slight dryness at corners, gloss pooling at center, natural tooth tone (warm off-white), minor tooth size irregularity

// Hands and Body (if visible)
knuckle texture with skin looseness at joints, faint hand veins, neck creases from head angle, natural casual posture with slight weight shift

// Clothing
fabric pilling at friction points, seam puckering at tension points, positional wrinkles consistent with body position, slight fabric fade at high-wear areas, one or two lint particles on dark fabric

// Camera/Lens
natural depth-of-field with non-linear focus falloff, slight JPEG compression ringing at high-contrast transitions, bokeh with natural brightness variation and specular highlight blooming, micro-focus variation across subject
```

### 2.5 Anti-Stock Negation Block (append to EVERY photo prompt)

```
NOT posed — NOT stock photo expression — NOT airbrushed poreless skin —
NOT symmetrical features — NOT clean empty desk — NOT single light source —
NOT perfect hair — NOT arms crossed — NOT white or gray background —
NOT studio lighting — NOT ring light — NOT performed smile —
NOT beauty-corrected average — NOT single color temperature —
NOT medium gray background (#808080-#BBBBBB).
```

### 2.6 Anti-AI Color Realism (append to EVERY photo prompt with environments)

```
COLOR REALISM: The environment must contain at least 3 objects with SATURATED color
that break the grey/beige monotone — examples: a RED stapler, a BRIGHT GREEN plant,
an ORANGE book spine, a YELLOW sticky note, a BLUE water bottle.
The image should NOT be tonally uniform. Real spaces have chromatic variety.
```

### 2.7 Complete Photo Prompt Structure

```
[Documentary/Candid/Lifestyle] photograph. NOT editorial, NOT art-directed.
[Camera specs from 2.2]

[Subject description: age, build, ethnicity, specific physical details]
[Expression: mid-verb technique — what they were doing when "caught"]

[Clothing: material specificity with fabric texture, brand-level detail, wear marks]
[Accessories: specific items with wear/use details]

[Environment: specific location with 4+ reality markers]
[Background: activity, depth, what's visible and what's blurred]

[Lighting: mixed sources with Kelvin values and direction from 2.3]

[Skin detail: Tier 1 always + 2-4 Tier 2 items from 2.1]

[MICRO-REALISM MODIFIER from 2.4]

[Anti-stock negation from 2.5]

[Anti-AI color realism from 2.6 — if environment visible]

Output: [aspect ratio], [orientation].
```

---

## Step 3: Construct the Prompt (Infographics)

Use the SCHEMA AVANZATO framework from NanoBanana_Prompt_Guide.md:

```
Style: [global aesthetic — editorial/flat/isometric/whiteboard]
Composition: [layout type from the 8 templates in NanoBanana guide]
Subject: [precise content with HEX colors, not color names]
Typography: [specific font style, weight, size hierarchy]
Background: [HEX color, not "dark background"]
Mandatory: [3-10 verifiable elements]
Prohibitions: [3-10 specific exclusions]
Output: aspect ratio [X:X], resolution [2K/4K]
```

---

## Step 4: Generate with NanoBanana

### 4.1 Model Selection

```
Primary:  gemini-3.1-flash-image-preview  (NanoBanana 2)
Fallback: gemini-2.5-flash-image           (if primary unavailable)
```

Try primary first. If it returns 404 or model-not-found, fall back automatically.

### 4.2 API Call

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

// API key from ~/.env (GOOGLE_AI_API_KEY) — NEVER hardcode
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-3.1-flash-image-preview',
  generationConfig: {
    responseModalities: ['IMAGE', 'TEXT'],
  },
});

const result = await model.generateContent(prompt);
const image = result.response.candidates[0].content.parts
  .find(p => p.inlineData);
const imageBuffer = Buffer.from(image.inlineData.data, 'base64');
```

### 4.3 Cost Optimization

1. Prototype at 512px — test expression, lighting, composition ($0.045/image)
2. Validate at 1K — verify imperfections render correctly ($0.101/image)
3. Final at 2K for production ($0.151/image)
4. Do NOT generate at 4K every iteration

### 4.4 Save Location

- Drafts: `~/Library/Mobile Documents/.../05_MARKETING/Campaigns/2026-03_Website_Blog/{name}-draft.jpg`
- Final (if for blog): `~/projects/hypeon-website/content/blog/{slug}/cover.jpg`

---

## Step 5: Quality Gate — THE IMAGE (Must Pass ALL)

### Photos/Portraits — run this checklist BEFORE showing the image to Julian

**Skin:**
- [ ] Has at least 2 Tier-2 imperfection tokens visible (freckles, mole, asymmetry, undereye shadow)
- [ ] Pore variation visible (forehead vs nose vs cheeks)
- [ ] Subsurface scattering present (translucency at ears, nose)
- [ ] NOT airbrushed, NOT poreless, NOT waxy

**Expression:**
- [ ] Mid-action or natural resting — NOT posed, NOT stock smile
- [ ] Eyes have life — catchlights consistent with light source, tear film visible

**Lighting:**
- [ ] Can identify 2+ light sources with different color temperatures
- [ ] Shadow side exists with NO artificial fill
- [ ] Skin shows color cast from dominant source

**Hair:**
- [ ] Flyaway strands visible
- [ ] Not perfectly placed — natural imperfection

**Clothing:**
- [ ] Fabric texture visible (weave, knit, thread)
- [ ] At least one wear detail (wrinkle, pill, pulled thread, fade)

**Environment:**
- [ ] NOT white/gray studio background
- [ ] 4+ reality markers if workspace/room is visible
- [ ] Color variety — NOT monochrome grey/beige

**Camera artifacts:**
- [ ] Depth of field with graduated falloff (not uniform blur)
- [ ] Lens vignetting or chromatic aberration present

**Auto-Reject Triggers (any one = regenerate):**
- Airbrushed / poreless skin
- Perfect symmetrical features
- White or pure gray background
- Single uniform color temperature
- Stock photo pose (arms crossed, forced smile)
- Medium gray background (#808080-#BBBBBB)

---

# LAYER 2 — THE FORMAT (only when image has a destination)

Layer 2 takes the Layer 1 image and adapts it for a specific use. **Layer 2 NEVER compromises Layer 1 quality.** The image was already generated; now we're packaging it.

## When Layer 2 Activates

| Julian says | Layer 1 | Layer 2 |
|-------------|---------|---------|
| "hazme una foto de X" | Yes | No |
| "genera una imagen de X" | Yes | No |
| "hazme el thumbnail del artículo X" | Yes | Yes → Thumbnail |
| "imagen para el blog post de X" | Yes | Yes → Thumbnail |
| "imagen para LinkedIn" | Yes | Yes → Social |
| "imagen para un ad" | Yes | Yes → Ad creative |

---

## Thumbnail Format (Blog / OG Image)

### T1: Strategy (runs BEFORE Layer 1 for thumbnails)

When generating for a thumbnail, Layer 1 prompt must include composition rules for the intended format. This means the strategy phase runs first to inform the photo generation.

Read the article and extract:

**Hook:** Single most surprising/threatening piece of information. Maximum 5 words.

**Avatar:** Pick from the four personas based on article tag:

| Tag | Primary Avatar |
|-----|---------------|
| `strategy`, `b2b`, `content-strategy` | The VP (European woman, early 40s) |
| `growth`, `shorts`, `monetization`, `ctr` | The Founder (European/MENA man, mid-30s) |
| `creative`, `production`, `ai`, `design` | The Creative Director (European woman, early 30s) |
| `youtube`, `retention`, `seo`, `algorithm`, `analytics` | The Operator (European/American man, late 30s) |

Full avatar specs (demographics, clothing, consistency anchors, environments, expressions by article type) are in the Avatar System. Read `05_MARKETING/Brand/Avatar_System.md` for complete definitions.

**Text overlay decision:**
- Tier 1 (60%): No text. Image + category band only.
- Tier 2 (30%): 3-5 words max, left 40% of frame.
- Tier 3 (10%): Data split — person right 30%, stat left 60%.

**Composition template:**
- Template A — Reaction Shot (center-right, eyeline left)
- Template B — Data + Person Split
- Template C — Full Environmental (person left third)
- Template D — Close-Up Challenge (tight crop, direct eye contact)
- Template E — In-Motion (mid-task action visible)

**If text overlay (Tier 2-3), add to Layer 1 prompt:**
```
COMPOSITION: Subject positioned in the RIGHT 55% of the frame.
LEFT 45% contains environment with natural negative space
(wall, window, blurred background) — this is the TEXT ZONE.
No important visual elements in the left 45%.
```

### T2: Post-Processing

**Category band (always applied to thumbnails):**
85px solid color band at bottom. The band is BELOW the photo, not overlaid.

| Category | Band Color |
|----------|-----------|
| YouTube | `#FFD600` |
| Strategy/B2B | `#1B2A4A` |
| AI/Tech | `#A8FF3E` |
| Shorts | `#E63946` |
| Analytics | `#3730A3` |
| Growth/Monetization | `#2D6A4F` |

**Text overlay (Tier 2 only):**
- Font: Playfair Display Bold or bold condensed sans-serif
- BANNED: Inter, Roboto, Montserrat, Poppins, Arial, Lato, Open Sans
- Color: Cream white `#FAF3E0`
- Scrim: 40-50% black gradient from left, NOT a solid box
- Max 5 words, 72-96px
- Person's eyeline points AWAY from text

**Dimensions:** 1200 x 630px, JPG, < 200KB

### T3: Devil's Advocate (thumbnails only)

Before finalizing, run these tests:

- **Scroll Test:** In a LinkedIn feed, does it stop you?
- **Share Test:** Would a VP forward this in Slack with zero explanation?
- **FOFU Test:** Does it trigger Fear of Messing Up professionally?
- **Documentary Test:** Does it feel like a journalist captured this, or like a brand photoshoot?
- **4 Emotional States** (at least 1 must trigger): Vindication, Advantage, Urgency, Aesthetic respect

### T4: Thumbnail Quality Gate

- [ ] Bottom category band present (85px, correct color)
- [ ] Text (if present) is maximum 5 words at 72px+
- [ ] All text within central 60% hero zone
- [ ] Uses B2B buyer language, not consumer language
- [ ] No purple gradients
- [ ] Would stop scroll for 1+ seconds
- [ ] Passes at least 1 of: Share / FOFU / Documentary test

---

## Social Format (LinkedIn, Instagram, etc.)

- LinkedIn: 1200x627 (feed) or 1080x1080 (square)
- Instagram: 1080x1080 (feed) or 1080x1350 (portrait)
- No category band. No text unless specifically requested.
- Add subtle "HYPE ON MEDIA" watermark (8-12% opacity, bottom corner)

---

## File Locations

```
~/projects/hypeon-website/
├── scripts/
│   └── generate-cover-{slug}.cjs  # Per-article generation script
├── content/blog/{slug}/
│   └── cover.jpg                   # Final thumbnail (1200x630, <200KB)

~/Library/Mobile Documents/.../CREATIVE AGENCY OS/
├── 05_MARKETING/Campaigns/2026-03_Website_Blog/
│   ├── Avatar_System.md            # Full avatar definitions
│   ├── Thumbnail_Style_Guide.md    # Approved style + principles
│   └── {name}-draft.jpg            # Draft generations for review
├── 01_FRAMEWORKS/Production/
│   ├── Photorealistic_Portrait_Prompts.md
│   ├── Photo_Realism_Micro_Details.md
│   ├── Lighting_And_Background_Realism.md
│   ├── Visual_Realism_Masterclass.md
│   └── NanoBanana_Prompt_Guide.md
```

## Reference

- Vault: `01_FRAMEWORKS/Production/Photorealistic_Portrait_Prompts.md` — 8 pillars, skin tiers, anti-patterns
- Vault: `01_FRAMEWORKS/Production/Photo_Realism_Micro_Details.md` — master micro-realism prompt block
- Vault: `01_FRAMEWORKS/Production/Lighting_And_Background_Realism.md` — mixed light, background people
- Vault: `01_FRAMEWORKS/Production/Visual_Realism_Masterclass.md` — wardrobe, typography, AI tells
- Vault: `01_FRAMEWORKS/Production/NanoBanana_Prompt_Guide.md` — SCHEMA, templates, model specs
- Campaign: `05_MARKETING/Brand/Avatar_System.md`
