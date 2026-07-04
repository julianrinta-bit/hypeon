/**
 * Generate: "Multi-Language" card image for hypeon-website
 * Section: "What We Make" — card: "Content for global audiences in 15 languages"
 * Usage: background image for 430×280px card (landscape ~3:2)
 * Dark gradient overlay on the LOWER portion → preserve market scene in upper/center
 *
 * METHOD: image-to-image with reference /tmp/refs2/multilang.jpg
 * Reference shows: presenter in vibrant international street market, colorful umbrellas
 * (red/blue/green), food stalls, local companion — travel/global content mood
 *
 * Framework: hypeon-imagery SKILL — Layer 1, 8 pillars addressed
 * Model priority: gemini-3-pro-image-preview > gemini-3.1-flash-image-preview > gemini-2.5-flash-image
 * Retry on 529 (overload) up to 3 times with backoff
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { writeFileSync, readFileSync } from "fs";

const API_KEY = "***REMOVED***";
const REFERENCE_PATH = "/tmp/refs2/multilang.jpg";
const DEST = "/Users/julianrinta/projects/hypeon-website/public/images/whatwemake/multilanguage.jpg";

// ─── PROMPT — image-to-image recreation ─────────────────────────────────────
// Short prompt: image leads, text guides originality + technical quality
// Reference scene: content creator filming in vibrant international street market

const PROMPT = `Recreate this photograph as a completely original image — new, non-identifiable people with different faces — a content creator filming on-location in a vibrant international street market.

SCENE (match the reference composition): A tall male presenter/content creator in his early-to-mid 30s (European or Western appearance, non-famous, non-identifiable new face) standing in a busy street market, holding a handheld microphone or a small gimbal-mounted camera up as if speaking to it. Beside him, a local woman in her late 20s (East or Southeast Asian appearance, non-identifiable, different from the reference) looking toward the market stalls or glancing at the presenter. The two people are the main subjects, positioned center-left in the frame.

MARKET ENVIRONMENT: A dense, colorful international street market — style reminiscent of Southeast Asian or Latin American wet markets. Colorful market umbrellas overhead in RED, BLUE, YELLOW, GREEN — visible in background. Food stalls, fresh produce, spice vendors, green leafy vegetables piled high (similar to the large green leaves visible in the reference), bottles of sauces and condiments on shelves behind. Busy background with market vendors and shoppers out of focus in bokeh. Stacked wooden crates and market tables.

MOOD: Documentary travel content, on-location, authentic global audience, multicultural, vibrant, alive. NOT a tourism ad. NOT editorial. Feels like real on-location YouTube travel content.

Shot on Canon EOS R5 with 35mm f/2.0 lens, ISO 800. Kodak Portra 400 tonality — warm skintones, slightly desaturated midtones, matte film finish. Overcast market daylight (5800K diffused), with colored light cast from the umbrella canopy above creating color pools on subjects.

PRESENTER CLOTHING (Pillar 7): Casual travel attire — a soft heather-gray jersey cotton crew-neck t-shirt (visible body-conforming drape, faint seam shadow), light olive cargo shorts or washed denim jeans. Sturdy brown leather-strap sandals. Small practical travel backpack strap visible at one shoulder. Microphone or compact gimbal in raised right hand.

LOCAL COMPANION CLOTHING: Mauve or burgundy casual short-sleeve top with slight drape, olive or khaki pants. Small pendant necklace. Natural hair down.

SKIN (Pillar 1 — Tier 1 + Tier 2): Both subjects — visible pores, not airbrushed, peach fuzz, subsurface scattering, natural skin texture variation. Presenter: slight undereye shadow, light sun-exposed skin, scattered light freckles at nose bridge, natural asymmetry. Companion: warm olive-toned natural skin, slight sheen from market warmth, natural lip color.

HAIR (Pillar 6): Presenter — short to medium natural hair, slightly tousled from travel, individual flyaway strands. Companion — dark straight hair, loose natural fall, one strand partially across shoulder.

EXPRESSION (Pillar 5): Presenter — mid-sentence, engaged, mouth slightly open in presentation mode, energetic but natural — caught while speaking to the camera/microphone, not posed. Companion — natural looking slightly off toward market stalls, candid, curious expression. Neither looking directly at the photographing camera.

LIGHTING (Pillar 4): Primary — soft overcast market daylight 5800K. Secondary — warm ambient from market umbrella canopy casting colored dappled light. The colored umbrella (red/blue) overhead creates subtle color patches on subjects. Natural environmental mixed light. No studio light, no ring light, no flash.

COLOR GRADE (Pillar 8): Kodak Portra 400 warmth with slight documentary desaturation. Lifted blacks. Warm midtones. Cool slightly desaturated shadows. Matte finish. The SATURATED COLOR comes entirely from the market environment — umbrellas (#D32F2F red, #1565C0 blue, #F9A825 yellow), green vegetables (#2E7D32), orange/red sauce bottles.

MICRO-REALISM MODIFIER:
Faint dust motes in market air near light gaps, slight lens vignetting at frame corners, natural sensor noise in shadow regions, subtle chromatic aberration at frame edges. Realistic pore variation on both subjects. Individual flyaway hair strands. Fabric drape consistent with body posture. Natural depth-of-field with graduated focus falloff — subjects sharp, market background in bokeh at 20-30% sharpness with blurred umbrella colors as background. Cat-eye bokeh at frame corners from market overhead lights. Natural film scan aesthetic.

COMPOSITION: Both subjects positioned in upper 55% and center of frame. The LOWER 40% of frame is intentionally dark-tolerant: market floor level, lower portions of stalls, blurred ground details — this zone will be obscured by dark gradient overlay in card design.

ANTI-STOCK NEGATION:
NOT posed — NOT stock photo expression — NOT airbrushed poreless skin — NOT symmetrical features — NOT single light source — NOT perfect hair — NOT studio background — NOT tourist-brochure happy grin — NOT identifiable celebrity or real person — NOT medium gray background — NOT corporate — NO TEXT, NO WATERMARKS, NO LOGOS anywhere in the image.

COLOR REALISM: Market environment contains minimum 5 saturated color zones: red umbrella (#D32F2F), blue umbrella (#1565C0), green leafy vegetables (#2E7D32), yellow/amber produce (#F9A825), orange/red sauce bottles (#BF360C). Real markets have chromatic chaos — honor it.

Output: aspect ratio 3:2, landscape orientation, 2K resolution.`;

// ─── IMAGE-TO-IMAGE: load reference as inlineData ───────────────────────────

function loadReferenceImage(path) {
  const buffer = readFileSync(path);
  const base64 = buffer.toString("base64");
  return {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64,
    },
  };
}

// ─── RETRY LOGIC (handle 529 overload) ──────────────────────────────────────

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithRetry(model, parts, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`  Attempt ${attempt}/${maxRetries}...`);
      const result = await model.generateContent(parts);
      return result;
    } catch (err) {
      const is529 = err.message?.includes("529") || err.message?.includes("overloaded");
      if (is529 && attempt < maxRetries) {
        const waitSecs = attempt * 12; // 12s, 24s
        console.log(`  529 overloaded — waiting ${waitSecs}s before retry...`);
        await sleep(waitSecs * 1000);
      } else {
        throw err;
      }
    }
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function generateImage() {
  console.log(`\nLoading reference image: ${REFERENCE_PATH}`);
  const referenceImage = loadReferenceImage(REFERENCE_PATH);
  console.log(`  Reference loaded — ${(readFileSync(REFERENCE_PATH).length / 1024).toFixed(1)} KB`);

  const genAI = new GoogleGenerativeAI(API_KEY);

  // Parts: reference image first, then text prompt
  const parts = [referenceImage, { text: PROMPT }];

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

      const result = await generateWithRetry(model, parts, 3);
      const candidates = result.response.candidates ?? [];
      const contentParts = candidates[0]?.content?.parts ?? [];

      const imagePart = contentParts.find((p) => p.inlineData?.mimeType?.startsWith("image/"));
      const textPart = contentParts.find((p) => p.text);

      if (imagePart) {
        const { data, mimeType } = imagePart.inlineData;
        const buffer = Buffer.from(data, "base64");

        writeFileSync(DEST, buffer);
        console.log(`\n✓ Image saved: ${DEST}`);
        console.log(`  Model: ${modelId}`);
        console.log(`  MIME: ${mimeType}`);
        console.log(`  Size: ${(buffer.length / 1024).toFixed(1)} KB`);
        if (textPart?.text) {
          console.log(`  Model note: ${textPart.text.substring(0, 400)}`);
        }
        return { success: true, model: modelId, size: buffer.length };
      } else {
        console.log(`  No image in response from ${modelId}.`);
        if (textPart?.text) console.log(`  Text: ${textPart.text.substring(0, 500)}`);
      }
    } catch (err) {
      console.log(`  Error with ${modelId}: ${err.message?.substring(0, 300)}`);
    }
  }

  throw new Error("All models failed to produce an image.");
}

generateImage()
  .then((res) => {
    console.log(`\nDone. Model used: ${res.model}, size: ${(res.size / 1024).toFixed(1)} KB`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(`\nFatal error: ${err.message}`);
    process.exit(1);
  });
