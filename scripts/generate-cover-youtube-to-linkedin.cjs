const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GOOGLE_AI_API_KEY || 'AIzaSyAOwsromYnvCbhVKYzgDcBN9DytPM_yQeI';

async function generate() {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const models = ['gemini-3.1-flash-image-preview', 'gemini-3-pro-image-preview', 'gemini-2.5-flash-image'];

  for (const modelName of models) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
      });

      const prompt = `Documentary photograph, NOT editorial, NOT art-directed. Shot on Canon EOS R5 with 50mm f/1.8 lens, ISO 640. Kodak Portra 400 tonality — warm skintones, lifted shadows, golden midtones, matte film finish.

SCENE: A professional sushi chef at a clean wooden counter in a high-end sushi bar. The chef — a European woman in her early 40s with an apron over a crisp white chef coat — holds a large Japanese knife (yanagiba) mid-cut through a long perfectly assembled sushi roll. The roll is about 12 inches long, and she has already sliced 3 perfect individual pieces that sit neatly arranged on the cutting board to her right. The remaining uncut portion of the roll is on her left. Her hands are precise, the knife angle is exact.

Her expression: calm focus, the "As If" of someone who has done this ten thousand times and knows exactly where to cut. Slight closed-lip satisfaction. Eyes looking down at the cut point.

The long uncut roll represents the YouTube video. The perfect individual slices represent LinkedIn clips. The composition tells the story without words.

ENVIRONMENT: High-end minimalist sushi bar. Light natural wood counter (cypress or hinoki). Clean black granite surface behind the chef. A small ceramic dish with pickled ginger (PINK). A pool of soy sauce in a small bowl (DARK BROWN). Bright GREEN wasabi on a small plate. A BLUE Japanese ceramic tea cup. Warm pendant light directly above (3000K) with cool daylight from a skylight (5500K). The counter surface is slightly wet from prep. Bamboo mat partially visible.

COMPOSITION: Landscape orientation, width approximately 1.8 times the height. The chef's hands and the knife are in the CENTER of the frame. The uncut roll extends to the LEFT (YouTube). The sliced pieces sit neatly on the RIGHT (LinkedIn). The dark wall behind the chef provides natural text space.

TEXT OVERLAY — integrated into the image:
On the LEFT side above the uncut roll portion: small text "1 VIDEO" in white (#FFFFFF), anchored to the dark wall behind the long uncut roll.
On the RIGHT side above the sliced pieces: larger text "3 CLIPS" in golden (#FFD700), anchored to the dark wall above the arranged pieces.
Between them, subtle text ">" in white connecting the two.

Bottom strip: solid 85-pixel band of deep navy (#1B2A4A) spanning full width. Inside, centered, small text "HYPE ON MEDIA" in cream white (#FAF3E0).

Very faint watermark "HYPE ON MEDIA" barely visible at 8% opacity in lower right corner.

MICRO-REALISM: Individual rice grains visible on cut surfaces. Knife blade shows reflections from pendant light. Slight moisture on the chef's hands. Wood counter has natural grain patterns. The cut is clean — the cross-section of rice, nori, fish perfectly visible. A single grain of rice has fallen onto the counter. Chef's apron has a faint crease.

NOT posed — NOT stock photo — NOT airbrushed — NOT symmetrical — NOT studio lighting — NOT white background — NOT single color temperature.

Output: landscape orientation, photorealistic, approximately 1.8x wider than tall.`;

      const result = await model.generateContent(prompt);
      const parts = result.response.candidates[0].content.parts;
      const imagePart = parts.find(p => p.inlineData);

      if (imagePart) {
        const outputDir = path.join(__dirname, '..', 'content', 'blog', 'youtube-to-linkedin-video-repurposing');
        const originalPath = path.join(outputDir, 'cover-original.jpg');
        fs.writeFileSync(originalPath, Buffer.from(imagePart.inlineData.data, 'base64'));
        console.log(`SUCCESS: ${originalPath} (${(fs.statSync(originalPath).size / 1024).toFixed(1)} KB)`);
        return;
      }
    } catch (err) {
      console.error(`Model ${modelName} failed:`, err.message);
    }
  }
  console.error('All models failed.');
  process.exit(1);
}

generate();
