const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'AIzaSyAOwsromYnvCbhVKYzgDcBN9DytPM_yQeI');

const prompt = `Cinematic documentary photograph. Shot on Canon EOS R5 with 70mm f/2.8 lens, ISO 200. Kodak Ektar 100 tonality — vivid saturated colors, crisp detail, punchy contrast.

A dramatic landscape at golden hour sunset showing two large trees standing 50 feet apart in an open golden grass field. The LEFT tree is completely bare — skeletal dark branches (#3A2A1A) stripped of all leaves, stark against a warm amber sky. The bark is cracked and weathered. A few last birds (#1A1A1A silhouettes) are lifting off from its naked branches.

The RIGHT tree is massive and lush — dense dark green (#2D5A2D) canopy full of life, thick trunk, branches stretching wide in every direction. A HUGE flock of hundreds of small black bird silhouettes fills the air between the two trees, clearly moving in a sweeping arc from LEFT to RIGHT — from the bare tree toward the green tree. Some birds have already landed on the green tree's branches. The flock is dense in the middle of the arc and spreads out as birds reach the destination tree.

The sky behind is a dramatic gradient from deep amber (#FF8C00) at the horizon through warm gold (#FFD700) to deepening blue (#2A4A7A) at the top. The golden grass field (#C4A265) stretches to the horizon. Long shadows from both trees fall across the grass toward the camera.

CRITICAL COLOR DIRECTIVE: 8+ distinct color zones. The amber sky is the MOST SATURATED. Dark bare tree branches. Green lush canopy. Black bird silhouettes. Golden grass. Blue upper sky. Warm orange horizon glow. Shadow-purple (#4A3A5A) in the grass shadows.

TEXT OVERLAY — integrated into the scene:
1. Bold condensed text reading "FOLLOW ME" in white (#FFFFFF) Bebas Neue Bold, floating in the open golden sky space BETWEEN the two trees, above the arc of birds — anchored in the clear sky gap between the bare tree crown and the green tree crown. Below it, "ON YOUTUBE" in gold (#FFD700).
2. Barely visible watermark "HYPE ON MEDIA" very faint, in the dark grass area at the bottom-right of the image.

Lighting: Golden hour sunset from behind and left, backlighting the bare tree dramatically. The green tree catches warm rim light on its right edge. God rays filter through the dust kicked up by the flock. The grass glows golden in the low-angle light.

MICRO-REALISM: Individual bird silhouettes with wing positions varying (some gliding, some flapping), grass texture with individual tall stalks catching light, bark detail on both trees, dust motes in the golden light, subtle lens flare from the setting sun.

Width should be about 1.8 times the height, NOT ultra-wide, NOT cinematic widescreen. Landscape orientation, wider than tall.

NOT stock photo — NOT illustration — NOT cartoon birds — NOT symmetrical — NOT single color temperature — NOT flat lighting.`;

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
        fs.writeFileSync(__dirname + '/../content/blog/tiktok-creators-migrating-youtube-shorts/cover-original.jpg', buffer);
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
