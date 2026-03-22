import fs from 'fs';
import path from 'path';
import { createCanvas, loadImage, registerFont } from 'canvas';

const API_KEY = 'AIzaSyArp_wG2O6h2Wmkg33h3sinBPAP1FDgrLM';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${API_KEY}`;

const VAULT_DIR = path.join(
  process.env.HOME,
  'Library/Mobile Documents/com~apple~CloudDocs/Julian\'s Documents/CREATIVE AGENCY OS/05_MARKETING/Campaigns/2026-03_Website_Blog'
);

const PROMPT = `Documentary-style candid photograph. NOT editorial, NOT art-directed, NOT stock.
Shot on Canon EOS R5, 85mm f/1.8, ISO 640. Kodak Portra 400 film emulation.

COMPOSITION: Subject positioned in the RIGHT 55% of frame. LEFT 45% is natural
negative space — office wall, blurred window with city view, environmental depth.
This left zone is intentionally kept clear for text overlay.

SUBJECT: European woman, age 40, Northern European features. Skeptical-knowing expression —
one eyebrow raised, asymmetric half-smile, head tilted slightly.
Arms crossed, leaning against desk edge. Caught mid-conversation, not posed.

WARDROBE: Forest green fitted wool blazer with visible herringbone texture, sleeves pushed
to mid-forearm. Underneath: tonal ivory silk shell, slightly creased at the neckline.
Small gold hoop earrings. Thin gold chain bracelet on left wrist.
Reading glasses pushed up on head, slightly crooked.
The blazer has a visible pulled thread near the left shoulder seam.

SKIN: Real texture — visible pores on forehead, light freckle scatter across nose,
slight rosacea flush on cheeks, subtle crow's feet, faint blue vein at temple.
Subsurface scattering on ears and nose tip. Not retouched, not airbrushed.

DESK/ENVIRONMENT (RIGHT side, around subject):
- A BRIGHT RED stapler partially visible
- An ORANGE hardcover book spine on the desk edge
- A reusable coffee cup with a TEAL lid, half-drunk, condensation ring
- Printed report with BLUE pen handwritten margin notes, pages curled
- A GREEN plant (pothos) trailing off the desk edge with one yellowing leaf
- A tangled black charging cable
- Phone face-down with a cracked screen protector

BACKGROUND: Floor-to-ceiling glass office wall. Blurred European city skyline
(could be London or Amsterdam). Through the glass: 2 colleagues at a whiteboard,
one gesturing. The monitor behind her shows a blurred upward-trending pipeline chart
with navy and green bars.

LIGHTING: Mixed practical sources — cool 5500K natural window light from left,
warm 3200K overhead office fixture, blue-white 6500K monitor glow.
The color temperature mix creates natural warm/cool contrast on her face.
NOT studio lighting, NOT ring light, NOT single source.

COLOR REALISM: Multiple saturated color accents in the scene — the red stapler,
orange book, teal cup lid, green plant — breaking the grey/beige monotone.
Real offices are chromatically messy. This image must NOT be tonally uniform.

NOT posed. NOT stock photo. NOT airbrushed. NOT symmetrical features.
NOT clean empty desk. NOT studio lighting. NOT white background.
NOT perfect hair. NOT performed smile. NOT beauty-corrected.

Aspect ratio: 16:9 landscape, 1200x630px equivalent.`;

async function generateImage() {
  console.log('Generating image with Gemini 3.1 Flash Image Preview...');

  const body = {
    contents: [{
      parts: [{
        text: PROMPT
      }]
    }],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
    }
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  // Find the image part in the response
  const candidates = data.candidates || [];
  let imageData = null;

  for (const candidate of candidates) {
    const parts = candidate.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        imageData = part.inlineData;
        break;
      }
    }
    if (imageData) break;
  }

  if (!imageData) {
    console.error('Response structure:', JSON.stringify(data, null, 2).slice(0, 2000));
    throw new Error('No image data in response');
  }

  const buffer = Buffer.from(imageData.data, 'base64');
  const rawPath = path.join(VAULT_DIR, 'b2b-definitive-raw.png');
  fs.writeFileSync(rawPath, buffer);
  console.log(`Raw image saved: ${rawPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
  return rawPath;
}

