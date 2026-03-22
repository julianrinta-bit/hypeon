#!/usr/bin/env node
// Generate 5 photo-style documentary thumbnails for oldest Hype On Media blog articles
// Uses Gemini Flash Image API (NanoBanana)

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.GOOGLE_AI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${API_KEY}`;

const articles = [
  {
    slug: 'youtube-algorithm-small-creators-2024',
    hook: 'CTR Beats Size',
    prompt: `Documentary-style candid photograph. NOT editorial, NOT art-directed.
Shot on Canon EOS R5 with 85mm f/1.8 lens, ISO 640. Kodak Portra 400 tonality — warm skintones, lifted shadows, slightly golden midtones, matte film finish.

COMPOSITION: Subject positioned in the RIGHT 55% of the frame. LEFT 45% contains environment with natural negative space (dark wall with warm window glow) — this is the TEXT ZONE. No important visual elements in the left 45%.

European or MENA man, mid-30s, well-maintained 3-day stubble, medium build, natural cowlick right side. Wearing fitted dark navy crewneck sweater (merino, visible knit texture at collar) with white t-shirt collar barely visible, sleeves pushed to mid-forearm. Sitting at standing matte-black desk in home office with exposed brick wall behind him. Eyes wide, mouth slightly open — "Wait, what?" expression. Leaning forward over open laptop. One AirPod in left ear only. Rubber/hair tie on right wrist. Pulled thread near left shoulder seam. Faint tan line on ring finger. Natural cowlick right side.

Desk contains: half-full iced coffee with condensation beads, phone face-down, single visible charging cable, open notebook with handwritten notes and pen.

Background: exposed brick wall, Edison bulb pendant light casting warm amber glow, floating shelf with 2-3 books (one orange spine, one dark blue, one cream). Blurred dual monitors showing YouTube Studio analytics graphs.

Mixed lighting: warm 3200K Edison bulb overhead + cool 5500K natural window light from left + blue-white 6500K monitor glow from front. Natural color temperature contrast on face.

COLOR REALISM: Environment must contain at least 3 objects with SATURATED color — orange book spine visible on shelf, bright green small potted plant on desk edge, RED ceramic mug near laptop, YELLOW sticky note on monitor frame.

In the LEFT TEXT ZONE (45% left of frame): Include the text "CTR BEATS SIZE" in bold white condensed sans-serif, positioned upper-left area, large impactful size (~80pt equivalent). Below it, include "HYPE ON MEDIA" in very small text at approximately 8% opacity, subtle watermark style.

Natural skin texture, visible pores, subtle asymmetry in features, uneven skin tone, natural redness on cheeks and nose tip. Subsurface scattering on skin. Slight film grain.

NOT posed, NOT stock photo expression, NOT airbrushed poreless skin, NOT symmetrical features, NOT clean empty desk, NOT single light source, NOT perfect hair, NOT arms crossed, NOT white or gray background, NOT studio lighting, NOT ring light, NOT performed smile.

Output: 1200x630px, 16:9 aspect ratio.`
  },
  {
    slug: 'youtube-remix-content-repurposing',
    hook: '3 Shorts. Never Made.',
    prompt: `Documentary-style candid photograph. NOT editorial, NOT art-directed.
Shot on Canon EOS R5 with 85mm f/1.8 lens, ISO 640. Kodak Portra 400 tonality — warm skintones, lifted shadows, slightly golden midtones, matte film finish.

COMPOSITION: Subject positioned in the RIGHT 55% of the frame. LEFT 45% contains environment with natural negative space (studio wall with blurred mood board) — this is the TEXT ZONE. No important visual elements in the left 45%.

European woman, early 30s, petite build, animated. Tortoiseshell round glasses (slightly oversized, she actually needs them). Freckles across nose and cheeks. Ink stain on right index finger. Multiple mismatched thin silver rings. Wearing oversized structured linen overshirt in ochre/terracotta open over black ribbed tank top. High-waisted wide-leg black trousers (creased). Thin gold chain necklace with small abstract pendant pulled off-center. Wired earbuds draped around neck.

Energized expression — mouth slightly open as if mid-sentence explaining something, eyebrows engaged, eyes bright. Gesturing with black marker in right hand. Standing at desk in creative studio.

Desk: Moleskine open with blue and red pen marks, Pantone color swatches, ceramic mug with markers and pencils sticking out (BRIGHT YELLOW and RED markers visible), open laptop showing Premiere Pro timeline (blurred).

Background: large display blurred with Figma/Premiere, wall mood board with overlapping pinned photos and curling colorful Post-its in yellow, green, pink. Mechanical keyboard with blank keycaps visible.

Mixed lighting: warm 3200K overhead pendant + cool 5500K north-facing studio window from left + blue-white 6500K monitor glow. Natural color temperature contrast.

COLOR REALISM: At least 3 saturated accent objects — BRIGHT YELLOW marker in mug, RED marker visible, GREEN plant on shelf behind, ORANGE book spine on shelf, colorful Post-it notes on mood board wall.

