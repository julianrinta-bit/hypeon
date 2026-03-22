const os = require('os');
const fs = require('fs');
const path = require('path');

// Load env from ~/.env
const envContent = fs.readFileSync(path.join(os.homedir(), '.env'), 'utf8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Model priority: gemini-3.1-flash-image-preview (NanoBanana 2), fallback gemini-2.5-flash-image
const MODEL_PRIMARY = 'gemini-3.1-flash-image-preview';
const MODEL_FALLBACK = 'gemini-2.5-flash-image';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// ============================================================
// PROMPT — Built from frameworks:
//   - Photo_Realism_Micro_Details.md (master prompt block)
//   - Lighting_And_Background_Realism.md (practical lamp source)
//   - NanoBanana_Prompt_Guide.md (SCHEMA AVANZATO, Template 5)
//   - hypeon-imagery SKILL.md (6 documentary principles adapted)
// ============================================================

const prompt = `Documentary-style candid photograph. NOT editorial, NOT art-directed.
Shot on Canon EOS R5 with 85mm f/1.8 lens, ISO 640. Kodak Portra 400 tonality — warm skintones, lifted shadows, slightly golden midtones, matte film finish.

SUBJECT: Southern European man, age 30-34. Round full face, soft jawline, medium-to-heavy build visible at shoulders and chest. Short dark brown hair with natural volume on top, slightly tousled, not styled — some strands going their own direction. Well-maintained short stubble, 2-3 days growth, slightly patchy at the edges of the jaw where growth is thinner. Round gold-wire glasses with thin metal frames sitting slightly asymmetric on his face — one side sits fractionally lower than the other. Faint nose pad marks where the glasses rest on the bridge.

EXPRESSION: Neutral-calm, looking directly at camera. Mouth closed, lips relaxed and slightly pressed together. Not smiling, not frowning — the natural resting face of someone who just sat down and was told "look here." Eyes present but slightly tired. Slight intensity in the gaze without aggression. One eyebrow fractionally higher than the other.

CLOTHING: Light blue Oxford button-down shirt with fine white vertical pinstripes. Cotton weave texture visible — not smooth, not silk. Collar unbuttoned, relaxed, collar points slightly curled from washing. Small gold/yellow embroidered logo on left chest area (heritage brand mark, like a small horse or crest). Shirt is lived-in: visible wrinkles at the chest from sitting, creased fabric where the arms bend. One button slightly pulling at the mid-chest where fabric is taut. Fabric has visible cotton weave texture with individual thread rows discernible.

SKIN: Natural Mediterranean olive-warm tone. Realistic pore variation — fine pores on forehead, enlarged pores on nose and outer cheeks, pore shadow wells visible under the warm light. Slight redness on nose bridge where glasses rest. Faint undereye shadows — not dramatic, just the normal signs of a person who works at screens. Natural subsurface scattering visible at ear edges and nostril wings. Peach fuzz on cheeks visible in sidelight. Slight specular highlight on forehead and nose bridge from the overhead lamp. Faint vein tracery at temples.

ENVIRONMENT: Domestic European apartment living room corner. Behind the subject to his left: a copper/rose-gold industrial pendant floor lamp with a dome shade on an exposed brass arm, lamp is ON casting a warm pool of tungsten light downward. The copper shade has a slight patina — not brand new, not polished. Beige/cream painted wall behind, not perfectly smooth — slight roller texture visible. To the right of frame, partially visible: a white folding clothes drying rack with some soft items draped on it — a sock, a towel edge. A cushion or pillow corner visible at the edge. The space says "this is someone's actual apartment" — not a set, not a studio, not a co-working space.

LIGHTING: Single practical warm tungsten source from the copper pendant lamp slightly above and behind-left of subject, casting warm 2800K amber light downward. Slight cool fill from the front — as if from a phone screen or laptop at 6500K — creating a faint blue reflection visible in the glasses lenses. Mixed color temperature: warm dominant with cool undertone on face. The lamp is the only significant light source. Far side of face falls into natural shadow — no fill light, no reflector. Slight warm glow on the beige wall from the lamp. Corners of the room darker than the lamp-lit area. The overhead lamp shade itself is slightly overexposed — glowing bright copper-white.

FRAMING: Vertical portrait orientation, 3:4 aspect ratio. Head and shoulders with upper chest visible. Subject roughly centered, slightly left of center. Camera at exact eye level — peer perspective. Shallow depth of field — lamp behind is slightly soft, face tack sharp, drying rack is bokeh.

MICRO-REALISM MODIFIER:

// Environmental
faint dust motes suspended near the warm lamp light, slight lens vignetting at corners, subtle chromatic aberration at frame edges with faint purple-cyan fringing, natural sensor noise in shadow regions on the darker right side, cat-eye bokeh on any specular highlights at frame corners, subtle lens flare artifact from the copper lamp

// Skin and Face
realistic pore variation by zone (fine on forehead, enlarged on nose and cheeks), faint vein tracery at temples, off-white sclera with thin red capillaries at inner corners, tear film glint on lower eyelid, subtle facial asymmetry (one eyebrow very slightly higher), natural skin specularity on forehead and nose bridge, slight under-eye shadow, redness at nostril edges, natural neck creases from slight head angle

// Hair
individual flyaway strands at perimeter of hair, fine hair translucency at edges where backlit by lamp creating soft halo, natural hair grouping with micro-separation, one or two grey hairs mixed in

// Lips
vertical lip lines with slight dryness at corners, natural lip color variation from center to edges

// Clothing
seam puckering at shoulder tension points, positional wrinkles consistent with seated posture, slight fabric fade at collar from washing, one or two lint particles on the light blue fabric, visible cotton thread texture in the weave

// Camera/Lens
natural depth-of-field with non-linear focus falloff from face (sharp) to lamp (soft) to wall (softer), slight JPEG compression ringing at high-contrast transition of glasses frame against skin, bokeh with natural brightness variation — the lamp bokeh blooms larger than ambient areas, micro-focus variation across face — near eye slightly sharper than far eye

NOT posed — NOT stock photo expression — NOT airbrushed poreless skin — NOT symmetrical features — NOT clean empty background — NOT single color temperature — NOT studio lighting — NOT ring light — NOT beauty dish — NOT performed smile — NOT perfect hair — NOT white or gray background — NOT corporate office setting — NOT beauty-corrected average — NOT medium gray background.

Output: portrait orientation, 3:4 aspect ratio.`;

async function generate(modelName) {
  console.log(`Trying model: ${modelName}`);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
    },
  });

  const result = await model.generateContent(prompt);
  const parts = result.response.candidates[0].content.parts;
  const imagePart = parts.find(p => p.inlineData);

  if (!imagePart) {
    const textParts = parts.filter(p => p.text).map(p => p.text).join('\n');
    throw new Error(`No image returned. Text: ${textParts.slice(0, 300)}`);
  }

  return Buffer.from(imagePart.inlineData.data, 'base64');
}

