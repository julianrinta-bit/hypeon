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

      const prompt = `Documentary photograph, NOT editorial, NOT art-directed. Shot on Canon EOS R5 with 24mm f/2.8 lens, ISO 800. Kodak Portra 400 tonality — warm skintones, lifted shadows, slightly golden midtones.

SCENE: A grand stock exchange trading floor — high ornate ceiling, classical columns, rows of trading terminals. But instead of stock tickers, the massive wall-mounted screens show YouTube analytics dashboards with subscriber curves, watch time graphs, and revenue numbers. The main central screen prominently displays "$55B" in large glowing digits. The YouTube Play Button logo is visible as a large red badge mounted on the wall where the exchange's emblem would normally be.

A European woman in her early 40s stands on the trading floor, looking up at the screens with one eyebrow slightly raised — the "As If" expression of a VP who just realized the numbers are bigger than she expected. She wears a slightly oversized charcoal wool blazer (#3A3A3A) with visible weave texture, sleeves pushed up revealing a thin gold bracelet on her left wrist. Cream ribbed mock-neck knit underneath. Reading glasses pushed up on her head. Flyaway hair at her right temple. She holds a ceramic matte black coffee mug in one hand.

ENVIRONMENT: The trading floor has warm golden pendant lights overhead (3200K) mixing with the cool blue glow from the screens (7000K). Polished dark wood and brass fixtures. A RED fire extinguisher on a far column. A GREEN potted plant on one trading desk. BLUE sticky notes on a terminal. Two blurred traders in the background wearing casual creator-style clothing (hoodies, sneakers) instead of suits — reinforcing the "this is not Wall Street" incongruity.

COMPOSITION: Landscape orientation, width approximately 1.8 times the height. The VP woman stands in the LEFT 35% of the frame, looking right toward the screens. The RIGHT 65% shows the grand trading floor with the "$55B" screen prominently visible. The space above the woman's head and between her and the screens is darker — natural text zone.

TEXT OVERLAY — integrated into the image:
Bold condensed sans-serif text (like Bebas Neue) reading "MORE JOBS THAN" in white (#FFFFFF) positioned in the dark space between the woman and the screens, floating near the classical ceiling area. Below it: "HOLLYWOOD" in golden (#FFD700), larger and bolder. The text is anchored to the dark ceiling area above the trading floor.

Bottom strip: a solid 85-pixel band of deep navy (#1B2A4A) spanning full width. Inside, centered, small text "HYPE ON MEDIA" in cream white (#FAF3E0).

Very faint barely visible watermark "HYPE ON MEDIA" at 8% opacity in lower right of photo area.

MICRO-REALISM: Faint dust motes near pendant lights, subtle lens vignetting, natural sensor noise in shadows. Realistic pore variation on her face, tiny mole below left ear. Fabric pilling at blazer collar. Coffee mug has a ring stain. Brass fixtures show patina. Screen reflections on polished floor.

NOT posed — NOT stock photo — NOT airbrushed — NOT symmetrical — NOT studio lighting — NOT white background — NOT single color temperature.

Output: landscape orientation, photorealistic, approximately 1.8x wider than tall.`;

      const result = await model.generateContent(prompt);
      const parts = result.response.candidates[0].content.parts;
      const imagePart = parts.find(p => p.inlineData);

      if (imagePart) {
        const outputDir = path.join(__dirname, '..', 'content', 'blog', 'youtube-creator-economy-55-billion-gdp');
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
