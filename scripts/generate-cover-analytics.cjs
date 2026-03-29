const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function generate() {
  const models = ['gemini-3-pro-image-preview', 'gemini-3.1-flash-image-preview', 'gemini-2.5-flash-image'];
  
  const prompt = `Documentary photograph of a radiologist in a dimly lit diagnostic room. Shot on Canon EOS R5 with 50mm f/1.8 lens, ISO 640. Kodak Portra 400 tonality.

A male radiologist (European, late 40s, salt-and-pepper short hair, reading glasses perched on his nose, wearing a white (#F0F0F0) medical coat over a light blue (#6B9BD2) dress shirt) is holding up a large X-ray film against a bright lightbox mounted on the wall. 

THE CRITICAL DETAIL: The X-ray does NOT show bones — instead it shows a LINE CHART that looks like a YouTube retention curve: a line that starts high on the left, drops sharply at approximately the 1/3 point, then gradually declines. The chart line is visible as dark contrasted lines on the translucent X-ray film against the bright white (#FFFFFF) lightbox glow.

The radiologist's expression: the quiet concern of a surgeon who has found the exact fracture — eyebrows slightly drawn together, lips pressed, eyes focused on the sharp drop in the curve, like someone who has seen this pattern a thousand times and knows exactly what it means.

The diagnostic room: dark walls (#1A1A1A), the blue-white glow (6500K) of the lightbox is the dominant light source illuminating the radiologist's face from the front. A secondary warm desk lamp (2800K) casts amber light from the lower left, creating a warm-cool color split across his face. A desk behind him with scattered medical files, a red (#CC3333) coffee mug, and a small green (#2D6A4F) potted succulent.

TEXT OVERLAY: "THE 90-SECOND DROP" in large bold white Bebas Neue font, positioned in the dark empty wall space to the LEFT of the lightbox. Below it in gold (#FFD700) text: "73% of Videos Die Here". Bottom right corner: "HYPE ON MEDIA" in barely visible watermark.

MUST be wider than tall, landscape orientation, width should be about 1.8 times the height, NOT ultra-wide, NOT cinematic widescreen.

Micro-realism: faint dust motes in the lightbox beam, lens vignetting at corners, chromatic aberration at edges, natural sensor noise in shadows, realistic pore variation, flyaway hair, fabric texture on the medical coat, reading glasses slightly smudged, slight paper curl on the X-ray film edges.

NOT posed — NOT stock photo — NOT airbrushed skin — NOT studio lighting — NOT performed expression.`;

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
      if (!imagePart) { console.log(`No image from ${modelName}`); continue; }
      const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
      const outputDir = path.join(__dirname, '..', 'content', 'blog', 'youtube-analytics-heatmaps-benchmarking');
      fs.writeFileSync(path.join(outputDir, 'cover-original.jpg'), imageBuffer);
      console.log(`Saved cover-original.jpg (${imageBuffer.length} bytes) via ${modelName}`);
      return true;
    } catch (err) { console.error(`Error with ${modelName}:`, err.message); }
  }
  return false;
}
generate().then(ok => process.exit(ok ? 0 : 1));
