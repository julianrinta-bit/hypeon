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

      const prompt = `Documentary photograph, NOT editorial, NOT art-directed. Shot on Canon EOS R5 with 50mm f/1.8 lens, ISO 640. Kodak Portra 400 tonality — warm skintones, lifted shadows, slightly golden midtones, matte film finish.

SCENE: A European/American man in his late 30s sits at a clean modern desk in a bright office. He wears a fitted dark gray quarter-zip pullover (#4A4A4A) with subtle tech-fabric sheen over a white oxford shirt (just collar points visible). Slim rectangular titanium glasses. Faint scar through his left eyebrow. Sports watch on RIGHT wrist (he is left-handed). He holds a large analog thermometer in his right hand — the classic glass mercury type — and is looking at it with the expression of someone reading "37.0" and nodding but clearly confused about why he still feels terrible. The "As If" of realizing the tool works fine but isn't telling the whole story.

On the desk in front of him: a laptop showing YouTube analytics dashboards (blurred but recognizable with colorful graphs). A closed Moleskine notebook with a pen clipped to it. An insulated water bottle with a tiny dent near the bottom. Next to the laptop, a messy stack of printed reports and charts that he clearly has NOT read — the strategic context he is missing.

ENVIRONMENT: Clean modern office, standing desk at sit height. Ultrawide monitor behind him showing a blurred HubSpot-style pipeline dashboard. Flat fluorescent overhead light (6500K) plus warm morning light from a window on the left (3800K). A RED stapler on the desk. A BLUE water glass with condensation. A small GREEN plant in a ceramic pot. Background shows blurred open-plan office with 1-2 distant colleagues.

COMPOSITION: Landscape orientation, width approximately 1.8 times the height. The man is positioned in the LEFT 40% of the frame, holding the thermometer up. The RIGHT 60% shows the desk with unread reports and the laptop showing data — the gap between measurement and understanding. The dark wall area above him provides natural text space.

TEXT OVERLAY — integrated into the image:
Bold condensed sans-serif text (like Bebas Neue) reading "YOUR DATA" in white (#FFFFFF) positioned over the dark wall space above the desk on the right side. Below it: "IS NOT A STRATEGY" in golden (#FFD700). The text is anchored to the wall above the cluttered desk with unread reports.

Bottom strip: solid 85-pixel band of deep purple (#3730A3) spanning full width. Inside, centered, small text "HYPE ON MEDIA" in cream white (#FAF3E0).

Very faint watermark "HYPE ON MEDIA" barely visible at 8% opacity in lower right.

MICRO-REALISM: Dust motes near window light, subtle lens vignetting, sensor noise in shadows. Realistic pore variation, faint scar through left eyebrow. Quarter-zip has small pull at collar. Report pages are slightly curled at edges. Thermometer glass reflects window light. Natural depth-of-field — thermometer sharp, background soft.

NOT posed — NOT stock photo — NOT airbrushed — NOT symmetrical — NOT studio lighting — NOT white background — NOT single color temperature.

Output: landscape orientation, photorealistic, approximately 1.8x wider than tall.`;

      const result = await model.generateContent(prompt);
      const parts = result.response.candidates[0].content.parts;
      const imagePart = parts.find(p => p.inlineData);

      if (imagePart) {
        const outputDir = path.join(__dirname, '..', 'content', 'blog', 'youtube-ask-studio-ai-chatbot-guide');
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
