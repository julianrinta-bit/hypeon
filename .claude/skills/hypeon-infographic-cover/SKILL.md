---
name: hypeon-infographic-cover
description: >
  Generate photorealistic documentary-style cover images for Hype On Media blog articles.
  Each cover features a recurring avatar character in a real workspace environment,
  designed to stop B2B executive scrolling and drive clicks through identification.
  Use when: "generate covers", "create thumbnails", "make blog images",
  "blog cover images", "OG images", "thumbnail for article".
metadata:
  version: 3.0.0
  author: Hype On Media
  domain: photorealistic-ai-generation + b2b-marketing-psychology
  style: documentary-candid (validated March 2026)
---

# Hype On Blog Thumbnail Generator

Every thumbnail is a **strategic piece**. The board deliberates what FORMAT best serves each article — it could be a documentary photo, an infographic, a data visualization, or a hybrid. There is no single default.

## Format Decision (Board Deliberation — FIRST STEP)

Before generating anything, the board must decide what FORMAT this article's thumbnail should be:

| Format | When to use | Example |
|---|---|---|
| **Documentary Photo** | Strategy, B2B, opinion, news reaction — when IDENTIFICATION is the hook | VP at desk with "18 Months Ahead" |
| **Data Infographic** | Benchmarks, statistics, year-in-review — when THE NUMBER is the hook | Big "73%" with supporting data blocks |
| **Process/Flow** | How-to, frameworks, step-by-step — when THE METHOD is the hook | 3-step flow with icons |
| **Hybrid (Photo + Data)** | When both person AND data are needed | Person on right, stat on left |
| **Statement Only** | Hot takes, provocative claims — when THE WORDS are the hook | Bold typography, minimal decoration |

**The board deliberates based on:** article content, hook type, emotional trigger, what will stop THIS specific audience scrolling for THIS specific topic.

**There is NO default format.** Each article gets the format that serves it best.

## NanoBanana Does EVERYTHING

**NanoBanana generates text, graphics, people, backgrounds, and compositions in a single image.** We do NOT use canvas post-processing for text overlay. We do NOT use two-step generation. ONE prompt → ONE image → done.

If text is needed on the thumbnail, it goes IN the NanoBanana prompt:
```
Include the text "18 MONTHS AHEAD" in bold white sans-serif,
positioned in the left third of the image, 80pt equivalent size.
```

