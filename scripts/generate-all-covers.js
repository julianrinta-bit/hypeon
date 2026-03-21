#!/usr/bin/env node
/**
 * generate-all-covers.js
 * Generates unique 1200x675 cover images for all blog articles
 * that currently use the placeholder cover.
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const WIDTH = 1200;
const HEIGHT = 675;
const BLOG_DIR = path.join(__dirname, '..', 'content', 'blog');

// Articles with hand-crafted proper covers — skip these
const SKIP_SLUGS = new Set([
  'youtube-seo-guide-2026',
  'youtube-thumbnail-ctr',
  'b2b-youtube-strategy',
]);

// Accent color palette — 8 colours, cycled by article index
const ACCENTS = [
  { r: 255, g: 211, b: 0,   a: 0.15, name: 'Gold'   },
  { r: 0,   g: 210, b: 190, a: 0.12, name: 'Teal'   },
  { r: 130, g: 80,  b: 255, a: 0.12, name: 'Violet' },
  { r: 59,  g: 130, b: 246, a: 0.12, name: 'Blue'   },
  { r: 34,  g: 197, b: 94,  a: 0.12, name: 'Green'  },
  { r: 249, g: 115, b: 22,  a: 0.12, name: 'Orange' },
  { r: 236, g: 72,  b: 153, a: 0.12, name: 'Pink'   },
  { r: 6,   g: 182, b: 212, a: 0.12, name: 'Cyan'   },
];

// Gradient origin positions — 4 positions, cycled per article
const POSITIONS = [
  { x: 0,     y: HEIGHT }, // bottom-left
  { x: WIDTH, y: 0      }, // top-right
  { x: WIDTH, y: HEIGHT }, // bottom-right
  { x: 0,     y: 0      }, // top-left
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract the `title` value from MDX frontmatter (YAML block between --- delimiters).
 */
function extractTitle(mdxContent) {
  const match = mdxContent.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return null;
  const frontmatter = match[1];
  // Handle both quoted and unquoted title values
  const titleMatch = frontmatter.match(/^title:\s*["']?(.*?)["']?\s*$/m);
  if (!titleMatch) return null;
  // Strip surrounding quotes if present
  return titleMatch[1].replace(/^["']|["']$/g, '').trim();
}

/**
 * Wrap a title string into lines of at most `maxChars` characters,
 * splitting on word boundaries. Returns 2–3 lines max.
 */
function wrapTitle(title, maxChars = 25) {
  const words = title.split(' ');
  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
      if (lines.length === 2) {
        // On 3rd line, collect all remaining words
        const remaining = words.slice(words.indexOf(word)).join(' ');
        lines.push(remaining);
        current = '';
        break;
      }
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  return lines.slice(0, 3);
}

/**
 * Generate and save a cover image for one article.
 */
function generateCover(slug, title, accentIdx) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  const accent = ACCENTS[accentIdx % ACCENTS.length];
  const pos = POSITIONS[accentIdx % POSITIONS.length];

  // ── Background ────────────────────────────────────────────────────────────
  ctx.fillStyle = '#0A0A0A';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // ── Gradient accent blob ──────────────────────────────────────────────────
  const radius = Math.max(WIDTH, HEIGHT) * 0.85;
  const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
  grad.addColorStop(0,   `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${accent.a})`);
  grad.addColorStop(0.5, `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${accent.a * 0.4})`);
  grad.addColorStop(1,   'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // ── Subtle texture via faint grid dots ────────────────────────────────────
  ctx.fillStyle = 'rgba(255, 255, 255, 0.018)';
  for (let x = 0; x < WIDTH; x += 48) {
    for (let y = 0; y < HEIGHT; y += 48) {
      ctx.beginPath();
      ctx.arc(x, y, 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Gold accent line at ~68% height ──────────────────────────────────────
  const lineY = Math.round(HEIGHT * 0.68);
  ctx.strokeStyle = 'rgba(255, 211, 0, 0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(64, lineY);
  ctx.lineTo(WIDTH - 64, lineY);
  ctx.stroke();

  // ── Title text ────────────────────────────────────────────────────────────
  const lines = wrapTitle(title, 25);
  const lineCount = lines.length;

  // Dynamic font size: fewer lines → bigger text
  const fontSize = lineCount === 1 ? 72 : lineCount === 2 ? 64 : 52;
  const lineHeight = fontSize * 1.22;

  // Vertically centre the title block in the upper portion (above the accent line)
  const blockHeight = lineCount * lineHeight;
  const centerY = lineY * 0.5;
  const startY = centerY - blockHeight / 2 + fontSize * 0.85;

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textBaseline = 'alphabetic';

  lines.forEach((line, i) => {
    ctx.fillText(line, 64, startY + i * lineHeight);
  });

  // ── Bottom-left brand label ───────────────────────────────────────────────
  ctx.fillStyle = 'rgba(255, 211, 0, 0.85)';
  ctx.font = `bold 14px monospace`;
  ctx.fillText('HYPE ON MEDIA', 64, HEIGHT - 32);

  // ── Bottom-right domain ───────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(160, 160, 160, 0.7)';
  ctx.font = `13px monospace`;
  const domain = 'hypeon.media';
  const domainWidth = ctx.measureText(domain).width;
  ctx.fillText(domain, WIDTH - 64 - domainWidth, HEIGHT - 32);

  // ── Save ──────────────────────────────────────────────────────────────────
  const outPath = path.join(BLOG_DIR, slug, 'cover.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outPath, buffer);
  return outPath;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const entries = fs.readdirSync(BLOG_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .sort();

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  entries.forEach((slug) => {
    if (SKIP_SLUGS.has(slug)) {
      console.log(`  SKIP  ${slug} (original cover preserved)`);
      skipped++;
      return;
    }

    const mdxPath = path.join(BLOG_DIR, slug, 'index.mdx');
    if (!fs.existsSync(mdxPath)) {
      console.log(`  SKIP  ${slug} (no index.mdx)`);
      skipped++;
      return;
    }

    const mdxContent = fs.readFileSync(mdxPath, 'utf8');
    const title = extractTitle(mdxContent);
    if (!title) {
      console.warn(`  WARN  ${slug} — could not extract title, skipping`);
      errors++;
      return;
    }

    // Use the article's generation index for colour/position cycling
    const accentIdx = generated;

    try {
      generateCover(slug, title, accentIdx);
      const accent = ACCENTS[accentIdx % ACCENTS.length];
      console.log(`  GEN   ${slug} — "${title}" [${accent.name}]`);
      generated++;
    } catch (err) {
      console.error(`  ERR   ${slug} — ${err.message}`);
      errors++;
    }
  });

  console.log(`\nDone. Generated: ${generated} | Skipped: ${skipped} | Errors: ${errors}`);
}

main();
