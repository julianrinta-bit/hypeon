/**
 * Generate: "Influencers & Creators" card image for hypeon-website
 * Section: "What We Make"
 * Usage: background image for 430×280px card (landscape ~1.5:1)
 * Dark gradient overlay on the LOWER portion → subject must be upper/center
 * Faceless brand: no identifiable or famous person
 *
 * Framework: hypeon-imagery SKILL — Layer 1 (standalone image)
 * All 8 pillars addressed. SCHEMA AVANZATO level.
 * Model priority: gemini-3-pro-image-preview > gemini-3.1-flash-image-preview > gemini-2.5-flash-image
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { writeFileSync } from "fs";

const API_KEY = "***REMOVED***";
const DEST = "/Users/julianrinta/projects/hypeon-website/public/images/whatwemake/influencers.jpg";

// PROMPT — SCHEMA AVANZATO
// 8 pillars fully addressed + micro-realism block + anti-stock + anti-AI color realism
// Composition: subject in upper half / center; lower third tolerates dark overlay

const PROMPT = `Documentary-style candid photograph. NOT editorial, NOT art-directed. NOT posed. Lifestyle creator photography.

Shot on Canon EOS R5 with 35mm f/2.0 lens, ISO 800. Kodak Portra 400 tonality — warm skintones, lifted shadows, slightly golden midtones, matte film finish.

SUBJECT: A young content creator in their mid-to-late 20s (non-famous, generic individual — no identifiable real person), caught mid-recording: leaning slightly forward toward a compact mirrorless camera on a tabletop tripod, one hand adjusting the camera frame, expression of focused concentration — eyes alert, slight knit of brow, mouth just barely open. Natural energy. Authentic creator vibe, not a TV presenter.

COMPOSITION: Subject positioned in the UPPER 55% and CENTER of frame — their face, hands, and recording camera are the visual anchor. LOWER 40% of frame is intentionally low-information and dark-tolerant: desk surface, cable glimpse, ring light base barely visible, bokeh floor — this zone will be obscured by a dark gradient overlay in the final card design. Aspect ratio 3:2 (landscape). High resolution 2K.

CREATOR SETUP: a sleek compact mirrorless camera on a tabletop tripod in the foreground (slightly out of focus but recognizable), a ring light slightly off-frame casting warm circular catchlight visible as ring reflection in the subject's irises. Behind the subject: a modern home studio wall — warm-painted concrete or exposed brick with floating shelves containing: a jade green pothos plant (#2E7D4F), a small orange vintage transistor radio (#D4612A), one bright yellow book spine (#F2C94C), and a string of warm Edison bulb lights (#FFC46B) casting ambient glow. The setup feels real and lived-in.

CLOTHING (Pillar 7): Bold hoodie in deep electric teal (#1A6B7A), oversized, visible ribbed cuffs, fine cotton-fleece blend, slight pilling at sleeve edge from use. One earbud visible in left ear. Raw-edge denim jeans partially visible.

LIGHTING (Pillar 4): Primary: warm ring light from front at 3200K, creating circular catchlight in both irises, soft circular diffusion wrapping the face warmly. Secondary: window light from upper left at 5500K cool daylight, catching left cheek and shoulder. No fill correction — warm-cool color temperature split visible across face (warm right side from ring light, cool left side from window). Upper corners of frame fall into natural darkness.

SKIN (Pillar 1 — Tier 1 + Tier 2): Visible pores — natural skin grain — not airbrushed — peach fuzz — subsurface scattering — skin texture variation — natural skin imperfections. PLUS: slight undereye shadow, light laugh lines at eye corners, slight redness at nose tip, scattered freckles across nose bridge, subtle asymmetry in brow height (left very slightly higher).

HAIR (Pillar 6): Slightly tousled, not styled. Individual flyaway strands at perimeter. A few hairs across forehead. Natural casual hair, any dark or medium natural color.

EXPRESSION (Pillar 5): Mid-action — caught while framing their own recording shot, not looking at the photographing camera but at their OWN recording camera, adjusting focus. One eye slightly more open from concentration. Mouth 5% open. Zero stock pose. Zero performed smile.

COLOR GRADE (Pillar 8): Kodak Portra 400 warmth. Lifted blacks (not crushed). Slight warm orange toning in midtones. Cool slightly desaturated shadows. Matte finish. Film scan aesthetic. Slight halation around ring light edge.

MICRO-REALISM MODIFIER:
Faint dust motes suspended near ring light, slight lens vignetting at corners, subtle chromatic aberration at frame edges with faint purple-cyan fringing, natural sensor noise in shadow regions, cat-eye bokeh at frame corners. Realistic pore variation by zone (fine on forehead, enlarged on nose and cheeks), faint vein tracery at temples, off-white sclera with thin red capillaries at inner corners, tear film glint on lower eyelid, subtle facial asymmetry (one eyebrow very slightly higher), natural skin specularity on forehead and nose bridge, slight under-eye shadow, redness at nostril edges. Individual flyaway hair strands at perimeter, fine hair translucency at edges. Fabric pilling at friction points (cuff edge), positional wrinkles consistent with leaning-forward posture. Natural depth-of-field with non-linear focus falloff, bokeh with natural brightness variation and specular highlight blooming.

ANTI-STOCK NEGATION: NOT posed — NOT stock photo expression — NOT airbrushed poreless skin — NOT symmetrical features — NOT single light source — NOT perfect hair — NOT arms crossed — NOT white or gray background — NOT studio lighting only — NOT performed smile — NOT medium gray background (#808080-#BBBBBB) — NOT a TV presenter look — NOT a corporate headshot — NOT identifiable real person or celebrity.

COLOR REALISM: Background environment contains at least 4 saturated color objects: jade green plant (#2E7D4F), orange radio (#D4612A), yellow book spine (#F2C94C), warm Edison bulb glow (#FFC46B). Real creator spaces have chromatic variety.

Output: aspect ratio 3:2, resolution 2K, landscape orientation.`;

async function generateImage() {
  const genAI = new GoogleGenerativeAI(API_KEY);

  const models = [
    "gemini-3-pro-image-preview",
    "gemini-3.1-flash-image-preview",
    "gemini-2.5-flash-image",
  ];

  for (const modelId of models) {
    console.log(`\nTrying model: ${modelId}`);
    try {
      const model = genAI.getGenerativeModel({
        model: modelId,
        generationConfig: {
          responseModalities: ["IMAGE", "TEXT"],
        },
      });

      const result = await model.generateContent(PROMPT);
      const parts = result.response.candidates?.[0]?.content?.parts ?? [];

      const imagePart = parts.find((p) => p.inlineData?.mimeType?.startsWith("image/"));
      const textPart = parts.find((p) => p.text);

      if (imagePart) {
        const { data, mimeType } = imagePart.inlineData;
        const buffer = Buffer.from(data, "base64");

        writeFileSync(DEST, buffer);
        console.log(`\n✓ Image saved: ${DEST}`);
        console.log(`  Model: ${modelId}`);
        console.log(`  MIME: ${mimeType}`);
        console.log(`  Size: ${(buffer.length / 1024).toFixed(1)} KB`);
        if (textPart?.text) {
          console.log(`  Model note: ${textPart.text.substring(0, 300)}`);
        }
        return { success: true, model: modelId, size: buffer.length };
      } else {
        console.log(`  No image in response from ${modelId}.`);
        if (textPart?.text) console.log(`  Text: ${textPart.text.substring(0, 400)}`);
      }
    } catch (err) {
      console.log(`  Error with ${modelId}: ${err.message?.substring(0, 200)}`);
    }
  }

  throw new Error("All models failed to produce an image.");
}

generateImage().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
