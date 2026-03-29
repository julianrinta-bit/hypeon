const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function generate() {
  const models = ['gemini-3-pro-image-preview', 'gemini-3.1-flash-image-preview', 'gemini-2.5-flash-image'];
  
  const prompt = `Documentary photograph of a professional Michelin-star kitchen during service. Shot on Canon EOS R5 with 35mm f/2.0 lens, ISO 800. Kodak Portra 400 tonality.

A young sous chef (East Asian woman, late 20s, hair in tight bun under a white chef's hat, wearing a pristine white (#F5F5F0) double-breasted chef's jacket with rolled sleeves showing a small wrist tattoo) stands at a stainless steel (#C0C0C0) prep station. She is blindfolded with a clean black (#1A1A1A) cloth tied over her eyes — yet her hands are in PERFECT motion, julienning bright orange (#FF6B35) carrots with flawless precision. Her knife technique is immaculate, the vegetable cuts are geometrically perfect, arranged in neat parallel lines on a bamboo (#D4A76A) cutting board.

Despite the blindfold, her body language radiates calm competence — shoulders relaxed, slight forward lean of focus, precise hand movements. The expression below the blindfold: the quiet confidence of someone who can do this task perfectly without seeing, yet something about the covered eyes suggests she's missing the bigger picture.

Around her: a chaotic but beautiful kitchen scene. Copper (#B87333) pots hanging from overhead rack. A bright red (#CC3333) Le Creuset pot simmering on a blue (#2B4FCC) gas flame. Wisps of steam rising. A white porcelain plate with a half-finished plating that looks visually perfect but artistically soulless — technically correct but missing creative intent.

The wall behind: dark green (#1B3B2F) subway tiles, warm pendant lights (2800K) hanging low, a chalkboard menu with handwritten specials partially visible.

TEXT OVERLAY: "STRATEGY STILL WINS" in large bold white Bebas Neue font, positioned over the dark green tile wall to the RIGHT side of the frame. Below it in gold (#FFD700) text: "AI Editing Tested". Bottom right: "HYPE ON MEDIA" barely visible watermark.

MUST be wider than tall, landscape orientation, width should be about 1.8 times the height, NOT ultra-wide.

Micro-realism: steam catching the warm light, oil splatter on the stainless steel, knife marks on the cutting board, slight flour dust on the chef's jacket sleeve, condensation on copper pots, natural sensor noise in shadows, chromatic aberration at frame edges.

NOT posed — NOT stock photo — NOT airbrushed skin — NOT single light source — NOT studio lighting.`;

  for (const modelName of models) {
    try {
      console.log(`Trying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName, generationConfig: { responseModalities: ['IMAGE', 'TEXT'] } });
      const result = await model.generateContent(prompt);
      const imagePart = result.response.candidates[0].content.parts.find(p => p.inlineData);
      if (!imagePart) { console.log(`No image from ${modelName}`); continue; }
      const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
      const outputDir = path.join(__dirname, '..', 'content', 'blog', 'youtube-create-ai-editing-review');
      fs.writeFileSync(path.join(outputDir, 'cover-original.jpg'), imageBuffer);
      console.log(`Saved cover-original.jpg (${imageBuffer.length} bytes) via ${modelName}`);
      return true;
    } catch (err) { console.error(`Error with ${modelName}:`, err.message); }
  }
  return false;
}
generate().then(ok => process.exit(ok ? 0 : 1));
