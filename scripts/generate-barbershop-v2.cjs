const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'AIzaSyAOwsromYnvCbhVKYzgDcBN9DytPM_yQeI');

const MODEL_CASCADE = [
  'gemini-3-pro-image-preview',
  'gemini-3.1-flash-image-preview',
  'gemini-2.5-flash-image',
];

const prompt = `Documentary photograph, candid moment captured inside a vintage barbershop. Shot on Canon EOS R5 with 50mm f/1.8 lens, ISO 800, natural available light, Kodak Portra 400 color character. Width should be about 1.8 times the height, NOT ultra-wide, NOT cinematic widescreen. Landscape orientation.

SCENE: The interior of a vintage barbershop at 4pm on a weekday afternoon. Nobody is getting a haircut anymore. This is the social hour. These men came for haircuts and they are STAYING for the conversation.

MAIN CHARACTER (foreground right, sharpest focus): A man around 35 years old is leaned back in a vintage 1960s hydraulic barber chair with rich oxblood (#6B1515) aged leather and brushed steel chrome accents with fingerprint smudges. He is laughing genuinely, involuntarily, head tilted back about 20 degrees against the padded headrest, mouth wide open showing top teeth, eyes crinkled nearly shut with deep crow's feet, as if someone just delivered the most perfectly timed roast and his body cannot stop laughing yet. His left hand grips the wide leather armrest firmly, knuckles slightly white. His right ankle is crossed loosely over his left knee, the posture of someone who is NOT about to leave.

He wears a fitted heather charcoal (#3D3D3D) heavyweight cotton-blend henley with visible weave texture, top two horn buttons undone. On his left wrist, a brushed steel diver watch with dark navy (#1B2A4A) dial and worn brown leather strap (#6B4226). Dark olive (#3B4A3A) cotton twill chinos with natural creasing at the knees. His haircut is fresh, clean fade on the sides, textured dark brown (#2C1A0E) on top. One-day stubble along the jawline and chin. Medium warm olive skin tone with visible pore variation, faint laugh lines, a small mole on the right side of his neck.

On the wide leather armrest of the barber chair, a small white (#F5F0E8) ceramic demitasse espresso cup smaller than a fist sits on a matching saucer. The espresso is half-empty, dark coffee (#2C1810) visible at the midpoint. No steam, this coffee has been sitting for ten minutes. A tiny brown coffee ring stain on the saucer.

THE BARBER (standing beside the chair, THREE-QUARTER PROFILE, his face turned toward the main character, NOT toward the camera): A stocky man in his mid-40s, standing with weight on one leg, relaxed. He wears a charcoal (#3A3A3A) canvas barber apron over a faded black (#1C1C1C) crew-neck t-shirt, sleeves tight around thick forearms. In his right hand, a pair of stainless steel scissors held LOW and CLOSED, tools at rest. His left hand rests on the back of the barber chair. He is mid-laugh, mouth open, shoulders shaking, responding to whatever the main character just said. Short salt-and-pepper hair buzzed close. A thin gold chain at his neckline. His face is in THREE-QUARTER PROFILE visible from cheekbone and jaw, NOT facing the camera directly.

TWO OTHER CLIENTS (mid-ground, slightly softer focus): Two men sitting on a vintage wooden waiting bench against the exposed brick (#A0522D) wall, about 6 feet behind the main character. BOTH still wearing dark navy (#1B2838) barber capes draped over their shoulders, their haircuts are done but they have NOT left. ONE is leaning forward with elbows on knees, body shaking with laughter, face angled DOWN and partially obscured, we see the top of his head and shoulders moving. The OTHER is leaning back against the brick wall, one hand raised mid-gesture telling a story, face turned IN PROFILE toward the first guy, we see the silhouette of his jawline only. Both rendered with SLIGHTLY SOFTER focus than the foreground pair, they are atmosphere, not competing for focal priority.

ENVIRONMENT: Dark walnut (#3B2416) wall shelves holding glass bottles, a blue (#2A4B7C) Barbicide jar, amber (#B8741A) aftershave bottles. A large rectangular mirror in a dark wood frame with business cards tucked into the frame edge. White marble (#E8E3DA) counter with clipper guards and a boar-bristle brush. Two bare Edison filament bulbs (#FFB347 warm glow) hanging from twisted cloth-covered cord. Black (#1A1A1A) and off-white (#E8E3DA) checkered floor tiles with slight grout lines and tiny hair clippings near the chair base. Brass (#B8860B) coat hooks on the wall, one holding a dark jacket.

Behind the scene, a large storefront window partially blown out with bright daylight. Through the glass, blurred shapes of pedestrians and parked cars. The window frame is dark painted wood (#2C2C2C). Reversed gold (#B8860B) shapes on the inside of the window glass suggesting vintage gold-leaf signage with no readable letters.

In white (#FFFFFF) bold sans-serif text over the dark wood shelving and dim ceiling area in the upper-left of the image, the words "The Space Between" as perfectly straight horizontal text, not tilted, not curved, not rotated, perfectly level like a typeset headline. A very faint barely perceptible dark gradient behind the letters for legibility.

LIGHTING: Primary warm 2700K Edison tungsten from above. Secondary afternoon sun from the front window creating rim light on the right side of the main character. The sun does NOT wash everything, it is a contained beam catching dust motes. White balance set for tungsten so window light reads slightly cool-blue. Fill from cream floor tiles. Mixed color temperature visible on the main character face, warm on the near side, cool rim on the far side.

CRITICAL COLOR DIRECTIVE: 12 distinct color zones minimum. The oxblood leather chair and the blue Barbicide jar are the MOST SATURATED. Do NOT wash everything in a single warm tone.

NOT a stock photo. NOT symmetrical. NOT a posed group portrait. Candid documentary moment. Natural asymmetry. No airbrushing, realistic pore density, skin imperfections. No perfectly smooth surfaces. Chrome is brushed with smudges. Leather is aged with patina. Every human in the frame must pass the real person test, no deformed hands, no extra fingers.`;

async function generateImage() {
  for (const modelName of MODEL_CASCADE) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      });
      console.log('Trying ' + modelName + '...');
      const result = await model.generateContent(prompt);
      const parts = result.response.candidates[0].content.parts;
      const image = parts.find(p => p.inlineData);
      if (image) {
        console.log('Success with ' + modelName);
        const imageBuffer = Buffer.from(image.inlineData.data, 'base64');
        const ext = image.inlineData.mimeType.includes('png') ? 'png' : 'jpg';
        const outputPath = 'content/blog/youtube-communities-feature-guide/cover-barbershop-v2.' + ext;
        fs.writeFileSync(outputPath, imageBuffer);
        console.log('Saved to ' + outputPath);
        console.log('Size: ' + (imageBuffer.length / 1024).toFixed(0) + 'KB');
        return;
      }
    } catch (err) {
      console.warn(modelName + ' failed: ' + err.message + '. Trying next...');
    }
  }
  throw new Error('All models failed');
}

generateImage().catch(e => console.error(e));
