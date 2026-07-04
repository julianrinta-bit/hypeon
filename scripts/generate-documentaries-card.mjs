/**
 * Generate: "Documentaries" card image for hypeon-website
 * Section: "What We Make" — Narrative docs & investigative series
 *
 * METHOD: image-to-image — reference passed as inlineData (visual input)
 * Reference: /tmp/refs2/docs_fosil.jpg
 *   Young blond creator with round glasses, ochre vest, lying in red desert sand,
 *   brushing a triceratops dinosaur skull fossil. Blue sky, rocky formations.
 *   "extinct" text + yellow arrow are thumbnail overlays — NOT part of the scene.
 *
 * OUTPUT: Original person (different face, same mood), landscape 3:2, no overlays.
 * Lower portion dark-tolerant for card text overlay.
 *
 * Framework: hypeon-imagery SKILL — Layer 1 (standalone image, photo mode)
 * All 8 pillars addressed. SCHEMA AVANZATO level.
 * Model priority: gemini-3.1-flash-image-preview > gemini-2.5-flash-image
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { writeFileSync, readFileSync } from "fs";

const API_KEY = process.env.GOOGLE_AI_API_KEY;
const REFERENCE_PATH = "/tmp/refs2/docs_fosil.jpg";
const DEST = "/Users/julianrinta/projects/hypeon-website/public/images/whatwemake/documentaries.jpg";

// SHORT PROMPT — the image leads, prompt guides mood/composition/originality
// Per skill: image-to-image uses a concise prompt; the reference carries the visual
const PROMPT = `Recreate this photograph as a completely original image — a young content creator (different face, non-identifiable, original person) lying prone in red desert sand, carefully excavating a large dinosaur skull fossil (triceratops) with a paleontologist's brush. Documentary adventure mood. Cinematic and photorealistic.

Shot on Canon EOS R5 with 35mm f/2.8 lens, ISO 640. Kodak Portra 400 tonality — warm golden desert tones, lifted shadows, matte film finish.

SUBJECT: Male creator, mid-to-late 20s, new original face (NOT the person in the reference — create a completely different, non-identifiable individual). Blonde or light-brown tousled hair, round wire-frame glasses. Wearing an ochre/amber field vest (#C8843A) over a light khaki shirt. Lying prone on the ground in focused concentration, one hand holding a paleontologist's brush gently sweeping red desert sand off the fossil. Expression: intense focused wonder — mouth slightly open, eyes wide, brow knit with excitement of discovery. Mid-action, NOT posed.

FOSSIL: A large triceratops skull partially embedded in red-ochre desert sand (#B8532A). Bone texture is pale ivory-cream (#E8D5B0), weathered, cracked, ancient. Horn visible. Partially excavated — some sand still covering sections. Takes up lower-left half of frame.

COMPOSITION: Person's face and upper torso in upper-center/upper-right of frame. Fossil skull in lower-left. Blue sky and red rocky desert formations in background. LOWER THIRD of image is dark-tolerant: fossil, sand, ground — this zone will be obscured by a dark gradient overlay in the card design. Aspect ratio 3:2 landscape. Wide angle feel.

ENVIRONMENT: Vast red-sand desert landscape. Deep blue sky (#1A6BB5) with faint cirrus clouds. Rocky sandstone formations (terracotta, sienna) in the background, slightly out of focus. Hot afternoon light. Arid, adventure, science documentary atmosphere.

LIGHTING (Pillar 4): Primary: direct midday desert sun from upper-left at 5800K, harsh directional light casting slight shadows under glasses frames and chin. Secondary: warm reflected light from red sand at 3400K bouncing up from below (fills under-chin, warm on lower face). No artificial fill. Color temperature split: cool blue-white top light vs warm red sand bounce.

SKIN (Pillar 1): Natural sun-touched skin. Visible pore texture. Light tan. Slight sunburn redness on nose bridge and cheekbones. Peach fuzz on cheeks. Slight perspiration sheen on forehead. Subsurface scattering on ears. Asymmetry — one brow slightly higher.

HAIR (Pillar 6): Tousled, slightly disheveled from lying in field. Individual flyaway strands at perimeter. A few strands across forehead. Slightly damp at temples from heat. Natural wave.

CLOTHING (Pillar 7): Ochre/amber field vest (#C8843A) with multiple pockets, nylon ripstop fabric, slight sheen, visible stitching, one small abrasion on elbow from ground contact. Khaki shirt visible at collar and sleeves — cotton weave texture, slight wrinkles from being prone.

MICRO-REALISM MODIFIER:
Faint dust motes in the air near the fossil excavation, slight lens vignetting at corners, subtle chromatic aberration at frame edges with faint purple-cyan fringing, natural sensor noise in shadow regions. Realistic pore variation by zone (fine on forehead, enlarged on nose and cheeks), faint perspiration on brow, off-white sclera with natural capillaries visible, tear film glint on lower eyelid, subtle facial asymmetry. Individual flyaway hair strands at perimeter. Fabric creases consistent with prone position. Natural depth-of-field with graduated falloff — fossil slightly blurred at very edges. Fine red sand particles on the fossil surface and on the vest fabric.

ANTI-STOCK NEGATION: NOT posed — NOT stock photo expression — NOT airbrushed skin — NOT symmetrical features — NOT white or gray background — NOT clean sterile setting — NOT a museum display — NOT a stock documentary photo — NOT identifiable real person or celebrity — NOT the same person as in the reference image — completely original face.

COLOR REALISM: Rich chromatic variety — deep blue sky (#1A6BB5), warm red-ochre sand (#B8532A), ochre amber vest (#C8843A), pale ivory fossil (#E8D5B0), terracotta rocky formations (#A0522D). At least 5 distinct saturated color zones. NOT tonally uniform.

NO TEXT, NO ARROWS, NO GRAPHIC OVERLAYS, NO WATERMARKS of any kind.

Output: aspect ratio 3:2, resolution 2K, landscape orientation.`;

async function generateImage() {
  const genAI = new GoogleGenerativeAI(API_KEY);

  // Read reference image as inlineData
  const refImageBuffer = readFileSync(REFERENCE_PATH);
  const refImageBase64 = refImageBuffer.toString("base64");
  console.log(`Reference image loaded: ${REFERENCE_PATH} (${(refImageBuffer.length / 1024).toFixed(1)} KB)`);

  const models = [
    "gemini-3.1-flash-image-preview",
    "gemini-2.5-flash-image",
  ];

  for (const modelId of models) {
    console.log(`\nTrying model: ${modelId}`);

    for (let attempt = 1; attempt <= 3; attempt++) {
      if (attempt > 1) {
        const waitSec = attempt * 8;
        console.log(`  Attempt ${attempt}/3 — waiting ${waitSec}s before retry...`);
        await new Promise(r => setTimeout(r, waitSec * 1000));
      }

      try {
        const model = genAI.getGenerativeModel({
          model: modelId,
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
          },
        });

        // image-to-image: pass reference as inlineData + text prompt
        const result = await model.generateContent([
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: refImageBase64,
            },
          },
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
          console.log(`  MIME: ${mimeType}`);
          console.log(`  Size: ${(buffer.length / 1024).toFixed(1)} KB`);
          console.log(`  Method: image-to-image (reference as inlineData)`);
          if (textPart?.text) {
            console.log(`  Model note: ${textPart.text.substring(0, 400)}`);
          }
          return { success: true, model: modelId, size: buffer.length };
        } else {
          console.log(`  No image in response from ${modelId} (attempt ${attempt}).`);
          if (textPart?.text) console.log(`  Text: ${textPart.text.substring(0, 400)}`);
          // If no image but no error either, break inner loop and try next model
          break;
        }
      } catch (err) {
        const msg = err.message ?? String(err);
        console.log(`  Error (attempt ${attempt}): ${msg.substring(0, 300)}`);
        if (!msg.includes("529") && !msg.includes("overloaded") && !msg.includes("503") && !msg.includes("rate")) {
          // Non-retryable error — move to next model
          break;
        }
        // 529/503/rate → retry after wait
        if (attempt === 3) {
          console.log(`  All 3 attempts failed for ${modelId}, trying next model.`);
        }
      }
    }
  }

  throw new Error("All models and attempts failed to produce an image.");
}

generateImage().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
