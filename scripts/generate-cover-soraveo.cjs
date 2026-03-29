const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function generate() {
  const models = ['gemini-3-pro-image-preview', 'gemini-3.1-flash-image-preview', 'gemini-2.5-flash-image'];
  
  const prompt = `Documentary photograph of a long artists' studio showing THREE DISTINCT WORKSTATIONS side by side. Shot on Canon EOS R5 with 24mm f/2.8 lens, ISO 640. Kodak Portra 400 tonality. Wide environmental shot.

LEFT STATION (the Painter / Sora): An oil painter (European man, late 40s, wild gray hair, paint-stained smock (#ADADAD) over a faded navy (#1B2A4A) shirt) stands before a large canvas on a wooden (#7B5B3A) easel. The canvas shows a STUNNING but half-finished hyper-realistic landscape — brilliant colors, museum-quality work. Paint tubes scattered everywhere. A glass palette thick with mixed oils. His expression: the intense focus of someone chasing perfection, knowing the next brushstroke could ruin it.

CENTER STATION (the Printer / Runway): A professional large-format printer — a sleek modern machine in white (#F0F0F0) with a blue (#2B4FCC) accent stripe. Perfect identical prints are rolling out in a neat stack. A calm technician (South Asian woman, early 30s, wearing a clean black (#1A1A1A) turtleneck, hair in a neat ponytail) stands beside it checking color consistency on a print against a Pantone swatch book. Her expression: quiet professional satisfaction, everything running as expected.

RIGHT STATION (the Polaroid / Veo): A young creator (mixed-race man, early 20s, wearing a bright red (#CC3333) graphic tee, wireless earbuds, messy curly hair) holds a vintage Polaroid camera. He just snapped a photo — a freshly ejected Polaroid print hangs from the camera with the image still developing. His expression: the grin of someone who got exactly what they needed instantly, no fuss.

The studio space: polished concrete (#808080) floor, tall north-facing windows letting in cool natural light (5500K), exposed steel (#4A4A4A) ceiling beams, warm pendant work lights (3200K) over each station creating pools of warm light. A large clock on the back wall showing 3:47. Potted plants on windowsills.

TEXT OVERLAY: "TESTED ON REAL PROJECTS" in large bold white Bebas Neue font, positioned in the bright window area at the TOP CENTER above all three stations. Below it in gold (#FFD700) text: "Sora vs Runway vs Veo". Bottom right: "HYPE ON MEDIA" barely visible watermark.

MUST be wider than tall, landscape orientation, width should be about 1.8 times the height, NOT ultra-wide.

Micro-realism: paint drops on the concrete floor near the painter, paper dust near the printer, natural light casting long shadows, slight window condensation, visible fabric textures, natural skin tones with pore variation.

NOT posed — NOT stock photo — NOT airbrushed — NOT single light source.`;

  for (const modelName of models) {
    try {
      console.log(`Trying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName, generationConfig: { responseModalities: ['IMAGE', 'TEXT'] } });
      const result = await model.generateContent(prompt);
      const imagePart = result.response.candidates[0].content.parts.find(p => p.inlineData);
      if (!imagePart) { console.log(`No image from ${modelName}`); continue; }
      const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
      fs.writeFileSync(path.join(__dirname, '..', 'content', 'blog', 'sora-runway-veo-ai-video-comparison', 'cover-original.jpg'), imageBuffer);
      console.log(`Saved (${imageBuffer.length} bytes) via ${modelName}`);
      return true;
    } catch (err) { console.error(`Error with ${modelName}:`, err.message); }
  }
  return false;
}
generate().then(ok => process.exit(ok ? 0 : 1));