async function main() {
  console.log('=== Portrait Replica — Framework-Driven Generation ===');
  console.log('Frameworks read: Photo_Realism_Micro_Details, Lighting_And_Background_Realism, NanoBanana_Prompt_Guide');
  console.log(`Prompt length: ${prompt.length} chars`);
  console.log('');

  let imageBuffer;

  // Try primary model, fallback if unavailable
  try {
    imageBuffer = await generate(MODEL_PRIMARY);
    console.log(`Success with ${MODEL_PRIMARY}`);
  } catch (err) {
    console.log(`${MODEL_PRIMARY} failed: ${err.message.slice(0, 150)}`);
    console.log(`Falling back to ${MODEL_FALLBACK}...`);
    imageBuffer = await generate(MODEL_FALLBACK);
    console.log(`Success with ${MODEL_FALLBACK}`);
  }

  const outputDir = path.join(
    os.homedir(),
    "Library/Mobile Documents/com~apple~CloudDocs/Julian's Documents/CREATIVE AGENCY OS/05_MARKETING/Campaigns/2026-03_Website_Blog"
  );
  const outputPath = path.join(outputDir, 'julian-portrait-replica-v2.jpg');

  fs.writeFileSync(outputPath, imageBuffer);
  console.log(`\nSaved to: ${outputPath}`);
  console.log(`Size: ${(imageBuffer.length / 1024).toFixed(1)} KB`);
}

main().catch(err => {
  console.error('Generation failed:', err.message);
  process.exit(1);
});