In the LEFT TEXT ZONE: Include the text "3 SHORTS. NEVER MADE." in bold white condensed sans-serif, large impactful size. Below it very subtly: "HYPE ON MEDIA" at ~8% opacity watermark.

Natural skin texture, visible pores, freckles, asymmetric features. Slightly smudged glasses. One trouser leg slightly tucked from sitting cross-legged earlier. Subsurface scattering. Slight film grain.

NOT posed, NOT stock photo expression, NOT airbrushed, NOT symmetrical features, NOT clean empty desk, NOT single light source, NOT white background, NOT studio lighting, NOT ring light, NOT performed smile.

Output: 1200x630px, 16:9 aspect ratio.`
  },
  {
    slug: 'youtube-connected-tv-billion-hours',
    hook: 'YouTube Beat Netflix',
    prompt: `Documentary-style candid photograph. NOT editorial, NOT art-directed.
Shot on Canon EOS R5 with 85mm f/1.8 lens, ISO 640. Kodak Portra 400 tonality — warm skintones, lifted shadows, slightly golden midtones, matte film finish.

COMPOSITION: Subject positioned in the RIGHT 55% of the frame. LEFT 45% contains environment with natural negative space (floor-to-ceiling window glass with city view softly blurred) — this is the TEXT ZONE. No important visual elements in the left 45%.

European woman, early 40s, athletic-lean build, sits upright with intention. Reading glasses pushed up on top of head. Thin gold bracelet on left wrist. Flyaway hair at right temple. Mole below left ear. Asymmetric smile — left side lifts higher. Wearing slightly oversized forest green fitted blazer (visible wool weave texture) with cream ribbed mock-neck knit underneath (visible knit rows). No logos. Apple Watch on left wrist (screen off). Bunched blazer sleeve. Short practical nails with clear polish.

Skeptical-knowing expression — one eyebrow raised, chin tilted 5 degrees up. Leaning back in chair, arms crossed loosely, evaluating. Caught mid-thought as if about to say "I already knew this."

Corner office environment. Walnut desk. 27-inch monitor showing YouTube Analytics dashboard (blurred blue/red graphs, numbers visible). Ceramic matte black coffee mug with visible ring stain on desk. Half-empty water glass with condensation ring. Monstera plant (slightly droopy, one leaf yellowing).

Background: floor-to-ceiling glass window, soft city skyline blurred behind, warm late-afternoon light. One colleague blurred in background through glass partition.

Mixed lighting: cool 5500K window light from behind-left + warm 3200K desk lamp + blue-white 6500K monitor glow. Natural color temperature contrast on face.

COLOR REALISM: GREEN forest blazer as dominant accent, BRIGHT GREEN monstera plant (slightly droopy), RED stapler on desk edge, ORANGE book spine on credenza behind her, BLUE water glass.

In the LEFT TEXT ZONE: Include the text "YOUTUBE BEAT NETFLIX" in bold white condensed sans-serif, large impactful size. Below it very subtly: "HYPE ON MEDIA" at ~8% opacity watermark.

Natural skin texture, visible pores, flyaway hair at right temple, mole below left ear, asymmetric smile. Subsurface scattering. Slight film grain.

NOT posed, NOT stock photo expression, NOT airbrushed, NOT symmetrical features, NOT clean empty desk, NOT single light source, NOT white background, NOT studio lighting, NOT ring light, NOT performed smile.

Output: 1200x630px, 16:9 aspect ratio.`
  },
  {
    slug: 'youtube-create-mobile-editing-review',
    hook: 'Right Tool. Wrong Creator.',
    prompt: `Documentary-style candid photograph. NOT editorial, NOT art-directed.
Shot on Canon EOS R5 with 85mm f/1.8 lens, ISO 640. Kodak Portra 400 tonality — warm skintones, lifted shadows, slightly golden midtones, matte film finish.

COMPOSITION: Subject positioned in the RIGHT 55% of the frame. LEFT 45% contains environment with natural negative space (studio wall with blurred equipment shelving) — this is the TEXT ZONE. No important visual elements in the left 45%.

European woman, early 30s, petite build, tortoiseshell round glasses (slightly oversized). Freckles across nose and cheeks. Ink stain on right index finger. Multiple mismatched thin silver rings. Wearing black fine-gauge ribbed turtleneck tucked into high-waisted wide-leg black trousers. Thin gold chain necklace pendant off-center. Wired earbuds draped around neck.

Focused expression — holding a smartphone in both hands at chest level, examining the phone screen intently, eyes narrowed behind glasses, slight pursed lips in evaluation. Body language: slightly leaning forward, engaged and analytical. NOT smiling — concentrating.

Desk: Moleskine open with handwritten notes, CapCut sticker or printout visible, orange pencil case open, wired earphones on desk, half-drunk coffee in a matte black ceramic mug.

Background: creative studio, large monitor blurred showing video timeline, mood board wall with pinned screenshots of app interfaces, yellow and green Post-its. Mechanical keyboard visible. Cable clutter behind monitor.

Mixed lighting: warm 3200K overhead studio lamp + cool 5500K north-facing window from left + slight blue-white monitor glow. Natural color temperature contrast.

