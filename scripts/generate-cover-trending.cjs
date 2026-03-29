const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function generate() {
  const models = [
    'gemini-3-pro-image-preview',
    'gemini-3.1-flash-image-preview',
    'gemini-2.5-flash-image'
  ];
  
  const prompt = `Documentary photograph of a surreal scene inside a high-end Michelin-star restaurant. Shot on Canon EOS R5 with 35mm f/2.0 lens, ISO 800. Kodak Portra 400 tonality.

A distinguished maître d' (European man, late 50s, silver hair slicked back, wearing a crisp black (#1A1A1A) formal tuxedo jacket with white (#FAFAF0) pressed dress shirt, thin black bow tie) stands at the center of the frame holding up a COMICALLY OVERSIZED laminated paper menu — the menu is approximately 4 feet tall and 3 feet wide, clearly absurd for a restaurant setting, with tiny text printed all over it in dense rows. The menu is yellowed and worn, like a fast-food menu board scaled up.

Behind the maître d', two elegant diners sit at a candlelit table: a woman in a deep emerald (#2D6A4F) silk blouse looking up with the quiet bewilderment of someone who just realized the Michelin restaurant is serving from a gas station menu. A man in a navy (#1B2A4A) linen blazer beside her, suppressing a smirk, one hand on his wine glass.

The restaurant interior: warm amber wall sconces (2800K) casting pools of golden light on cream (#F5F0E0) linen tablecloths. Dark mahogany (#3B1F0A) wood paneling. A crystal chandelier slightly blurred in the background. Fresh red (#C41E3A) roses in a small vase on the table. A gleaming brass (#B8860B) wine bucket. Vintage burgundy (#800020) leather booth seating.

The enormous menu creates the visual joke — this prestigious venue has ONE generic list for everyone, and it's obviously absurd.

TEXT OVERLAY: "NICHE CHANNELS WON" in large bold white Bebas Neue font, positioned over the dark mahogany wall paneling to the RIGHT of the maître d', anchored to the dark wood surface. Below it in smaller gold (#FFD700) text: "50+ Channels Tracked". At the bottom right corner, "HYPE ON MEDIA" in barely visible white watermark text.

MUST be wider than tall, landscape orientation, width should be about 1.8 times the height, NOT ultra-wide, NOT cinematic widescreen.

Micro-realism: faint dust motes near the wall sconces, slight lens vignetting at corners, subtle chromatic aberration, natural sensor noise in shadows, realistic pore variation on faces, flyaway hair strands on the maître d', fabric texture visible on the tuxedo jacket, slight menu paper curl at edges, condensation on the wine glass.

NOT posed — NOT stock photo — NOT airbrushed skin — NOT symmetrical features — NOT single light source — NOT studio lighting — NOT performed expressions.`;

  for (const modelName of models) {
    try {
      console.log(`Trying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
      });
      
      const result = await model.generateContent(prompt);
      const parts = result.response.candidates[0].content.parts;
      const imagePart = parts.find(p => p.inlineData);
      
      if (!imagePart) {
        console.log(`No image returned from ${modelName}, trying next...`);
        continue;
      }
      
      const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
      const outputDir = path.join(__dirname, '..', 'content', 'blog', 'youtube-trending-tab-removed-fandoms');
      
      // Save original
      fs.writeFileSync(path.join(outputDir, 'cover-original.jpg'), imageBuffer);
      console.log(`Saved cover-original.jpg (${imageBuffer.length} bytes) via ${modelName}`);
      return true;
    } catch (err) {
      console.error(`Error with ${modelName}:`, err.message);
    }
  }
  console.error('All models failed');
  return false;
}

generate().then(ok => process.exit(ok ? 0 : 1));
