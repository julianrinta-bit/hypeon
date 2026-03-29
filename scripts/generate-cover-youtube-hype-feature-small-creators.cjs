const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GOOGLE_AI_API_KEY || 'AIzaSyAOwsromYnvCbhVKYzgDcBN9DytPM_yQeI';

async function generate() {
  const genAI = new GoogleGenerativeAI(API_KEY);

  // Try primary model, then fallback
  const models = ['gemini-3.1-flash-image-preview', 'gemini-2.5-flash-image'];

  for (const modelName of models) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      });

      const prompt = `Documentary photograph, NOT editorial, NOT art-directed. Shot on Canon EOS R5 with 50mm f/2.0 lens, ISO 800. Kodak Portra 400 tonality — warm skintones, lifted shadows, slightly golden midtones, matte film finish.

SCENE: A European/American man in his late 30s, medium build, 3-day stubble, dark navy crewneck sweater with visible knit texture, white t-shirt collar barely showing. He sits at a standing desk in a modern open-plan office, leaning back slightly with arms loosely crossed, one eyebrow raised in skeptical evaluation. His expression is "interesting but I'm not convinced yet" — caught mid-thought, not posed.

He's looking at a 27-inch monitor that shows a colorful leaderboard interface with rising bar charts and numbered rankings (blurred but recognizable as a ranking page). A second smaller monitor to the right shows YouTube analytics (blurred). 

ENVIRONMENT: Modern coworking-style office, concrete pillars, exposed ductwork painted matte black. A bright ORANGE coffee mug on the desk. A GREEN succulent plant in a terracotta pot. BLUE sticky notes on a small corkboard behind him. Natural afternoon light from large industrial windows to the left (5200K, warm golden) mixing with cool overhead LEDs (6500K). Far corners of the room are darker. Two blurred colleagues visible in deep background.

COMPOSITION: 16:9 landscape format. Subject positioned in the RIGHT 55% of frame. LEFT 45% contains the monitor setup and office environment with natural negative space above — this is where text will overlay. Subject's eyeline points LEFT toward the monitors, creating visual tension.

TEXT OVERLAY — integrated into the image:
Top-left area (in the negative space above monitors): "YOUTUBE HYPE" in bold condensed sans-serif font (like Bebas Neue), white color (#FFFFFF), large and commanding. Below it in slightly smaller text: "Will It Actually Help?" in cream white (#FAF3E0). The word "HYPE" should have a subtle golden tint (#FFD700).

Bottom of image: An 85-pixel solid yellow band (#FFD600) spanning the full width. Inside this band, centered, very small text "HYPE ON MEDIA" in dark charcoal (#1A1A1A), subtle and professional.

MICRO-REALISM: Faint dust motes near window light, subtle lens vignetting at corners, natural sensor noise in shadow regions. Realistic pore variation on face, faint vein tracery at temples, slight facial asymmetry. Individual flyaway hair strands. Fabric pilling at sweater collar. Natural depth-of-field with graduated falloff.

NOT posed — NOT stock photo — NOT airbrushed skin — NOT symmetrical features — NOT studio lighting — NOT ring light — NOT performed smile — NOT white or gray background — NOT single color temperature.

Output: 1200x675 pixels, landscape orientation, photorealistic.`;

      const result = await model.generateContent(prompt);
      const parts = result.response.candidates[0].content.parts;
      const imagePart = parts.find(p => p.inlineData);

      if (imagePart) {
        const outputPath = path.join(__dirname, '..', 'content', 'blog', 'youtube-hype-feature-small-creators', 'cover.jpg');
        const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
        fs.writeFileSync(outputPath, imageBuffer);
        console.log(`SUCCESS: Image saved to ${outputPath} (${(imageBuffer.length / 1024).toFixed(1)} KB)`);
        return;
      } else {
        console.log(`Model ${modelName} returned no image data. Text response:`, parts.filter(p => p.text).map(p => p.text).join('\n'));
      }
    } catch (err) {
      console.error(`Model ${modelName} failed:`, err.message);
    }
  }

  console.error('All models failed to generate an image.');
  process.exit(1);
}

generate();
