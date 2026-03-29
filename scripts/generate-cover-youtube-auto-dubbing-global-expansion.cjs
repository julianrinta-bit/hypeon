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
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      });

      const prompt = `Documentary photograph, NOT editorial, NOT art-directed. Shot on Canon EOS R5 with 35mm f/2.0 lens, ISO 640. Kodak Portra 400 tonality — warm skintones, lifted shadows, slightly golden midtones, matte film finish.

SCENE: A modern conference interpretation booth — a long glass window separating a soundproofed corridor of 6 interpreter stations. Each station has professional headsets hanging from hooks, microphones on articulated arms, small desk surfaces. ALL CHAIRS ARE EMPTY — no interpreters present. The headsets hang untouched. One station has a dim green LED glowing on the console — the only sign something is working.

In the FOREGROUND, just in front of the glass partition, a European woman in her early 30s stands at a sleek podium-style microphone. She wears an oversized vintage faded band t-shirt tucked loosely into high-waisted wide-leg black trousers (#1A1A1A), thin gold chain with small pendant. Tortoiseshell round glasses, slightly oversized. Freckles across her nose. She is mid-sentence — mouth open, one hand gesturing palm-up, the "As If" expression of someone explaining something important to a room that is actually listening. Confident, animated, unaware that the booths behind her are unmanned.

ENVIRONMENT: Clean modern conference facility, polished concrete floor, warm pendant lights overhead (3200K), cool daylight from tall windows on the left wall (5800K). A RED translation headset sits on the podium beside her. A BLUE water bottle with condensation beads. A GREEN potted fern on a shelf behind the glass booths. The booths themselves are illuminated with cool fluorescent light (6500K) creating contrast against the warm foreground.

COMPOSITION: Landscape orientation, width approximately 1.8 times the height, NOT ultra-wide, NOT cinematic widescreen. The woman stands in the LEFT 40% of the frame. The RIGHT 60% shows the row of empty interpreter booths through the glass — this is where the story lives. The glass creates a visual divide: warm human on one side, cool empty technology on the other.

TEXT OVERLAY — integrated into the image:
Large bold condensed sans-serif text (like Bebas Neue) reading "27 LANGUAGES" in white (#FFFFFF) positioned over the dark empty interpreter booths on the right side of the glass partition. Below it, smaller text "ZERO INTERPRETERS" in golden (#FFD700). The text floats in the space between the hanging headsets, anchored to the empty booths visually.

Bottom strip: a solid 85-pixel band of acid green (#A8FF3E) spanning the full width. Inside this band, centered, small text "HYPE ON MEDIA" in dark charcoal (#1A1A1A).

Very faint barely visible watermark "HYPE ON MEDIA" at 8% opacity in the lower right corner of the photo area, above the green band.

MICRO-REALISM: Faint dust motes near the pendant lights, subtle lens vignetting at corners, natural sensor noise in shadow regions. Realistic pore variation on face, freckles uneven and natural. Individual flyaway hair strands. Fabric texture visible on the black trousers. Glass partition shows faint reflections. Headset cables slightly tangled. One microphone arm slightly askew.

NOT posed — NOT stock photo — NOT airbrushed skin — NOT symmetrical features — NOT studio lighting — NOT ring light — NOT performed smile — NOT white or gray background — NOT single color temperature.

Output: landscape orientation, photorealistic, approximately 1.8x wider than tall.`;

      const result = await model.generateContent(prompt);
      const parts = result.response.candidates[0].content.parts;
      const imagePart = parts.find(p => p.inlineData);

      if (imagePart) {
        const outputDir = path.join(__dirname, '..', 'content', 'blog', 'youtube-auto-dubbing-global-expansion');
        const originalPath = path.join(outputDir, 'cover-original.jpg');
        const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
        fs.writeFileSync(originalPath, imageBuffer);
        console.log(`SUCCESS: Original saved to ${originalPath} (${(imageBuffer.length / 1024).toFixed(1)} KB)`);
        console.log('Now crop with: ffmpeg -y -i cover-original.jpg -vf "crop=ih*1.91:ih:(iw-ih*1.91)/2:0,scale=1200:630" -q:v 2 cover.jpg');
        return;
      } else {
        console.log(`Model ${modelName} returned no image. Text:`, parts.filter(p => p.text).map(p => p.text).join('\n'));
      }
    } catch (err) {
      console.error(`Model ${modelName} failed:`, err.message);
    }
  }
  console.error('All models failed.');
  process.exit(1);
}

generate();
