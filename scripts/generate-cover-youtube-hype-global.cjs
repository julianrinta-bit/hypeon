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
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
      });

      const prompt = `Documentary photograph, NOT editorial, NOT art-directed. Shot on Canon EOS R5 with 50mm f/2.0 lens, ISO 800. Kodak Portra 400 tonality — warm skintones, lifted shadows, golden midtones, matte film finish.

SCENE: An arm wrestling match in a rustic bar. Two men sit across a heavy wooden table, hands locked in an arm wrestling grip.

The SMALLER man (left side) — European/MENA, mid-30s, 3-day stubble, fitted dark navy crewneck sweater (#1B2A4A) with visible knit texture, white t-shirt collar barely showing. He is WINNING — his arm is pushing the larger man's hand down toward the table. His expression is calm confidence with a slight one-sided grin, showing teeth on one side. The "As If" of someone who knows the rules are in his favor. Natural cowlick on right side of his hair.

The LARGER man (right side) — bigger build, expensive charcoal suit, cufflinks visible. He is LOSING — his face shows strain and confusion, jaw clenched, brow furrowed. The "As If" of someone who cannot understand why his size advantage is not working. His arm is being pushed down despite being visibly more muscular.

ENVIRONMENT: Warm dimly lit bar with exposed brick walls. A RED neon sign on the far wall (blurred but warm glow). A pint of dark beer (AMBER color) on the table. A BLUE chalk score board on the wall behind them. Warm tungsten overhead pendant light (2800K) with cool evening light from a window (6000K). Dark wooden bar counter visible in background. Two blurred spectators watching.

COMPOSITION: Landscape orientation, width approximately 1.8 times the height. The arm wrestling pair is centered, taking up the lower 60% of the frame. The locked hands are in the CENTER of the image. The dark brick wall above them provides natural text space.

TEXT OVERLAY — integrated into the image:
Bold condensed sans-serif text (like Bebas Neue) reading "YOUTUBE BUILT THIS" in white (#FFFFFF) positioned over the dark brick wall above the two competitors. Below it: "FOR THE UNDERDOG" in golden yellow (#FFD600), larger. The text is anchored to the dark exposed brick wall above the arm wrestlers.

Bottom strip: solid 85-pixel band of YouTube yellow (#FFD600) spanning full width. Inside, centered, small text "HYPE ON MEDIA" in dark charcoal (#1A1A1A).

Very faint watermark "HYPE ON MEDIA" barely visible at 8% opacity in lower right corner.

MICRO-REALISM: Warm dust in the pendant light beam, lens vignetting, natural sensor noise. Vein detail on the gripping forearms. Sweat beads on the larger man's temple. Fabric texture on the sweater. Wood grain on table surface. Beer foam ring inside the glass. Chalk dust on the scoreboard.

NOT posed — NOT stock photo — NOT airbrushed — NOT symmetrical — NOT studio lighting — NOT white background — NOT single color temperature.

Output: landscape orientation, photorealistic, approximately 1.8x wider than tall.`;

      const result = await model.generateContent(prompt);
      const parts = result.response.candidates[0].content.parts;
      const imagePart = parts.find(p => p.inlineData);

      if (imagePart) {
        const outputDir = path.join(__dirname, '..', 'content', 'blog', 'youtube-hype-global-launch-strategy');
        const originalPath = path.join(outputDir, 'cover-original.jpg');
        fs.writeFileSync(originalPath, Buffer.from(imagePart.inlineData.data, 'base64'));
        console.log(`SUCCESS: ${originalPath} (${(fs.statSync(originalPath).size / 1024).toFixed(1)} KB)`);
        return;
      }
    } catch (err) {
      console.error(`Model ${modelName} failed:`, err.message);
    }
  }
  console.error('All models failed.');
  process.exit(1);
}

generate();