The ONLY post-processing is adding the 85px category band at the bottom with canvas/sharp (because that's a brand system element, not creative content).

## Validated Styles (March 2026)

The documentary photo style was validated and approved. The 6 principles (Interrupted Expert, Lived-In Workspace, Active Background, Blazer-Over-Casual, Color Chaos, Camera-as-Colleague) apply whenever the board chooses the documentary format.

---

## Phase 0: Research What Works NOW

**Before designing anything**, investigate what is currently performing on LinkedIn and social.

Use web search:
- "LinkedIn viral B2B content [current month] [current year]"
- "best performing LinkedIn posts this week"
- "B2B thumbnail trends [current year]"

Ask:
- What visual styles are getting VP/CMO engagement RIGHT NOW?
- What is overdone and triggering scroll-past?
- Are competitors using stock photography (they usually are -- good, we differentiate)?

**Do NOT default to any fixed aesthetic.** Research first, then decide.

---

## Phase 1: Strategy

Read the article and extract:

### 1.1 The Hook
Extract the single most surprising, counterintuitive, or threatening piece of information.
**Maximum 5 words.** If you need more, the hook is not sharp enough.

Not the main point -- the thing that makes a VP think "wait, what?"

Good hooks:
- "18 Months Ahead" (loss aversion)
- "$2.4M Pipeline. 1 Channel." (specific proof)
- "Your Analytics Are Lying" (threat to worldview)

Bad hooks:
- "How to Improve Your Channel Analytics" (describes, does not provoke)
- "The Importance of YouTube for B2B" (vague, no tension)

### 1.2 Avatar Selection
Pick the avatar based on the article's primary tag:

| Tag | Primary Avatar | Secondary Avatar |
|-----|---------------|-----------------|
| `strategy` | VP | Operator |
| `growth` | Founder | VP |
| `production` | Creative Director | Founder |
| `content-strategy` | VP | Creative Director |
| `ai` | Creative Director | Operator |
| `creative` | Creative Director | -- |
| `shorts` | Founder | Creative Director |
| `analytics` | Operator | VP |
| `monetization` | Founder | VP |
| `b2b` | VP | Operator |
| `algorithm` | Operator | Founder |
| `retention` | Operator | VP |
| `thumbnails` | Creative Director | Founder |
| `ctr` | Founder | Creative Director |
| `seo` | Operator | VP |
| `design` | Creative Director | -- |
| `demand-generation` | Operator | VP |
| `youtube` | Rotate all four | -- |

**Selection logic:** Use primary by default. Use secondary when primary was already used in the previous 2 articles with the same tag. The `youtube` tag rotates through all four to maintain variety.

### 1.3 Environment Selection
Pick based on avatar:
- **VP** -> Corner Office (Environment 01) or War Room (Environment 04)
- **Founder** -> Home Office (Environment 03) or Coffee Shop variant
- **Creative Director** -> Creative Studio (Environment 02)
- **Operator** -> Clean Desk / War Room (Environment 04)

### 1.4 Emotional Trigger
Pick ONE primary trigger. Ranked by effectiveness for B2B:

1. **FOFU (Fear of Messing Up)** -- 85% of B2B sharing psychology is fear-driven, not curiosity-driven. "A person at your level is already dealing with this. Are you?"
2. **Curiosity gap** -- "You think X, but actually Y"
3. **Authority/proof** -- "We tested this, here is the result"
4. **Vindication** -- "I've been saying this" (drives the "This." LinkedIn repost)
5. **Urgency** -- "This changed, you need to adapt"

### 1.5 Text Overlay Decision

**Tier 1: No text overlay (60% of articles)**
Image + bottom 85px category band only. The article title on the blog card does the hook.
Use for: strategy deep-dives, growth content, general YouTube, how-to.

**Tier 2: Minimal text overlay (30% of articles)**
3-5 words maximum, left 40% of frame. DM Sans ExtraBold at 80-96px. White text with 8% opacity dark gradient scrim (NOT a box -- a subtle environmental darkening that feels like shadow).
Use for: data-led articles, competitive urgency, provocative claims.

**Tier 3: Full data split -- Template B (10% of articles)**
Person right 30%, stat left 60%. Departs from pure documentary but keeps anti-stock DNA.
Use for: benchmark reports, annual data pieces, shocking numbers.

### 1.6 Buyer Language Check
Use B2B executive vocabulary, never consumer/creator language:

| Use (B2B executive) | Never use (consumer/creator) |
|---------------------|------------------------------|
| "Pipeline" | "Views" |
| "$2.4M" | "240%" |
| "Revenue" | "Growth" (as feeling) |
| "Attribution" | "Engagement" |
| "CAC" | "Followers" |
| "Sales cycle" | "Subscribers" |
| "Influenced" | "Viral" |
| "Infrastructure" | "Content creator" |
| "14 days shorter" | "Faster" (vague) |

Rule: specific dollar amounts outperform percentages. "$2.4M in pipeline" beats "240% pipeline increase" every time.

### 1.7 Strategy Output

```markdown
HOOK: [max 5 words]
AVATAR: [VP / Founder / Creative Director / Operator]
ENVIRONMENT: [Corner Office / Home Office / Creative Studio / War Room]
TRIGGER: [FOFU / Curiosity / Authority / Vindication / Urgency]
TEXT TIER: [1 (none) / 2 (minimal) / 3 (data split)]
TEXT (if tier 2-3): [exact words]
COMPOSITION: [Template A / B / C / D / E]
CATEGORY: [YouTube / Strategy / AI / Shorts / Analytics / Growth]
```

---

## Phase 2: Avatar Selection — The Four Personas

### CRITICAL: Demographics
Julian's mandate -- avatars must look like REAL European/MENA/American B2B clients. Not diversity casting. These are the people who actually buy YouTube management services at $1M+ companies in Europe and the Middle East.

### CRITICAL: Regional Wardrobe Realism

Replace generic "charcoal blazer" descriptions with specific, regionally-accurate wardrobe. Each avatar maps to a region and style tier:

| Avatar | Region | Wardrobe Direction | Reference Brands |
|--------|--------|-------------------|-----------------|
| **VP** | UK/Northern Europe | Camel or burgundy wool coat, or forest green fitted blazer. Tonal ivory/cream underneath. Gold watch, small pearl studs. | Reiss, Cos, Sunspel |
| **Founder** | Central/Southern Europe | Washed navy cotton overshirt or dark olive bomber. Grey marl crew-neck tee underneath. Worn leather strap watch. | Cos, Filippa K, Norse Projects |
| **Creative Director** | Scandi/Dutch | Burnt orange or terracotta linen overshirt. Black ribbed turtleneck underneath. Oversized tortoiseshell glasses. | Acne Studios, COS, Our Legacy |
| **Operator** | American | Charcoal merino quarter-zip over white Oxford collar. Understated, pragmatic. | Theory, Brooks Brothers, Everlane |

**Texture is non-negotiable:** Always specify fabric texture in the prompt (herringbone, ribbed knit, marl, linen weave). Flat untextured fabric reads as AI-generated.

**The pulled thread rule:** Every avatar gets ONE visible wear detail on clothing — a pulled thread near a shoulder seam, a slightly pilled elbow, a creased collar. Perfect clothing = stock photo.

---

### Avatar 1: "The VP" -- European woman, early 40s

**Maps to:** `strategy`, `analytics`, `b2b`, `content-strategy`

**Demographics:** European woman, age 38-44. Athletic-lean build, sits upright with intention.

**Clothing:** Slightly oversized charcoal wool blazer with visible weave texture, pushed-up sleeves revealing thin gold bracelet. Underneath: cream ribbed mock-neck knit (visible knit rows). No logos.
- *Variation:* Navy linen shirt, top button open, sleeves cuffed twice with visible crease at elbow.
- *Never:* Suits, ties, corporate lanyards, blazers with pocket squares.

**Consistency anchors (every generation):** European woman ~40, reading glasses pushed up on head, gold bracelet left wrist, flyaway hair at right temple, mole below left ear, asymmetric smile (left side lifts higher).

**Accessories:** Thin gold bracelet (always left wrist). Reading glasses on top of head. Apple Watch (screen off, band visible). Ceramic matte black coffee mug -- sometimes in hand, sometimes on desk with ring stain.

**Anti-stock markers:** Single flyaway hair at right temple. Bunched blazer sleeve. Short practical nails with single coat of clear polish. Slight asymmetry in smile.

**Expression by article type:**
| Article type | Expression | Body language |
|-------------|-----------|---------------|
| News / update | One eyebrow raised, skeptical-curious, chin tilted 5 degrees up | Leaning back, arms crossed loosely (evaluating) |
| How-to / guide | Direct eye contact, slight closed-lip smile, calm authority | Leaning forward, one hand flat on desk |
| Data / analytics | Eyes narrowed, looking off-camera, half-smile of recognition | Pointing at monitor with pen, head turned 3/4 |
| Hot take | Full eye contact, head tilted, one corner of mouth lifted | Arms crossed, leaning against desk edge |

**Environment:** Corner office, floor-to-ceiling glass. 27" monitor showing YouTube Analytics (blurred blue/red graphs). Walnut desk. Monstera plant (slightly droopy). Half-empty water glass with condensation ring.

---

### Avatar 2: "The Founder" -- European or MENA man, mid-30s

**Maps to:** `growth`, `shorts`, `monetization`, `ctr`, `thumbnails`

**Demographics:** European or MENA man, age 31-37. Medium build, relaxed posture, leans forward when engaged. Well-maintained 3-day stubble.

**Clothing:** Fitted dark navy crewneck sweater (merino, visible knit texture at collar). White t-shirt collar barely visible. Sleeves pushed to mid-forearm.
- *Variation:* Washed black Henley, top two buttons open. Or structured olive matte nylon bomber jacket.
- *Never:* Dress shirts, ties, hoodies with logos, startup swag.

**Consistency anchors:** European/MENA man ~mid-30s, 3-day stubble, cowlick right side, hair tie on right wrist, one AirPod in left ear only, faded ring finger tan line.

**Accessories:** Rubber band / hair tie on right wrist (fidgets with it). AirPods Pro (one in, right one out). Plain stainless steel analog watch. Half-full iced coffee with condensation beads.

**Anti-stock markers:** Pulled thread near left shoulder seam. One eyebrow slightly bushier. Faded tan line on ring finger. Natural cowlick right side resisting styling. Single visible cable to charger on desk.

**Expression by article type:**
| Article type | Expression | Body language |
|-------------|-----------|---------------|
| News / update | Eyes wide, mouth slightly open, "Wait, what?" | Leaning forward over laptop |
| How-to / guide | Confident grin, showing teeth on one side | Hands together, interlaced, elbows on desk |
| Data / analytics | Focused squint, biting lower lip | One hand on chin, index finger along cheek |
| Hot take | Smirking, head tilted back, "I've been saying this" | Leaning back, one arm draped over chair back |

**Environment:** Home office / co-working hybrid. Standing desk (matte black), dual monitors (YouTube Studio + Shopify admin, blurred). Exposed brick wall, floating shelf with 2-3 books. Framed photo face-down. Edison bulb pendant light.

---

### Avatar 3: "The Creative Director" -- European woman, early 30s

**Maps to:** `creative`, `production`, `ai`, `design`, `thumbnails`

**Demographics:** European woman, age 29-35. Petite build, animated gestures, expressive hands.

**Clothing:** Oversized vintage band t-shirt (actually faded, not "vintage-style") tucked loosely into high-waisted wide-leg black trousers (creased). Thin gold chain necklace with small abstract pendant.
- *Variation:* Structured linen overshirt (ochre or terracotta) open over black tank top. Or black fine-gauge turtleneck.
- *Never:* Corporate anything, matching sets, visible brand logos.

**Consistency anchors:** European woman ~early 30s, tortoiseshell round glasses (slightly oversized), freckles across nose, ink stain right index finger, multiple mismatched thin rings, pendant necklace off-center.

**Accessories:** Tortoiseshell glasses (she actually needs them). Multiple thin rings on different fingers (silver, not matching). Worn leather watch strap (small vintage face). Wired earbuds draped around neck (deliberate aesthetic choice).

**Anti-stock markers:** Ink stain on right index finger. Slightly smudged glasses. One trouser leg tucked from sitting cross-legged. Freckles -- actual sun freckles, uneven. Pendant pulled off-center by chain clasp.

**Expression by article type:**
| Article type | Expression | Body language |
|-------------|-----------|---------------|
| News / update | Intrigued, head angled, slight pursed lips | One hand adjusting glasses |
| How-to / guide | Energized, mouth slightly open as if talking, eyes bright | Hands apart, gesturing, marker in one hand |
| Data / analytics | Thoughtful, looking down-and-left, pen tapping lip | Seated cross-legged, leaning to one side |
| Hot take | Direct stare, no smile, certain | Standing, one hand on hip, grounded |

**Environment:** Creative studio. Large display showing Premiere Pro / Figma (blurred). Desk slightly messy: Pantone swatches, Moleskine with pen marks, mug with markers. Wall: mood board with overlapping pinned photos, curling Post-its. Post-it on monitor edge. Mechanical keyboard with blank keycaps.

---

### Avatar 4: "The Operator" -- European or American man, late 30s

**Maps to:** `youtube`, `retention`, `seo`, `algorithm`, `analytics`, `demand-generation`

**Demographics:** European or American man, age 34-40. Lean build, composed, economical movements.

**Clothing:** Fitted dark gray quarter-zip pullover (tech-fabric, subtle sheen) over white oxford shirt collar (just collar points visible). Clean but not corporate.
- *Variation:* Simple black crew-neck tee under unstructured navy cotton blazer.
- *Never:* Athleisure, graphic tees, anything wrinkled, visible branding.

**Consistency anchors:** European/American man ~late 30s, titanium rectangular glasses (almost invisible), faint scar through left eyebrow, watch on RIGHT wrist (left-handed), sports watch (not smartwatch), closed notebook nearby.

**Accessories:** Slim rectangular titanium glasses. Garmin/Coros sports watch on right wrist. Single earbud in left ear. Closed Moleskine with pen clipped to it.

**Anti-stock markers:** Faint scar through left eyebrow. Quarter-zip has small pull at collar. One lens catches slight monitor glare (asymmetric). Watch on right wrist (left-handed). Water bottle with tiny dent near bottom.

**Expression by article type:**
| Article type | Expression | Body language |
|-------------|-----------|---------------|
| News / update | Neutral, one eyebrow micro-raised, already calculating | Hands on keyboard, paused, looking at camera |
| How-to / guide | Slight nod, closed-lip half-smile, "This tracks" | One hand on mouse, other holding chin |
| Data / analytics | Zeroed in, eyes narrowed, jaw set -- his language | Pointing at specific data on screen with fingertip |
| Hot take | Controlled skepticism, arms folded, "Show me the data" | Standing, slight lean against desk edge |

**Environment:** Clean minimal desk. Ultrawide monitor showing HubSpot / Looker dashboard (blurred pipeline funnel). Desk: single closed notebook, laptop as second screen, insulated water bottle (matte). Background: blurred open-plan office, warm lighting, 1-2 colleagues out of focus.

---

### Avatar Pairing Rules (Dual-Avatar Thumbnails)

Reserved for HIGH-IMPACT content only. Maximum 1 in every 8-10 articles.

| Pairing | When | Dynamic |
|---------|------|---------|
| VP + Founder | B2B ROI, executive buy-in, budget | She has data, he has urgency |
| Founder + Creative Director | Thumbnail/CTR, creative strategy | He points at results, she explains why |
| Creative Director + VP | AI-in-production, creative ops | She demonstrates, VP evaluates |
| Operator + VP | Analytics, attribution, demand gen | Both looking at same data, different angles |
| ALL FOUR | Never in a thumbnail | Only pillar page heroes |

Body language rules for pairings:
- Never both looking at camera
- Never symmetrically posed (one sitting, one standing)
- Always clear focal hierarchy (one 60%, one 40%)

---

## Phase 3: Prompt Construction

The prompt MUST use documentary style as default. Open every prompt with:

```
Documentary-style candid photograph. NOT editorial, NOT art-directed.
```

### 3.1 Camera Specifications (Non-Negotiable)

```
Shot on Canon EOS R5 with 85mm f/1.8 lens, ISO 640.
Kodak Portra 400 tonality -- warm skintones, lifted shadows,
slightly golden midtones, matte film finish.
```

### 3.2 The 6 Documentary Principles (All Must Be Present)

**1. Interrupted Expert** -- Subject caught mid-verb. Speaking, evaluating, reacting, deciding. Never posing, smiling, or staring.

**2. Lived-In Workspace** -- Minimum 4 reality markers on desk: partially consumed items, uncapped tools, face-down phone, visible cable. Zero decorative-only objects.

**3. Active Background** -- Colleagues through glass, active screens, city through windows. The subject is focused while the world continues behind them.

**4. Blazer-Over-Casual** -- One professional element + one casual element. Never full-formal, never full-casual.

**5. Color Chaos (Entropia Visual)** -- Let the environment provide color. Office supplies, screen glows, drinks, natural light. Never add color that would not exist in the physical scene. Real spaces have chromatic mess: uncapped highlighters, tangled cables, dead plants next to living ones.

**6. Camera-as-Colleague** -- Eye level or slightly below. Never above (condescending). Never below (hero worship). The viewer and subject are peers.

### 3.3 Lighting (Non-Negotiable)

Mixed practical sources. No single-source studio lighting.

```
Mixed lighting: [warm 3200K fluorescent overhead (slight green cast)] +
[cool 5500K natural window light from left] +
[blue-white 6500K monitor glow from front].
Natural color temperature contrast on face.
No studio lighting. No ring light. No beauty dish. No direct flash.
```

### 3.4 Expression (The "Caught Mid-Verb" Technique)

Instead of static emotions, describe mid-action:
```
# WRONG: "confident professional woman"
# RIGHT: "woman caught mid-sentence explaining something to a colleague
#         just off-frame, mouth slightly open, eyebrows engaged"
```

### 3.5 Anti-Stock Negation Block (Always Include)

```
NOT posed -- NOT stock photo expression -- NOT airbrushed poreless skin --
NOT symmetrical features -- NOT clean empty desk -- NOT single light source --
NOT perfect hair -- NOT arms crossed -- NOT white or gray background --
NOT studio lighting -- NOT ring light -- NOT performed smile --
NOT beauty-corrected average.
```

### 3.6 Composition: Negative Space for Text (Non-Negotiable)

The AI photo MUST be generated with built-in negative space for text overlay. Do NOT try to overlay text on a busy photo after the fact.

Add to EVERY prompt when text overlay is planned (Tier 2 or Tier 3):
```
COMPOSITION: Subject positioned in the RIGHT 55% of the frame.
LEFT 45% contains environment with natural negative space
(wall, window, blurred background) — this is the TEXT ZONE.
No important visual elements in the left 45%.
```

When no text overlay is planned (Tier 1), subject can be center-to-right but still leave breathing room on one side.

### 3.7 Anti-AI Color Realism (Non-Negotiable)

Real offices are chromatically messy. AI images default to grey/beige monotone — actively fight this.

Add to EVERY prompt:
```
COLOR REALISM: The environment must contain at least 3 objects with SATURATED color
that break the grey/beige monotone — examples: a RED stapler, a BRIGHT GREEN plant,
an ORANGE book spine, a YELLOW sticky note, a BLUE water bottle.
The image should NOT be tonally uniform. Real offices have chromatic variety.
```

This reinforces Principle 5 (Color Chaos / Entropia Visual) with explicit prompt language.

### 3.8 Complete Prompt Template

```
Documentary-style candid photograph. NOT editorial, NOT art-directed.
Shot on Canon EOS R5 with 85mm f/1.8 lens, ISO 640. Kodak Portra 400 tonality.

COMPOSITION: Subject positioned in the RIGHT 55% of the frame.
LEFT 45% contains environment with natural negative space
(wall, window, blurred background) — this is the TEXT ZONE.
No important visual elements in the left 45%.

[AVATAR DESCRIPTION from Phase 2] sitting at [ENVIRONMENT from Phase 2],
[EXPRESSION from emotional range table matching article type].

Desk contains: [3-4 reality markers from avatar's environment].
Background: [activity element from avatar's environment].
Lighting: mixed practical sources -- [window] + [overhead fluorescent] + [monitor glow].

[WARDROBE from avatar spec — see Phase 2 regional wardrobe]. [ACCESSORIES from avatar spec].
Skin: natural texture, visible pores, not airbrushed, peach fuzz,
subsurface scattering. [2-3 anti-stock markers from avatar spec].

COLOR REALISM: At least 3 saturated accent objects in the scene
(red stapler, green plant, orange book, blue mug, yellow sticky note).
The image must NOT be tonally uniform.

NOT posed, NOT stock photo, NOT airbrushed, NOT symmetrical, NOT clean desk,
NOT studio lighting, NOT white background, NOT perfect hair, NOT arms crossed,
NOT single light source, NOT ring light, NOT performed smile.

Output: 1200x630px, 16:9 aspect ratio.
```

---

## Phase 4: Generate with NanoBanana

### 4.1 API Call

Use Gemini 3.1 Flash Image (NanoBanana 2) via the Google AI API.

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

// API key from ~/.env (GOOGLE_AI_API_KEY)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp', // NanoBanana 2
  generationConfig: {
    responseModalities: ['IMAGE', 'TEXT'],
  },
});