async function overlayText(rawImagePath) {
  console.log('Applying text overlay with canvas...');

  const img = await loadImage(rawImagePath);

  // Target dimensions
  const W = 1200;
  const H = 630;
  const BAND_H = 85;
  const PHOTO_H = H - BAND_H; // 545px for photo

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Draw the photo scaled to fill the photo zone
  ctx.drawImage(img, 0, 0, W, PHOTO_H);

  // --- LEFT SCRIM (40-50% gradient) ---
  const scrimWidth = Math.floor(W * 0.50); // 50% of width
  const scrimGrad = ctx.createLinearGradient(0, 0, scrimWidth, 0);
  scrimGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
  scrimGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.20)');
  scrimGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = scrimGrad;
  ctx.fillRect(0, 0, scrimWidth, PHOTO_H);

  // --- TEXT: "18 MONTHS" + "AHEAD" ---
  const fontSize = 80;
  const tracking = 0.08; // em units
  const textColor = '#FAF3E0'; // cream white
  const leftMargin = 120;

  // Try bold condensed, fallback to bold sans-serif
  ctx.font = `bold ${fontSize}px "Arial Black", "Helvetica Neue", sans-serif`;
  ctx.fillStyle = textColor;
  ctx.textBaseline = 'middle';

  // Helper: draw text with letter spacing
  function drawTextWithSpacing(text, x, y, letterSpacing) {
    const chars = text.split('');
    let currentX = x;
    for (const char of chars) {
      ctx.fillText(char, currentX, y);
      const charWidth = ctx.measureText(char).width;
      currentX += charWidth + letterSpacing;
    }
  }

  // Calculate letter spacing in pixels
  const letterSpacingPx = fontSize * tracking;

  // Position text vertically centered in the photo zone
  const line1 = '18 MONTHS';
  const line2 = 'AHEAD';
  const lineGap = fontSize * 1.1;
  const totalTextHeight = fontSize + lineGap;
  const textStartY = (PHOTO_H / 2) - (totalTextHeight / 2) + (fontSize / 2);

  // Draw line 1
  drawTextWithSpacing(line1, leftMargin, textStartY, letterSpacingPx);
  // Draw line 2
  drawTextWithSpacing(line2, leftMargin, textStartY + lineGap, letterSpacingPx);

  // --- BOTTOM BAND: Navy #1B2A4A ---
  ctx.fillStyle = '#1B2A4A';
  ctx.fillRect(0, PHOTO_H, W, BAND_H);

  // Brand text in the band
  ctx.font = 'bold 16px "Helvetica Neue", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = 0.7;
  ctx.fillText('HYPE ON MEDIA', 40, PHOTO_H + BAND_H / 2);

  ctx.font = '14px "Helvetica Neue", sans-serif';
  ctx.fillStyle = '#FFD600'; // accent yellow
  ctx.globalAlpha = 0.9;
  ctx.fillText('STRATEGY / B2B', W - 160, PHOTO_H + BAND_H / 2);
  ctx.globalAlpha = 1;

  // --- EXPORT ---
  const finalPath = path.join(VAULT_DIR, 'b2b-definitive-thumb.jpg');

  // Export as JPEG with quality optimization
  const jpgBuffer = canvas.toBuffer('image/jpeg', { quality: 0.92 });
  fs.writeFileSync(finalPath, jpgBuffer);

  const fileSizeKB = (jpgBuffer.length / 1024).toFixed(0);
  console.log(`Final thumbnail saved: ${finalPath} (${fileSizeKB} KB)`);
  console.log(`Dimensions: ${W}x${H}px`);

  return finalPath;
}

async function main() {
  try {
    const rawPath = await generateImage();
    const finalPath = await overlayText(rawPath);
    console.log('\nDone. Saved to vault ONLY (not desktop, not website).');
    console.log(finalPath);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
