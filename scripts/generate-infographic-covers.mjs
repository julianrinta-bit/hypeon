import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = 'AIzaSyArp_wG2O6h2Wmkg33h3sinBPAP1FDgrLM';

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-3.1-flash-image-preview',
  generationConfig: {
    responseModalities: ['IMAGE', 'TEXT'],
  },
});

const articles = [
  {
    slug: 'youtube-analytics-new-returning-viewers',
    prompt: `Create a dark-mode infographic thumbnail in landscape format (1200x630px, 16:9).

Style: dark tech aesthetic, premium and data-driven. Stat Explosion layout.

Color palette: near-black (#1F1F1F) background, electric teal (#00CED1) as primary accent for the dominant number, white (#F4F4F0) for supporting text.

Layout: Stat Explosion — the number "67%" dominates 65% of the frame in massive bold condensed typography (left-center). To the right: a simple split comparison visual showing two vertical bars labeled "NEW" and "RETURNING" — the RETURNING bar is significantly taller (9%) vs NEW bar (2%), rendered in teal gradient fills. Below the 67%: two lines of supporting text "of channels have a 3pt+ CTR gap" and "between new & returning viewers".

Top left: small bold label "YOUTUBE ANALYTICS" in teal uppercase with letter-spacing.
Bottom right: "HYPE ON MEDIA" text watermark at 10% opacity, white, small.

The "67%" must be rendered in an ultra-bold condensed sans-serif, almost brutalist in weight. The number should feel like it's punching through the canvas.

Format: 1200x630px landscape, 16:9 aspect ratio.
Resolution: 2K.

Do NOT include: decorative borders, stock photo inserts, 3D effects, people, clip art. Pure data visualization and typography only.`,
  },
  {
    slug: 'youtube-tv-optimization-chapters',
    prompt: `Create a dark-mode infographic thumbnail in landscape format (1200x630px, 16:9).

Style: dark navy premium, process/flow aesthetic. Step-by-step layout with icons.

Color palette: deep navy (#0D1B2A) background, warm amber (#F5A623) as accent for step numbers and highlights, white (#F4F4F0) for text.

Layout: Step-by-step process flow — 4 steps arranged horizontally across the image with connecting arrows between them:
Step 1: TV icon + "CHAPTER ARCHITECTURE" label
Step 2: Waveform/engagement peak icon + "ENGINEER PEAK MOMENTS" label
Step 3: Eye icon with "10-FOOT UI" label (legibility at distance)
Step 4: Dollar/monetization icon + "HIGHER CPMs" label
Each step has a circular amber number badge (1, 2, 3, 4) above the icon. Connecting arrows in amber between steps.

Top: bold headline "OPTIMIZE FOR TV VIEWERS" in white condensed type.
Subline in smaller text: "The Jump-to-Best-Parts Era"
Bottom: amber accent line spanning full width (thin, 4px).
Bottom right: "HYPE ON MEDIA" at 10% opacity, white, very small.

Style: clean flat icons, minimal vector aesthetic, no gradients except subtle dark-to-slightly-lighter navy on background.

Format: 1200x630px landscape, 16:9 aspect ratio.
Resolution: 2K.

Do NOT include: people, photographs, decorative borders, 3D effects, complex illustrations.`,
  },
  {
    slug: 'tiktok-ban-youtube-opportunity',
    prompt: `Create a high-contrast infographic thumbnail in landscape format (1200x630px, 16:9).

Style: bold comparison split, high visual energy. Side-by-side comparison layout.

Color palette: Left half — muted dark grey (#2A2A2A) with faded pink/red tint for TikTok side. Right half — rich dark navy (#0D1B2A) with bright YouTube red (#FF0000) accent transforming into gold (#FFD600). Sharp vertical dividing line down center.

Layout: Perfect 50/50 split comparison:
LEFT SIDE (TikTok):
- Large "TIKTOK" label at top in faded/muted style
- A crossed-out or fading icon
- Key text: "Single platform risk"
- "Platform ban risk"
- "No search longtail"
- Overall muted/grey treatment suggesting decline

RIGHT SIDE (YouTube):
- Large "YOUTUBE" label at top in bright/vivid treatment
- Bold upward arrow
- Key text: "47K new subscribers"
- "In 3 weeks during ban"
- "Search + Shorts flywheel"
- Bright, high-contrast, energetic treatment

Center dividing line: thick vertical line with "VS" badge at middle in bold white circle.

Top: bold headline across full width "THE WINDOW IS OPEN NOW" in large white condensed caps.
Bottom right: "HYPE ON MEDIA" at 10% opacity, white, small.

Format: 1200x630px landscape, 16:9 aspect ratio.
Resolution: 2K.

Do NOT include: actual logos (just text labels), people, 3D effects.`,
  },
  {
    slug: 'youtube-brandcast-2024-advertising-trends',
    prompt: `Create a dark-mode infographic thumbnail in landscape format (1200x630px, 16:9).

Style: premium editorial Bento Grid, professional and data-rich. Navy + gold color story.

Color palette: deep navy (#0D1B2A) background for outer frame, slightly lighter navy (#162236) for bento cells, warm gold (#D4A843) as accent, white (#F4F4F0) for text.

Layout: 2x2 Bento Grid — 4 modular data blocks with subtle borders and slight spacing between cells:

Cell 1 (top-left): "CREATOR TAKEOVER" label + "8-12x" in large gold bold type + "more per view vs average" in small white text

Cell 2 (top-right): "AI CTV ADS" label + "34%" in large gold bold type + "higher brand recall" in small white text

Cell 3 (bottom-left): "QR CODES" label + "2.1-3.7%" in large gold bold type + "TV scan rates" in small white text

Cell 4 (bottom-right): "TOP 1%" label + "Creator Takeover" in medium white type + "CPMs exceed TV buys" in small text

Header above grid: "BRANDCAST 2024" in small gold uppercase tracking label.
Main headline: "YOUTUBE REPRICED ITS INVENTORY" in bold white condensed type.
Bottom right: "HYPE ON MEDIA" at 10% opacity, white, very small.

Each cell has clean minimal design: label in small gold uppercase, key number/stat in large bold, context in small white. Slight gold border on cell edges.

Format: 1200x630px landscape, 16:9 aspect ratio.
Resolution: 2K.

Do NOT include: people, photographs, decorative gradients, 3D effects, complex icons.`,
  },
  {
    slug: 'youtube-podcast-rss-integration',
    prompt: `Create a dark-mode infographic thumbnail in landscape format (1200x630px, 16:9).

Style: Stat Explosion, bold and singular. Dark background with single bright accent.

Color palette: near-black (#1F1F1F) background, bright electric lime/green (#A8FF3E) as the single dominant accent color, white (#F4F4F0) for supporting text.

Layout: Stat Explosion — the number "10x" dominates the entire left 60% of the frame in an ultra-massive bold condensed typeface. The "10" should be enormous, filling most of the vertical height. The "x" slightly smaller but still huge. The number rendered in bright electric lime (#A8FF3E).

Right 40% of frame: clean vertical stack of supporting context:
- "VIDEO PODCAST" in small uppercase label (lime color)
- "vs static RSS upload" in medium white text
- A simple visual: two horizontal bars stacked
  - Bottom bar: short grey bar labeled "RSS: 200 views"
  - Top bar: long lime bar labeled "VIDEO: 2,000 views"
- These bars illustrate the 10x gap visually

Below the "10x": small white text "performance gap per episode"

Top: small "YOUTUBE PODCASTS" label in lime uppercase, letter-spaced.
Bottom right: "HYPE ON MEDIA" at 10% opacity, white, very small.

The "10x" must feel overwhelming and unavoidable — the entire thumbnail IS that number.

Format: 1200x630px landscape, 16:9 aspect ratio.
Resolution: 2K.

Do NOT include: people, photographs, decorative borders, 3D effects. Pure typography and simple data bars only.`,
  },
];

