/**
 * Generate: "Podcasts & Talk Shows" card image for hypeon-website
 * Section: "What We Make"
 * Method: image-to-image STRICT FIDELITY — reference is the blueprint.
 *
 * Reference: /tmp/refs2/podcasts.jpg
 * Scene: young man with large black over-ear headphones, talking expressively
 * with one open hand raised, leaning toward a professional condenser mic on a
 * black boom arm. Warm saturated orange/terracotta wall. Two framed posters.
 * Black graphic t-shirt. Intimate podcast studio. Desk/equipment at bottom.
 *
 * FIDELITY TARGET: photocopy-level reproduction.
 * Change ONLY: (1) the person's face → new non-identifiable individual,
 *              (2) poster content → generic tasteful art, NO real brands.
 * Everything else: SAME as reference (framing, angle, lighting, pose, wall
 * color, mic, headphones, composition, mood, boom arm position, desk).
 *
 * Framework: hypeon-imagery SKILL v5 — Layer 1
 * Model: gemini-3.1-flash-image-preview (image-to-image)
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { writeFileSync, readFileSync } from "fs";

const API_KEY = process.env.GOOGLE_AI_API_KEY;
const REFERENCE_PATH = "/tmp/refs2/podcasts.jpg";
const DEST = "/Users/julianrinta/projects/hypeon-website/public/images/whatwemake/podcasts.jpg";

// STRICT FIDELITY PROMPT — the reference image IS the scene.
// Minimal text instructions. The model must treat the reference as the blueprint.
const PROMPT = `Recreate this photograph as faithfully as possible. This is an image recreation task — the reference IS the scene. Keep everything identical except for two specific changes.

CHANGE ONLY THESE TWO THINGS:
1. THE PERSON'S FACE — replace with a completely new, non-identifiable, non-famous young person (same age range: mid-20s, same general build and hair style if possible, but a different individual with a fully new face — no resemblance to anyone real)
2. THE FRAMED POSTERS on the wall — replace poster content with generic abstract art or tasteful illustration. NO text. NO "Bad Friends". NO real band names, logos, or recognizable brands. NO readable words anywhere on the posters. Keep the same number of posters (2), same frame styles, same wall positions.

KEEP EXACTLY THE SAME — do NOT change any of these:
- Camera angle and framing (medium shot, slight low angle)
- Subject position (centered, slightly left of center)
- Pose: subject is leaning forward slightly, right hand raised palm open toward camera, mid-gesture, mouth slightly open as if talking
- Large black over-ear headphones on the subject's head (same size, same style, same position)
- Professional large-diaphragm condenser microphone on a black boom arm/scissor arm in the foreground, crossing in front of the subject's face
- Warm saturated orange/terracotta wall color (the dominant background — this specific vibrant orange must be preserved)
- Black graphic t-shirt (no legible text or logos — same dark casual tee style)
- Desk/table surface visible at the very bottom of frame
- Cables, gear elements at edges of frame
- The overall warm, intimate, authentic podcast studio mood
- Lighting: warm front-facing light, no harsh shadows, the orange wall reflects warm color onto the subject
- Bokeh/depth of field: foreground mic slightly soft, background wall slightly blurred
- Photorealistic quality — this must look like a real photograph

PHOTOGRAPHY: Shot on Canon EOS R5 with 50mm f/1.8 lens, ISO 800. Kodak Portra 400 tonality. Warm skintones, lifted shadows, slightly golden midtones, matte film finish.

SKIN (8 pillars): Visible pores, natural texture, subsurface scattering, slight facial asymmetry, undereye shadow. NOT airbrushed. NOT poreless.

HAIR: Same general style as reference (slightly tousled, not styled). Individual flyaway strands.

MICRO-REALISM: Lens vignetting at corners, subtle chromatic aberration at frame edges, natural sensor noise, fabric texture on t-shirt, natural depth-of-field falloff, bokeh in background.

NO YouTube UI. NO title bars. NO video player controls. NO watermarks. NO progress bars. NO overlay text of any kind. Clean photograph only.

Output: aspect ratio 3:2 landscape, resolution 2K.`;

async function generateImage() {
  const genAI = new GoogleGenerativeAI(API_KEY);

  // Read reference image as base64 inlineData
  const refBuffer = readFileSync(REFERENCE_PATH);
  const refBase64 = refBuffer.toString("base64");

  const models = [
    "gemini-3.1-flash-image-preview",
    "gemini-2.5-flash-image",
  ];

  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 10000;

  for (const modelId of models) {
    console.log(`\nTrying model: ${modelId}`);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelId,
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
          },
        });

        // image-to-image: reference image FIRST (the blueprint), then the guiding prompt
        const result = await model.generateContent([
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: refBase64,
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
          console.log(`  Attempt: ${attempt}`);
          console.log(`  MIME: ${mimeType}`);
          console.log(`  Size: ${(buffer.length / 1024).toFixed(1)} KB`);
          if (textPart?.text) {
            console.log(`  Model note: ${textPart.text.substring(0, 400)}`);
          }
          return { success: true, model: modelId, attempt, size: buffer.length };
        } else {
          console.log(`  No image in response from ${modelId} (attempt ${attempt}).`);
          if (textPart?.text) console.log(`  Text: ${textPart.text.substring(0, 600)}`);

          if (attempt < MAX_RETRIES) {
            console.log(`  Waiting ${RETRY_DELAY_MS / 1000}s before retry...`);
            await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
          }
        }
      } catch (err) {
        const msg = err.message || "";
        console.log(`  Error with ${modelId} (attempt ${attempt}): ${msg.substring(0, 300)}`);

        if ((msg.includes("529") || msg.includes("overloaded") || msg.includes("RESOURCE_EXHAUSTED")) && attempt < MAX_RETRIES) {
          console.log(`  529/overloaded — waiting ${RETRY_DELAY_MS / 1000}s before retry...`);
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        } else if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 4000));
        }
      }
    }

    console.log(`  All ${MAX_RETRIES} attempts exhausted for ${modelId}. Trying next model...`);
  }

  throw new Error("All models and retries exhausted — no image produced.");
}

generateImage().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
