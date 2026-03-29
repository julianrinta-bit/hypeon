const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'AIzaSyAOwsromYnvCbhVKYzgDcBN9DytPM_yQeI');

const prompt = `Documentary photograph. Shot on Canon EOS R5 with 35mm f/2.0 lens, ISO 400. Kodak Portra 400 tonality — warm golden midtones, lifted shadows, matte film finish.

A solitary fisherman standing in a small wooden rowboat on a perfectly still, misty mountain lake at golden hour dawn. The man is mid-40s, wearing a dark olive (#3B4A3A) waxed cotton jacket over a cream (#F5F0E0) henley, sleeves rolled to forearms, weathered brown leather belt. He is pulling in a fishing line with both hands, leaning back slightly — the quiet satisfaction of someone who just felt a strong tug on the line and knows exactly what he caught. A half-smile with crinkled eyes, Duchenne crow's feet, looking down at the water where the line disappears. The face of someone who has been fishing this lake alone every morning and finally understands why nobody else comes here.

The lake stretches wide and empty in every direction — no other boats, no piers, no people. Dense pine forest (#2D4A2D) lines the far shore, barely visible through low-hanging morning mist. The water surface is glass-smooth with golden light reflections. A worn tackle box sits open in the boat with colorful lures visible. Steam rises from a dented thermos beside him.

Lighting: Golden hour dawn from camera-left, warm 3200K. Mist diffuses the light into soft wrapping illumination. Cool blue (#4A6B8A) fill from the shadowed forest reflects off the water on camera-right side. The man's face catches warm light on the left, cool reflected light on the right.

CRITICAL COLOR DIRECTIVE: 8 distinct color zones minimum. The olive jacket is the anchor against the golden mist. The cream henley CONTRASTS with dark water. Red (#C13A3A) lure visible in tackle box. Blue-gray water. Golden sky. Dark green forest. Warm wood of the boat. Silver fishing line catching light.

TEXT OVERLAY — integrated into the scene:
1. Large bold condensed text reading "900 SUBSCRIBERS" in white (#FFFFFF) Bebas Neue Bold, floating in the misty air over the wide empty lake surface to the LEFT of the fisherman — anchored over the open golden-misted water where no visual elements exist. Below it, slightly smaller, "$2.4M PIPELINE" in gold (#FFD700).
2. Barely visible watermark "HYPE ON MEDIA" in white, very faint, in the bottom-right corner of the image, over the dark water surface.

MICRO-REALISM: Faint dust motes in the golden light, subtle lens vignetting, natural sensor noise in shadow regions, water droplets on the boat gunwale, rope texture on the fishing line, wood grain on the boat, fabric texture on the waxed jacket with slight wear at elbows.

Width should be about 1.8 times the height, NOT ultra-wide, NOT cinematic widescreen. Landscape orientation, wider than tall.

NOT stock photo — NOT posed — NOT studio lighting — NOT airbrushed skin — NOT symmetrical composition — NOT single color temperature.`;

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
        const outPath = __dirname + '/../content/blog/b2b-youtube-strategy/cover-original.jpg';
        fs.writeFileSync(outPath, buffer);
        console.log('Image saved! Size:', buffer.length, 'bytes');
        console.log('Model used:', modelName);
        return;
      } else {
        console.log('No image in response from', modelName);
        const textPart = parts.find(p => p.text);
        if (textPart) console.log('Text response:', textPart.text.substring(0, 300));
      }
    } catch (err) {
      console.log('Error with', modelName, ':', err.message ? err.message.substring(0, 300) : err);
      if (modelName === models[models.length - 1]) throw err;
      console.log('Waiting 15s before fallback...');
      await new Promise(r => setTimeout(r, 15000));
    }
  }
}

generate().catch(e => { console.error('All models failed:', e.message); process.exit(1); });