const result = await model.generateContent(prompt);
// Extract image from response
const image = result.response.candidates[0].content.parts
  .find(p => p.inlineData);
const imageBuffer = Buffer.from(image.inlineData.data, 'base64');

// Save to vault campaign folder first for review
fs.writeFileSync(
  `~/Library/Mobile Documents/com~apple~CloudDocs/Julian's Documents/CREATIVE AGENCY OS/05_MARKETING/Campaigns/2026-03_Website_Blog/${slug}-draft.jpg`,
  imageBuffer
);
```

### 4.2 Cost Optimization

1. Prototype at 512px -- test expression, lighting, composition ($0.045/image)
2. Validate at 1K -- verify imperfections render correctly ($0.101/image)
3. Final at 2K for production ($0.151/image)
4. Do NOT generate at 4K every iteration

---

## Phase 5: Post-Processing

### 5.1 Category Band (Always Applied)

Add 85px solid color band at the bottom of every thumbnail. This is the brand system signature.

| Category | Band Color | Hex |
|----------|-----------|-----|
| YouTube | Electric yellow | `#FFD600` |
| Strategy/B2B | Deep navy | `#1B2A4A` |
| AI/Tech | Lime | `#A8FF3E` |
| Shorts | Bold red | `#E63946` |
| Analytics | Indigo | `#3730A3` |
| Growth/Monetization | Forest green | `#2D6A4F` |

