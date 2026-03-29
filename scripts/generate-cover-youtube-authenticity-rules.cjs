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

      const prompt = `Documentary photograph, NOT editorial, NOT art-directed. Shot on Canon EOS R5 with 35mm f/2.0 lens, ISO 640. Kodak Portra 400 tonality — warm skintones, lifted shadows, matte film finish.

SCENE: A health inspector in a crisp white lab coat and blue nitrile gloves stands in front of a small food factory entrance — a metal roll-up door. She is placing a large official-looking red and white paper sign on the door. The sign reads "CLOSED" in large bold black letters with a red border. She holds a clipboard in her other hand. The expression on her face is neutral and professional — the "As If" of someone doing their job without emotion, having seen this a hundred times.

Behind her on the factory floor (visible through the partially open door), there is a conveyor belt with rows of identical plain white boxes — all the same, mass-produced, no differentiation. One or two boxes at the very end of the belt have colorful handmade labels, clearly higher quality than the rest. But the inspector is shutting down the whole line.

ENVIRONMENT: Industrial setting, concrete floor with drain grate, fluorescent overhead lights (6500K cool white), a RED fire alarm on the wall, a YELLOW caution sign near the door. Morning light from outside the factory door (5200K warm) creating contrast with cool interior. Stainless steel surfaces. A GREEN first aid kit mounted on the wall. The scene feels institutional and serious.

COMPOSITION: Landscape orientation, width approximately 1.8 times the height. The inspector and the "CLOSED" sign dominate the LEFT 45% of the frame. The RIGHT 55% shows the factory interior with the conveyor belt of identical boxes — this is where the story reads. Visual tension: the good boxes at the end of the belt are clearly higher quality but are being shut down along with everything else.

TEXT OVERLAY — integrated into the image:
Bold condensed sans-serif text (like Bebas Neue) reading "CHANNEL-LEVEL" in white (#FFFFFF) positioned over the dark ceiling/wall area above the conveyor belt inside the factory. Below it: "DEMONETIZATION" in red (#E63946), large and impactful. The text is anchored to the dark industrial ceiling above the conveyor belt.

Bottom strip: solid 85-pixel band of deep navy (#1B2A4A) spanning full width. Inside, centered, small text "HYPE ON MEDIA" in cream (#FAF3E0).

Very faint watermark "HYPE ON MEDIA" barely visible at 8% opacity in lower right of photo area.

MICRO-REALISM: Dust motes in the beam of outside light, lens vignetting at corners, sensor noise in shadows. Inspector's coat has a slight crease from being stored. Clipboard has papers slightly dog-eared. Factory walls have minor scuff marks. Conveyor belt has wear marks on rubber surface.

NOT posed — NOT stock photo — NOT airbrushed — NOT symmetrical — NOT studio lighting — NOT white background — NOT single color temperature.

Output: landscape orientation, photorealistic, approximately 1.8x wider than tall.`;

      const result = await model.generateContent(prompt);
      const parts = result.response.candidates[0].content.parts;
      const imagePart = parts.find(p => p.inlineData);

      if (imagePart) {
        const outputDir = path.join(__dirname, '..', 'content', 'blog', 'youtube-authenticity-rules-july-2025');
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
