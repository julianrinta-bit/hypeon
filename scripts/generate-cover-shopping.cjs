const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function generate() {
  const models = ['gemini-3-pro-image-preview', 'gemini-3.1-flash-image-preview', 'gemini-2.5-flash-image'];
  
  const prompt = `Documentary photograph of a charming artisan boutique shop interior. Shot on Canon EOS R5 with 35mm f/2.0 lens, ISO 800. Kodak Portra 400 tonality.

Behind a wooden (#6B4226) checkout counter, a TALL display shelf is mounted on the warm cream (#F5E6D0) plaster wall. The shelf has 5 rows. The TOP two rows are PERFECTLY curated: beautiful leather goods, a premium copper (#B87333) French press, artisan ceramic mugs in deep teal (#006D6F), a polished walnut (#5C3317) cutting board — items that clearly belong in this upscale boutique.

THE VISUAL JOKE: The BOTTOM three rows are stocked with absurdly wrong items — a neon green (#39FF14) rubber duck, a child's pink (#FF69B4) plastic tiara, a can of industrial WD-40, a bag of dog treats with a cartoon bone on it, a bright yellow (#FFD700) banana phone case. These items are CLEARLY out of place in an artisan boutique — the contrast between the curated top and random bottom is the punchline.

A young shopkeeper (European woman, mid-30s, auburn hair in a low messy bun, wearing a linen (#D4C5A9) apron over a sage green (#8B9D83) cotton blouse, small gold hoop earrings) stands behind the counter with the expression of someone who just realized her inventory strategy has been wrong all along — one hand on the counter, other hand touching her chin, eyes scanning the bottom shelves with dawning embarrassment.

The shop: warm overhead track lights (3200K) casting soft pools on the shelving. A small potted olive tree in a terracotta (#C74E24) pot in the corner. A brass (#B8860B) vintage cash register on the counter. A stack of brown craft paper bags. Exposed brick (#8B4513) accent wall to the left.

TEXT OVERLAY: "$340 TO $2,100/MO" in large bold white Bebas Neue font, positioned over the exposed brick wall to the LEFT of the shopkeeper. Below it in gold (#FFD700) text: "Same Upload Frequency". Bottom right: "HYPE ON MEDIA" barely visible watermark.

MUST be wider than tall, landscape orientation, width should be about 1.8 times the height, NOT ultra-wide.

Micro-realism: natural wood grain on the counter, slight dust on some shelf items, warm light reflections on the brass register, fabric texture on the apron, subtle fingerprints on the glass counter surface, flyaway hair strands, slight lens vignetting.

NOT posed — NOT stock photo — NOT airbrushed skin — NOT single light source — NOT studio lighting.`;

  for (const modelName of models) {
    try {
      console.log(`Trying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName, generationConfig: { responseModalities: ['IMAGE', 'TEXT'] } });
      const result = await model.generateContent(prompt);
      const imagePart = result.response.candidates[0].content.parts.find(p => p.inlineData);
      if (!imagePart) { console.log(`No image from ${modelName}`); continue; }
      const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
      fs.writeFileSync(path.join(__dirname, '..', 'content', 'blog', 'youtube-shopping-affiliate-revenue', 'cover-original.jpg'), imageBuffer);
      console.log(`Saved (${imageBuffer.length} bytes) via ${modelName}`);
      return true;
    } catch (err) { console.error(`Error with ${modelName}:`, err.message); }
  }
  return false;
}
generate().then(ok => process.exit(ok ? 0 : 1));
