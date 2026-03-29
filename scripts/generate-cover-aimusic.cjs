const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function generate() {
  const models = ['gemini-3-pro-image-preview', 'gemini-3.1-flash-image-preview', 'gemini-2.5-flash-image'];
  
  const prompt = `Documentary photograph of a modern recording studio with a surreal centerpiece. Shot on Canon EOS R5 with 35mm f/2.0 lens, ISO 640. Kodak Portra 400 tonality.

In the center of a professional recording studio, a VINTAGE JUKEBOX stands — a classic 1950s Wurlitzer-style jukebox with a glowing chrome (#C0C0C0) and neon pink (#FF69B4) bubble top, curved glass panels showing vinyl records inside, polished wood (#5C3317) base. The jukebox is clearly out of place in this modern studio, glowing warmly against all the contemporary equipment.

To the right, a music producer (Black man, early 30s, wearing a dark olive (#3C4A2E) hoodie, gold (#DAA520) chain, modern headphones (#1A1A1A) around his neck, short fade haircut) is leaning against the mixing console looking at the jukebox with the expression of someone who just heard something unexpectedly good — eyebrows slightly raised, the beginning of an impressed nod, lips parted in a half-smile of genuine surprise. One hand rests on the mixing console, the other hangs relaxed. His body language says "wait... this actually works?"

The studio: a wall of foam acoustic panels in charcoal (#333333) and deep purple (#2D1B4E) behind the jukebox. A large studio monitor speaker on each side. Colorful LED strip lighting along the ceiling casting subtle blue (#1E3A5F) and amber (#D4A017) accent glows. A microphone on a boom stand in the foreground, slightly out of focus. A red (#CC3333) energy drink can on the mixing console. Sheet music scattered on a nearby stand.

The mixing console surface: dozens of illuminated faders and knobs casting tiny colored lights — green (#00FF00), red (#FF0000), amber (#FFBF00) — across the producer's face from below.

TEXT OVERLAY: "RETENTION WAS IDENTICAL" in large bold white Bebas Neue font, positioned over the dark acoustic foam wall panels to the LEFT of the jukebox. Below it in gold (#FFD700) text: "200+ Shorts Tested". Bottom right: "HYPE ON MEDIA" barely visible watermark.

MUST be wider than tall, landscape orientation, width should be about 1.8 times the height, NOT ultra-wide.

Micro-realism: warm glow reflections from the jukebox on nearby surfaces, dust motes caught in the neon glow, fingerprints on the jukebox glass, slight cable mess on the studio floor, condensation on the energy drink can, natural pore texture on the producer's face, fabric weave visible on the hoodie.

NOT posed — NOT stock photo — NOT airbrushed skin — NOT single light source — NOT studio lighting setup visible.`;

  for (const modelName of models) {
    try {
      console.log(`Trying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName, generationConfig: { responseModalities: ['IMAGE', 'TEXT'] } });
      const result = await model.generateContent(prompt);
      const imagePart = result.response.candidates[0].content.parts.find(p => p.inlineData);
      if (!imagePart) { console.log(`No image from ${modelName}`); continue; }
      const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
      fs.writeFileSync(path.join(__dirname, '..', 'content', 'blog', 'youtube-ai-music-shorts-guide', 'cover-original.jpg'), imageBuffer);
      console.log(`Saved (${imageBuffer.length} bytes) via ${modelName}`);
      return true;
    } catch (err) { console.error(`Error with ${modelName}:`, err.message); }
  }
  return false;
}
generate().then(ok => process.exit(ok ? 0 : 1));