COLOR REALISM: At least 3 saturated objects — ORANGE pencil case open on desk, BRIGHT GREEN plant on shelf, RED notebook or folder visible on shelf, YELLOW Post-it notes on mood board wall.

In the LEFT TEXT ZONE: Include the text "RIGHT TOOL. WRONG CREATOR." in bold white condensed sans-serif, large impactful size on two lines. Below it very subtly: "HYPE ON MEDIA" at ~8% opacity watermark.

Natural skin texture, visible pores, freckles, slightly smudged glasses, ink stain on right index finger. Subsurface scattering. Slight film grain.

NOT posed, NOT stock photo expression, NOT airbrushed, NOT symmetrical features, NOT clean empty desk, NOT single light source, NOT white background, NOT studio lighting, NOT ring light, NOT performed smile.

Output: 1200x630px, 16:9 aspect ratio.`
  },
  {
    slug: 'youtube-ai-disclosure-requirements',
    hook: 'Disclose or Lose the Channel',
    prompt: `Documentary-style candid photograph. NOT editorial, NOT art-directed.
Shot on Canon EOS R5 with 85mm f/1.8 lens, ISO 640. Kodak Portra 400 tonality — warm skintones, lifted shadows, slightly golden midtones, matte film finish.

COMPOSITION: Subject positioned in the RIGHT 55% of the frame. LEFT 45% contains environment with natural negative space (clean light wall with faint monitor glow) — this is the TEXT ZONE. No important visual elements in the left 45%.

European or American man, late 30s, lean build, composed and economical. Slim rectangular titanium glasses (almost invisible frames). Faint scar through left eyebrow. Garmin sports watch on RIGHT wrist (left-handed). Wearing fitted dark gray merino quarter-zip pullover (tech-fabric, subtle sheen) over white Oxford shirt (just collar points visible). Quarter-zip has small visible pull at collar. Clean but not corporate.

Neutral calculating expression — hands resting on keyboard, paused, looking directly at camera with one eyebrow micro-raised, already calculating next move. Jaw set. Eyes focused. The look of someone who has just read policy and is measuring consequences.

Clean minimal desk: ultrawide monitor showing a blurred YouTube Studio interface with policy/compliance text, closed Moleskine notebook with pen clipped to it, insulated matte black water bottle (small dent near bottom), single earbud sitting on desk. One lens catching slight monitor glare asymmetrically.

Background: blurred open-plan office, warm lighting, 1-2 colleagues blurred out of focus in background. Clean, professional, controlled environment.

Mixed lighting: warm 3200K overhead office fluorescent (slight warm cast) + cool 5500K window light from left + blue-white 6500K monitor glow from front. Natural color temperature contrast.

COLOR REALISM: BLUE insulated water bottle on desk, RED folder or document binder visible in blurred background shelf, BRIGHT GREEN small succulent plant on desk corner, YELLOW sticky note on monitor frame edge.

In the LEFT TEXT ZONE: Include the text "DISCLOSE OR LOSE THE CHANNEL" in bold white condensed sans-serif, large impactful size on two lines. Below it very subtly: "HYPE ON MEDIA" at ~8% opacity watermark.

Natural skin texture, visible pores, faint scar through left eyebrow, slight asymmetric lens glare on glasses, watch on right wrist. Subsurface scattering. Slight film grain.

NOT posed, NOT stock photo expression, NOT airbrushed, NOT symmetrical features, NOT clean empty desk, NOT single light source, NOT white background, NOT studio lighting, NOT ring light, NOT performed smile, NOT arms crossed.

Output: 1200x630px, 16:9 aspect ratio.`
  }
];

async function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT']
      }
    });

    const url = new URL(API_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error('Failed to parse response: ' + data.substring(0, 500)));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('Generating 5 documentary-style thumbnails...\n');

  for (const article of articles) {
    console.log(`\n[${article.slug}]`);
    console.log(`Hook: "${article.hook}"`);
    console.log('Calling NanoBanana API...');

    try {
      const response = await generateImage(article.prompt);

      if (response.error) {
        console.error(`API Error: ${JSON.stringify(response.error)}`);
        continue;
      }

      const candidates = response.candidates;
      if (!candidates || !candidates[0]) {
        console.error('No candidates in response:', JSON.stringify(response).substring(0, 300));
        continue;
      }

      const parts = candidates[0].content?.parts || [];
      const imagePart = parts.find(p => p.inlineData);

      if (!imagePart) {
        console.log('No image part found. Text response:', parts.map(p => p.text).join(' ').substring(0, 200));
        continue;
      }

      const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
      const outputPath = path.join('/Users/julianrinta/projects/hypeon-website/content/blog', article.slug, 'cover.jpg');

      fs.writeFileSync(outputPath, imageBuffer);
      console.log(`Saved: ${outputPath} (${Math.round(imageBuffer.length / 1024)}KB)`);

      // Small delay between API calls
      await new Promise(r => setTimeout(r, 2000));

    } catch (err) {
      console.error(`Failed for ${article.slug}:`, err.message);
    }
  }

  console.log('\nDone! Run: npm run build to verify.');
}

main();
