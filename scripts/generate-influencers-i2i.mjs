/**
 * Generate: "Influencers & Creators" card — image-to-image mode
 * Reference image is passed as inlineData so the model SEES it and recreates the scene.
 * Method: Gemini multimodal input (image + text prompt) → image output
 *
 * Reference: young blonde woman sitting on Persian runner rug in dim hallway,
 * sherpa jacket, light jeans, chunky white sneakers, analog warm film look.
 * Output: original recreation — same composition/mood, different non-identifiable face.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { writeFileSync, readFileSync } from "fs";

const API_KEY = process.env.GOOGLE_AI_API_KEY;
const REFERENCE_PATH = "/tmp/reference-influencers.jpg";
const DEST = "/Users/julianrinta/projects/hypeon-website/public/images/whatwemake/influencers.jpg";

// Short, focused prompt — the image does the heavy lifting (image-to-image)
// We describe WHAT to preserve and WHAT to change (face → original/non-identifiable)
const PROMPT = `Recreate this photograph as a brand-new original image.

Faithfully match:
- The exact composition: person sitting on the floor of a dim corridor/hallway
- The Persian-style red runner rug with gold floral patterns on dark wood floor
- The warm analog film look: golden tones, soft contrast, slight grain, lifted shadows, Kodak Portra 400 aesthetic
- The casual editorial pose: seated directly on the rug, relaxed, looking at camera
- The sherpa/teddy bear beige jacket, light wash straight-leg jeans, white chunky sneakers
- Pale interior doors on both sides of the hallway, dark vanishing point at the end
- The warm practical lighting (feels like a single warm tungsten source illuminating the subject from the front/camera side)

Change ONLY:
- The person must be a DIFFERENT, completely non-identifiable individual — same vibe (young woman, late teens to mid-20s, casual streetwear energy), different face, different hair color acceptable (brunette, dark blonde — NOT identifiable as a real person or celebrity)
- Do NOT replicate the exact face or identifying features of the person in the reference photo

The final image must look like a real photograph shot on film. Photorealistic. No AI artifacts. Aspect ratio 3:2 (landscape), high resolution.`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithRetry(model, content, maxRetries = 4) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`  Attempt ${attempt}/${maxRetries}...`);
      const result = await model.generateContent(content);
      return result;
    } catch (err) {
      const msg = err.message || "";
      const isRetryable = err.status === 529 || msg.includes("529") || msg.includes("overloaded") || msg.includes("UNAVAILABLE");
      if (isRetryable && attempt < maxRetries) {
        const waitSec = attempt * 8;
        console.log(`  API overloaded (529) — waiting ${waitSec}s before retry...`);
        await sleep(waitSec * 1000);
      } else {
        throw err;
      }
    }
  }
}

async function generateImage() {
  // Load reference image as base64
  console.log("Loading reference image...");
  const refBuffer = readFileSync(REFERENCE_PATH);
  const refBase64 = refBuffer.toString("base64");
  console.log(`Reference: ${(refBuffer.length / 1024).toFixed(1)} KB`);

  const genAI = new GoogleGenerativeAI(API_KEY);

  // Model priority — try in order
  const models = [
    "gemini-3.1-flash-image-preview",
    "gemini-2.5-flash-preview-05-20",
    "gemini-2.0-flash-exp",
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

      // Multimodal content: reference image + text prompt
      const content = [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: refBase64,
          },
        },
        {
          text: PROMPT,
        },
      ];

      const result = await generateWithRetry(model, content, 4);
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
          console.log(`  Model note: ${textPart.text.substring(0, 400)}`);
        }
        return { success: true, model: modelId, size: buffer.length };
      } else {
        console.log(`  No image in response from ${modelId}.`);
        if (textPart?.text) console.log(`  Text: ${textPart.text.substring(0, 600)}`);

        // If model refuses image generation, try next model
        continue;
      }
    } catch (err) {
      const msg = err.message || "";
      console.log(`  Error with ${modelId}: ${msg.substring(0, 300)}`);
      // Continue to next model
    }
  }

  throw new Error("All models failed to produce an image.");
}

generateImage()
  .then((res) => {
    console.log("\nDone.", JSON.stringify(res));
  })
  .catch((err) => {
    console.error("Fatal error:", err.message);
    process.exit(1);
  });
