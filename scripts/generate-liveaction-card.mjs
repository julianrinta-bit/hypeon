/**
 * Generate: "Live Action" card image for hypeon-website
 * Section: "What We Make" → On-location & studio production
 * Usage: background image for 430×280px card (landscape ~3:2)
 * Dark gradient overlay on the LOWER portion → subject must be upper/center
 *
 * COMPOSITE IMAGE-TO-IMAGE:
 *   Ref 1 (/tmp/refs2/liveaction_scene.jpg): TV production studio set —
 *     professional video camera on tripod, studio lights hanging from ceiling.
 *     IGNORE green chroma key — elevate to cinematic dark studio background.
 *   Ref 2 (/tmp/refs2/liveaction_girl.jpg): Young female presenter reference —
 *     long wavy chestnut-brown hair, natural/attractive look.
 *     Use VIBE only (hair style, natural energy) — NOT her exact face.
 *
 * Framework: hypeon-imagery SKILL — Layer 1 (standalone image)
 * All 8 pillars addressed. SCHEMA AVANZATO level.
 * Model priority: gemini-3.1-flash-image-preview > gemini-2.5-flash-image
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { writeFileSync, readFileSync } from "fs";

const API_KEY = process.env.GOOGLE_AI_API_KEY;
const DEST = "/Users/julianrinta/projects/hypeon-website/public/images/whatwemake/liveaction.jpg";

// ─── Load both reference images as inlineData ───────────────────────────────
function loadImageInline(filePath, mimeType = "image/jpeg") {
  const buffer = readFileSync(filePath);
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

const ref1 = loadImageInline("/tmp/refs2/liveaction_scene.jpg");
const ref2 = loadImageInline("/tmp/refs2/liveaction_girl.jpg");

// ─── PROMPT — SCHEMA AVANZATO ────────────────────────────────────────────────
// 8 pillars fully addressed + micro-realism block + anti-stock + anti-AI color
// Composition: presenter upper-center; lower 35% tolerates dark overlay
// Refs: ref1 = studio set concept, ref2 = presenter hair/vibe reference

const PROMPT = `Using the two reference images provided:
- Reference 1 shows a TV/film production studio set: professional broadcast camera on tripod, studio fresnel lights mounted from ceiling grid. Use this as the ENVIRONMENT concept — but elevate and reimagine it as a cinematic, dark-toned professional studio (replace the flat green chroma key with a sophisticated dark charcoal/slate background, keep the architectural bones: camera on tripod in foreground, overhead light rig). No green screen. No stock-photo feel.
- Reference 2 shows a young woman's hairstyle and natural energy — long wavy chestnut-brown hair, natural skin, relaxed-confident presence. Use this as STYLE INSPIRATION for the presenter's hair and overall vibe only. Generate a completely original, non-identifiable face — NOT her exact face.

GENERATE THIS COMPOSITE IMAGE:

Documentary-style production photograph. NOT editorial, NOT art-directed. Cinematic on-set realism.

Shot on Sony FX3 cinema camera with 35mm T1.5 cine lens, ISO 1600. ARRI LOG-C tonality — deep shadows, controlled highlights, filmic color separation, slight warm-cool split.

SUBJECT: Young female TV presenter/host, mid-20s (European, non-identifiable — completely original face — no real person). Standing upright, facing slightly toward a professional broadcast camera, mid-sentence or gesturing with one hand — caught in the natural flow of presenting, animated expression, confidence. Long wavy chestnut-brown hair (inspired by Reference 2's hair style), natural waves falling past shoulders, a few loose strands across forehead.

COMPOSITION: Presenter centered-left in upper 60% of frame. A large professional broadcast camera on heavy-duty tripod occupies the RIGHT foreground, partially in focus — the presenter is VISIBLE THROUGH/BESIDE the camera frame. Multiple studio fresnel lights visible overhead on ceiling grid, creating warm spotlighting pools. LOWER 35% of frame: studio floor with cable tracks, light stands base, equipment — low-information zone intentionally dark (will be covered by card gradient overlay). Aspect ratio 3:2 (landscape). High resolution 2K.

STUDIO ENVIRONMENT: Cinematic professional production studio. Dark charcoal/slate walls (#1C1C1E). Ceiling grid with 4-6 professional fresnel/HMI lights mounted, some aimed at presenter, some creating rim separation. Studio monitor visible in mid-background showing a waveform or feed (#2C2C2E screen). Cable management tracks on floor. One equipment cart visible in deep background (blurred). Real studio production energy — NOT a home setup, NOT a podcast studio.

CLOTHING (Pillar 7): Fitted blazer in deep burgundy-maroon (#6B2737), tailored, slightly open collar, fine wool-blend fabric with visible weave texture, slight crease at elbow from movement. Simple gold pendant necklace catching studio light. Dark high-waisted trousers (#1A1A2E), slight fabric sheen.

LIGHTING (Pillar 4): Primary: overhead studio key light (Fresnel, 4800K warm-white), creating crisp downward modeling on face and shoulders, catchlight at top of iris. Secondary: lateral fill from a large softbox at 6500K (cool), hitting presenter's left side — warm-cool temperature split visible across face. Rim light from behind-right at 3200K warm, separating hair from dark background with warm halo. Far corners of studio fall into deep darkness — no ambient fill. Studio monitor adds slight cool blue ambient on back wall.

SKIN (Pillar 1 — Tier 1 + Tier 2): Visible pores — natural skin grain — not airbrushed — peach fuzz — subsurface scattering at nose and ears. PLUS: light natural makeup but visible skin texture underneath, slight undereye shadow, natural brow asymmetry (left very slightly higher), barely-visible freckles across nose bridge, slight natural redness at nostril edges, natural lip lines.

HAIR (Pillar 6): Long wavy chestnut-brown hair, healthy natural shine from key light, individual flyaway strands at perimeter, slight movement suggesting recent turn of head, hair translucency at edges with backlight rim halo, natural slight frizz at crown, imperfect wave pattern.

EXPRESSION (Pillar 5): Mid-sentence — presenter caught while speaking to camera, slight forward lean of chin, mouth open 30% forming a word, eyes alert and direct, animated energy of natural presenting. NOT a rehearsed smile. NOT stock photo pose. Professional presence but human and alive.

COLOR GRADE (Pillar 8): ARRI LOG-C inspired. Deep rich shadows (not crushed). Warm midtones on skin. Cool-toned studio background. Teal-orange split complementary: warm skin against cool dark studio environment. Filmic grain texture. Natural color depth.

MICRO-REALISM MODIFIER:
Subtle dust motes suspended in key light beam, slight lens vignetting at corners, minimal chromatic aberration at frame edges with faint purple-cyan fringing, natural sensor noise in deep shadow regions, anamorphic-style horizontal lens flare from fresnel light source, cat-eye bokeh from out-of-focus studio lights in background. Realistic pore variation (fine on forehead, enlarged on nose and cheeks), faint vein tracery at temples, off-white sclera with thin red capillaries at inner corners, tear film glint from key light on lower eyelid, subtle facial asymmetry, natural skin specularity on forehead and nose bridge, slight under-eye shadow. Individual flyaway hair strands, fine hair translucency at rim-lit edges. Blazer fabric shows fold at elbow, slight lapel roll, visible weave grain. Natural depth-of-field with non-linear focus falloff — presenter sharp, foreground camera slightly soft, background studio elements progressively blurred.

ANTI-STOCK NEGATION: NOT posed — NOT stock photo expression — NOT airbrushed poreless skin — NOT symmetrical features — NOT single light source — NOT perfect hair — NOT arms crossed — NOT white or gray background — NOT generic studio backdrop — NOT identifiable real person — NOT celebrity — NOT performed smile — NOT medium gray background (#808080-#BBBBBB) — NO watermarks — NO text overlays.

COLOR REALISM: Studio environment has distinct color zones — warm key light pool (#FFC87A), cool background tones (#1C2B3A), burgundy blazer (#6B2737), gold jewelry catchlight (#D4AF37), teal monitor glow (#1A3A4A). Minimum 5 distinct saturated color zones visible.

Output: aspect ratio 3:2, resolution 2K, landscape orientation. No text. No watermarks.`;

// ─── Multi-model generation with 2 inlineData refs ─────────────────────────
async function generateImage() {
  const genAI = new GoogleGenerativeAI(API_KEY);

  const models = [
    "gemini-3.1-flash-image-preview",
    "gemini-2.5-flash-image",
  ];

  for (const modelId of models) {
    console.log(`\nTrying model: ${modelId}`);

    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
      attempt++;
      console.log(`  Attempt ${attempt}/${maxAttempts}...`);

      try {
        const model = genAI.getGenerativeModel({
          model: modelId,
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
          },
        });

        // Pass both reference images + the text prompt as a multi-part content array
        const result = await model.generateContent([
          ref1,
          ref2,
          { text: PROMPT },
        ]);

        const parts = result.response.candidates?.[0]?.content?.parts ?? [];
        const imagePart = parts.find((p) => p.inlineData?.mimeType?.startsWith("image/"));
        const textPart = parts.find((p) => p.text);

        if (imagePart) {
          const { data, mimeType } = imagePart.inlineData;
          const buffer = Buffer.from(data, "base64");

          writeFileSync(DEST, buffer);
          console.log(`\n✓ Image saved: ${DEST}`);
          console.log(`  Model: ${modelId}`);
          console.log(`  Attempt: ${attempt}`);
          console.log(`  MIME: ${mimeType}`);
          console.log(`  Size: ${(buffer.length / 1024).toFixed(1)} KB`);
          if (textPart?.text) {
            console.log(`  Model note: ${textPart.text.substring(0, 300)}`);
          }
          return { success: true, model: modelId, attempt, size: buffer.length };
        } else {
          console.log(`  No image in response.`);
          if (textPart?.text) console.log(`  Text: ${textPart.text.substring(0, 400)}`);
          // If no image (not a 529), don't retry this model
          break;
        }

      } catch (err) {
        const msg = err.message ?? "";
        const is529 = msg.includes("529") || msg.toLowerCase().includes("overloaded") || msg.toLowerCase().includes("resource exhausted");

        if (is529 && attempt < maxAttempts) {
          const waitSec = attempt * 8;
          console.log(`  529/overloaded — waiting ${waitSec}s before retry...`);
          await new Promise((r) => setTimeout(r, waitSec * 1000));
        } else {
          console.log(`  Error: ${msg.substring(0, 200)}`);
          break; // move to next model
        }
      }
    }
  }

  throw new Error("All models and attempts failed to produce an image.");
}

generateImage().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