Implementation: crop image to 545px height (630 - 85), place 85px band below. The band is BELOW the photo content, not overlaid.

### 5.2 Typography (Non-Negotiable)

**Font selection:**
- **Headlines:** Playfair Display Bold or Druk Wide Medium (editorial, not generic)
- **Fallback (canvas/code):** Bold condensed sans-serif — never default system sans
- **BANNED:** Inter, Roboto, Montserrat, Poppins, Arial, Lato, Open Sans (reads as template/default UI)

**Case and tracking:**
- ALL CAPS: only for labels under 5 words. ALWAYS add tracking +0.08em (letter-spacing equivalent)
- Sentence/Title case for headlines 6+ words. Tracking at 0 or slight negative

**Color:**
- Pure white `#FFFFFF` is acceptable but consider cream `#FAF3E0` or light gold `#F5E6C8` for warmth on photography
- Never grey text on photos — looks washed out

**Size:**
- Headlines: 72-96px (NOT larger — 108px invades the subject's space at 1200x630)
- Subtitle: 24-32px
- Ratio: 2.5-3:1 between headline and subtitle

**Scrim:**
- 40-50% black gradient from left edge fading right. NEVER a solid rectangle
- The gradient should feel like natural shadow, not an overlay

**Padding:**
- Minimum 60px between text edge and nearest subject element
- Minimum 40px from frame edges (120px from left edge for text positioning)

### 5.3 Text Overlay Application (Tier 2 Only)

When text is needed:
- Font per 5.2 rules (Playfair Display Bold preferred, bold condensed sans fallback)
- Cream white `#FAF3E0` text (warmer than pure white)
- 40-50% opacity dark gradient scrim on the left side (NOT a box — see 5.2)
- Left-aligned in the left 40% of the hero zone
- Maximum 5 words
- Person's eyeline should point AWAY from text (not "presenting" it)
- Test at 300px wide -- if illegible, increase weight or size

### 5.4 File Output

- Format: JPG
- Dimensions: 1200 x 630px
- File size: < 200KB
- Save final to: `content/blog/{slug}/cover.jpg`

---

## Phase 6: Devil's Advocate

Before finalizing, run these tests:

### Scroll Test
Imagine this in a LinkedIn feed between a job announcement and a company update. At normal scroll speed, does it stop you? If not:
- "Looks like every other thumbnail" -> needs stronger reality markers
- "Can't tell what it's about" -> hook not clear enough
- "Too busy" -> remove 30% of desk items
- "Too plain" -> needs environmental depth

### Share Test ("Slack Forward")
Would a VP forward this in Slack with zero explanation? The image + article title together must be self-explanatory, credible, and clearly relevant to team decisions. No preamble needed.

### Click Test
After seeing the image, do I feel "I need to know more"? If not, the hook is too resolved or the expression is too static.

### "This." Test
Would a VP repost this on LinkedIn with just "This."? Requirements:
1. Takes a strong position
2. Can be digested in-feed
3. Makes the sharer look prophetic, not reactive

### FOFU Test
Does it trigger Fear of Messing Up professionally? The person in the image should feel like a peer who is already dealing with something you are not. Combined with the right article title, the composite message is: "A person at your level is already on this. Are you?"

### Documentary Test
Does it feel like a journalist captured this during a real workday, or like a brand arranged a photoshoot? If it reads as brand -> the expression is too perfect, the desk is too clean, or the lighting is too uniform. Fix the weakest element.

### The 4 Emotional States (At Least 1 Must Trigger)
- **Vindication:** "I've been saying this."
- **Advantage:** "I saw this before my peers."
- **Urgency:** "Our team needs to read this now."
- **Aesthetic respect:** "Whoever made this thinks at my level."

---

## Phase 7: Quality Gate (Must Pass ALL)

### Portrait Quality
- [ ] Skin has at least 2 Tier-2 imperfection tokens (freckles, mole, asymmetry, undereye shadow)
- [ ] Expression is mid-action (not static or posed)
- [ ] Anti-pattern negation block was included in prompt
- [ ] Subsurface scattering referenced
- [ ] Background is environmental (not white, not plain gray)
- [ ] Minimum 4 reality markers on desk/environment
- [ ] Mixed practical lighting (multiple color temperatures)

### Avatar Consistency
- [ ] Avatar's 5-7 consistency anchors are present
- [ ] Wardrobe matches avatar spec (one professional + one casual element)
- [ ] Anti-stock markers from avatar spec are visible

### Composition
- [ ] Template (A/B/C/D/E) explicitly chosen and applied
- [ ] Person's eyeline is intentional and matches template logic
- [ ] Human face visible and expressive at 300px wide

### Technical
- [ ] Image is 1200 x 630px
- [ ] File size < 200KB (JPG)
- [ ] All text within central 60% hero zone (720 x 380px)
- [ ] No text in outer 10% dead zone
- [ ] Text (if present) is maximum 5 words at 72px+
- [ ] Passes 20% opacity test (hierarchy still readable)

### Brand Consistency
- [ ] Bottom category-color band present (85px, correct color)
- [ ] Maximum 3 dominant colors (not counting skin/hair)
- [ ] Portra warmth on skin tones (warm even in cool scenes)
- [ ] No purple gradients anywhere
- [ ] No logo stamp (the system IS the brand)

### CTR / Psychology
- [ ] Creates curiosity gap, not a summary
- [ ] Emotional premise communicable from image alone
- [ ] Would stop scroll for 1+ seconds in a feed
- [ ] Passes at least 1 of: Slack Forward / "This." / FOFU test
- [ ] Uses B2B buyer language, not consumer language

### Auto-Reject Triggers (Any One Disqualifies)
- Airbrushed / poreless skin
- Arms crossed at camera
- White or pure gray background
- Perfect symmetrical features
- More than 5 words in hero zone
- Purple gradients
- Expression recognizable as stock photo pose
- Medium gray background (#808080-#BBBBBB)
- Consumer vocabulary in text overlay ("views", "followers", "viral")

---

## When NOT to Use Documentary Style (30-40% of Articles)

### Pure Data Articles -> Data-Dominant Layout (Template B)
When the hook IS a shocking number ("47% Drop in Organic Reach"), the documentary person-at-desk dilutes the data's impact. Use Template B: face on right 30%, stat on left 60%.
**Tags:** Articles where hook is a specific number, benchmark, or metric.
**Estimated:** 8-10 of 55 articles.

### Confrontational Hot Takes -> Close-Up Challenge (Template D)
When the headline is a direct challenge ("Your Content Strategy Is Destroying Your Brand"), documentary is too gentle. Tight crop, direct eye contact, minimal environment. Confrontation from the face, not the scene.
**Tags:** Opinion pieces, industry criticism, contrarian takes.
**Estimated:** 5-7 of 55 articles.

### Tutorials / How-To -> In-Motion (Template E)
Step-by-step guides need someone DOING the thing, not someone talking about the thing. Hands on keyboard, mid-task action visible.
**Tags:** Pure how-to guides, process articles.
**Estimated:** 4-6 of 55 articles.

### Shorts / High-Energy -> Close-Up + Saturation (Template D variant)
Documentary calm does not match kinetic Shorts energy. Tighter crops, more saturated color, dynamic body language.
**Tags:** `shorts`, high-energy format content.
**Estimated:** 3-5 of 55 articles.

**All alternatives maintain the same photorealistic, anti-stock DNA.** Portra warmth, natural skin, no airbrushing, reality markers. Only the composition and energy level change.

---

## Composition Templates Reference

### Template A — The Reaction Shot
Person center-to-right third, upper body, eyeline toward left (where text lives). 85mm f/1.4. Environment present but shallow DOF. Use for: news, updates, urgency.

### Template B — Data + Person Split
Face right 30%, stat left 60%. Tight crop. Clean tonal background. Eyeline toward data. Use for: analytics, benchmarks, shocking numbers.

### Template C — Full Environmental
Person left third, upper body visible. 50mm natural perspective. Environment fully present. Eyeline slightly past camera. Use for: growth, monetization, strategy deep-dives.

### Template D — Close-Up Challenge
Center, face and top shoulders only. 85mm f/1.4. Minimal environment (color temperature only). Direct or near-direct eye contact. Use for: hot takes, Shorts, confrontational hooks.

### Template E — In-Motion
Center, full upper body. Mid-task action visible (typing, gesturing, presenting). Eyeline down or to side. Use for: tutorials, how-to, process guides.

---

## Category Color System

| Category | Scene Tone | Text Accent | Band Color |
|----------|-----------|-------------|-----------|
| YouTube | Warm amber-tungsten | `#FFD600` on `#0F0F0F` | `#FFD600` |
| Strategy/B2B | Cool-neutral editorial | `#FF6B6B` on `#1B2A4A` | `#1B2A4A` |
| AI/Tech | Cool-blue ambient, grounded | `#A8FF3E` on `#1C1C1E` | `#A8FF3E` |
| Shorts | High-energy, high-contrast | `#E63946` on white | `#E63946` |
| Analytics | Clean editorial | White on `#3730A3` | `#3730A3` |
| Growth | Aspirational but earned | `#2D6A4F` on `#FAF7F0` | `#2D6A4F` |

---

## File Locations

```
~/projects/hypeon-website/
├── scripts/
│   └── generate-cover-{slug}.js  # Per-article generation script
├── content/blog/{slug}/
│   └── cover.jpg                  # Final output (1200x630, <200KB)

~/Library/Mobile Documents/.../CREATIVE AGENCY OS/
├── 05_MARKETING/Campaigns/2026-03_Website_Blog/
│   ├── Avatar_System.md           # Avatar definitions
│   ├── Thumbnail_Style_Guide.md   # Approved style + principles
│   └── {slug}-draft.jpg           # Draft generations for review
├── 01_FRAMEWORKS/Production/
│   ├── Photorealistic_Portrait_Prompts.md  # Documentary style section
│   └── NanoBanana_Prompt_Guide.md          # Template 5 (documentary)
```

## Reference

- Vault: `01_FRAMEWORKS/Production/Photorealistic_Portrait_Prompts.md` -- documentary style section
- Vault: `01_FRAMEWORKS/Production/NanoBanana_Prompt_Guide.md` -- Template 5 (documentary candid)
- Campaign: `05_MARKETING/Campaigns/2026-03_Website_Blog/Avatar_System.md`
- Campaign: `05_MARKETING/Campaigns/2026-03_Website_Blog/Thumbnail_Style_Guide.md`
