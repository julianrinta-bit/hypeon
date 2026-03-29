const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'AIzaSyAOwsromYnvCbhVKYzgDcBN9DytPM_yQeI');

const prompt = `Documentary photograph. Shot on Canon EOS R5 with 50mm f/2.0 lens, ISO 800. Kodak Portra 400 tonality — warm midtones, matte film finish, lifted shadows.

A translator's cluttered wooden desk in a cozy home office at golden hour. On the desk, 8 manuscript stacks are arranged in a fan layout, each stack clearly labeled with a different language flag or name. THREE of the manuscripts have a prominent GOLD stamp reading "APPROVED" pressed onto their top pages. FIVE of the manuscripts have a RED stamp reading "REVIEW" pressed onto their top pages. The stamps are large, circular, and clearly readable.

The desk is rich dark walnut (#4A3728) with visible wood grain. A warm desk lamp (#FFE4B5 glow, 2800K) casts directional light from the upper left, creating long shadows across the manuscripts. A white ceramic coffee mug with brown coffee visible inside sits in the back-right. A pair of reading glasses with tortoiseshell (#8B6914) frames rests on one of the manuscripts. A red (#C13A3A) pen with its cap off lies across another manuscript. Scattered sticky notes in yellow (#FFD700) and blue (#4A6B8A) stick out from the pages. A small potted succulent (#5B8C5A) sits in a terra cotta pot in the far corner.

The camera angle is a 45-degree overhead view looking down at the desk — the manuscripts are the clear focal point, with the stamps immediately readable. Depth of field keeps the front manuscripts sharp and the back elements slightly soft.

Lighting: Warm desk lamp from upper-left at 2800K as key light. Cool blue (#6B8AAA) ambient from a window on the right, creating color temperature split across the desk surface. The warm side of manuscripts glows golden, the shadow side has cool blue fill.

CRITICAL COLOR DIRECTIVE: 8+ distinct color zones. Gold stamps are the MOST SATURATED element. Dark walnut desk. White mug. Red pen. Yellow sticky notes. Blue sticky notes. Green succulent. Tortoiseshell glasses. Cream manuscript pages (#FFF8E7).

TEXT OVERLAY — integrated into the scene:
1. Bold condensed text reading "8 LANGUAGES" in white (#FFFFFF) Bebas Neue Bold, positioned floating over the dark shadowed area of the desk surface to the LEFT of the manuscript fan — anchored in the empty desk space where the lamp shadow falls. Below it, "3 SOUNDED HUMAN" in gold (#FFD700), same position.
2. Barely visible watermark "HYPE ON MEDIA" in white, very faint, positioned over the dark bottom edge of the desk.

MICRO-REALISM: Paper texture visible on manuscripts, ink bleed on stamps, coffee ring stain on desk, dust motes in the lamp beam, slight curl on sticky note edges, wear marks on the desk surface.

Width should be about 1.8 times the height, NOT ultra-wide, NOT cinematic widescreen. Landscape orientation, wider than tall.

NOT stock photo — NOT studio lighting — NOT airbrushed — NOT single color temperature — NOT symmetrical layout.`;

const models = [
  'gemini-3-pro-image-preview',
  'gemini-3.1-flash-image-preview',
  'gemini-2.5-flash-image'
];

async function generate() {
  for (const modelName of models) {
    try {
      console.log('Trying model:', modelName);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
      });

      const result = await model.generateContent(prompt);
      const parts = result.response.candidates[0].content.parts;
      const imagePart = parts.find(p => p.inlineData);

      if (imagePart) {
        const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
        fs.writeFileSync(__dirname + '/../content/blog/youtube-auto-dubbing-global-strategy/cover-original.jpg', buffer);
        console.log('Image saved! Size:', buffer.length, 'bytes');
        console.log('Model used:', modelName);
        return;
      } else {
        console.log('No image from', modelName);
        const t = parts.find(p => p.text);
        if (t) console.log('Text:', t.text.substring(0, 200));
      }
    } catch (err) {
      console.log('Error with', modelName, ':', (err.message || '').substring(0, 300));
      if (modelName === models[models.length - 1]) throw err;
      console.log('Waiting 15s...');
      await new Promise(r => setTimeout(r, 15000));
    }
  }
}

generate().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