async function generateCover(article) {
  console.log(`\nGenerating: ${article.slug}...`);

  try {
    const result = await model.generateContent(article.prompt);
    const parts = result.response.candidates[0].content.parts;
    const imagePart = parts.find(p => p.inlineData);

    if (!imagePart) {
      console.error(`No image returned for ${article.slug}`);
      const textPart = parts.find(p => p.text);
      if (textPart) console.error('Model response:', textPart.text);
      return false;
    }

    const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
    const outputPath = path.join(__dirname, '..', 'content', 'blog', article.slug, 'cover.jpg');
    fs.writeFileSync(outputPath, imageBuffer);
    console.log(`Saved: ${outputPath} (${(imageBuffer.length / 1024).toFixed(1)}KB)`);
    return true;
  } catch (err) {
    console.error(`Error generating ${article.slug}:`, err.message);
    return false;
  }
}

async function main() {
  console.log('Starting infographic cover generation for 5 articles...\n');

  const results = [];
  for (const article of articles) {
    const success = await generateCover(article);
    results.push({ slug: article.slug, success });
    // Small delay between API calls
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('\n--- RESULTS ---');
  for (const r of results) {
    console.log(`${r.success ? '✓' : '✗'} ${r.slug}`);
  }

  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.log(`\n${failed.length} failed. Check errors above.`);
    process.exit(1);
  } else {
    console.log('\nAll 5 covers generated successfully.');
  }
}

main();
