import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

const W = 1200;
const H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// ═══════════════════════════════════════════════════════
// COMPOSITION RULES APPLIED:
// - Margins: 8% standard = 96px sides, 75px top/bottom (inside 8px grid)
// - Grid: rule of thirds — power points at (400,210), (800,210)
// - Typography: Perfect Fourth scale (1.333) — 12/16/21/28/38/50/67px
// - Minimum readable at 300px: 28px at canvas resolution
// - Color: 60-30-10 rule (BG 60%, text 30%, accent 10%)
// - Spacing: all multiples of 8
// - Z-pattern reading: TL→TR→BL→BR
// ═══════════════════════════════════════════════════════

// ─── Colors (60-30-10) ───
const BG = '#F7F7F5';        // 60% — warm off-white
const TEXT = '#1A1A1A';       // 30% — near-black
const ACCENT = '#E8350F';     // 10% — YouTube red-orange (signal color)
const MUTED = '#6B6B67';      // subset of 30% — secondary text

// ─── Grid constants ───
const MARGIN_X = 96;          // 8% of 1200
const MARGIN_Y = 80;          // ~12.7% of 630 (8px grid: 80)
const CONTENT_W = W - MARGIN_X * 2; // 1008px
const THIRD_X1 = 400;        // vertical third line 1
const THIRD_X2 = 800;        // vertical third line 2
const THIRD_Y1 = 210;        // horizontal third line 1
const THIRD_Y2 = 420;        // horizontal third line 2

// ─── Background ───
ctx.fillStyle = BG;
ctx.fillRect(0, 0, W, H);

// Subtle noise texture
ctx.fillStyle = 'rgba(0, 0, 0, 0.012)';
for (let i = 0; i < 500; i++) {
  ctx.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5);
}

// ─── Vertical divider aligned to third line ───
ctx.strokeStyle = ACCENT;
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(THIRD_X2 - 96, MARGIN_Y);        // 704px — near 2/3 line
ctx.lineTo(THIRD_X2 - 96, THIRD_Y2 + 40);
ctx.stroke();

// ═══════════════════════════════════════════════════════
// LEFT ZONE (columns 1-7 of 12 ≈ 60% width)
// Z-pattern: eye starts here → scans right
// ═══════════════════════════════════════════════════════

// Category label — 16px (Body scale), uppercase
ctx.fillStyle = ACCENT;
ctx.font = '700 16px "Helvetica Neue", Helvetica, Arial, sans-serif';
ctx.letterSpacing = '4px';
ctx.fillText('B2B VIDEO', MARGIN_X, MARGIN_Y + 16);
ctx.letterSpacing = '0px';

// THE HOOK: "30" — Display scale at ~280px (dominant, anchored near power point 400,210)
ctx.fillStyle = ACCENT;
ctx.font = '900 280px "Helvetica Neue", Helvetica, Arial, sans-serif';
ctx.fillText('30', MARGIN_X - 16, THIRD_Y1 + 152); // baseline near y=362

// "min" — H1 scale (50px), lightweight
ctx.fillStyle = TEXT;
ctx.font = '200 72px "Helvetica Neue", Helvetica, Arial, sans-serif';
ctx.fillText('min', MARGIN_X + 400, THIRD_Y1 + 136);

// Context line — H3 scale (28px), bold — READABLE at 300px
ctx.fillStyle = TEXT;
ctx.font = '700 28px "Helvetica Neue", Helvetica, Arial, sans-serif';
ctx.fillText('before first contact.', MARGIN_X, THIRD_Y2 - 8);

// FOMO line — Body Large (21px)
ctx.fillStyle = MUTED;
ctx.font = '400 21px "Helvetica Neue", Helvetica, Arial, sans-serif';
ctx.fillText('Your buyers research on video.', MARGIN_X, THIRD_Y2 + 32);
ctx.fillText('Are you there?', MARGIN_X, THIRD_Y2 + 60);

// ═══════════════════════════════════════════════════════
// RIGHT ZONE (columns 8-12 ≈ 40% width)
// Z-pattern: eye lands here after scanning from left
// ═══════════════════════════════════════════════════════

const rx = THIRD_X2 - 56;  // 744px — right of divider, with 40px gap
const statGap = 144;        // 144px between stat blocks (multiple of 8)

// Stat 1 — anchored near power point (800, 210)
ctx.fillStyle = TEXT;
ctx.font = '900 56px "Helvetica Neue", Helvetica, Arial, sans-serif';
ctx.fillText('95%', rx, MARGIN_Y + 64);

ctx.fillStyle = MUTED;
ctx.font = '500 19px "Helvetica Neue", Helvetica, Arial, sans-serif';
ctx.fillText('decision-makers', rx, MARGIN_Y + 96);
ctx.fillText('on YouTube', rx, MARGIN_Y + 120);

// Divider — 48px gap below (8px grid)
ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(rx, MARGIN_Y + statGap);
ctx.lineTo(W - MARGIN_X, MARGIN_Y + statGap);
ctx.stroke();

// Stat 2
const s2y = MARGIN_Y + statGap + 24;
ctx.fillStyle = TEXT;
ctx.font = '900 56px "Helvetica Neue", Helvetica, Arial, sans-serif';
ctx.fillText('1 → 20+', rx, s2y + 48);

ctx.fillStyle = MUTED;
ctx.font = '500 19px "Helvetica Neue", Helvetica, Arial, sans-serif';
ctx.fillText('pieces per video', rx, s2y + 80);

// Divider
ctx.beginPath();
ctx.moveTo(rx, s2y + statGap - 16);
ctx.lineTo(W - MARGIN_X, s2y + statGap - 16);
ctx.stroke();

// Stat 3
const s3y = s2y + statGap + 8;
ctx.fillStyle = TEXT;
ctx.font = '900 56px "Helvetica Neue", Helvetica, Arial, sans-serif';
ctx.fillText('70%', rx, s3y + 48);

ctx.fillStyle = MUTED;
ctx.font = '500 19px "Helvetica Neue", Helvetica, Arial, sans-serif';
ctx.fillText('watch video to buy', rx, s3y + 80);

// ═══════════════════════════════════════════════════════
// BOTTOM BAR — branding (accent 10%)
// ═══════════════════════════════════════════════════════

const barH = 48;
ctx.fillStyle = ACCENT;
ctx.fillRect(0, H - barH, W, barH);

ctx.fillStyle = '#FFFFFF';
ctx.font = '700 13px "Helvetica Neue", Helvetica, Arial, sans-serif';
ctx.letterSpacing = '3px';
ctx.fillText('HYPE ON MEDIA', MARGIN_X, H - 18);
ctx.letterSpacing = '0px';

ctx.font = '400 13px "Helvetica Neue", Helvetica, Arial, sans-serif';
const dw = ctx.measureText('hypeon.media').width;
ctx.fillText('hypeon.media', W - MARGIN_X - dw, H - 18);

// ─── Save ───
writeFileSync('content/blog/b2b-youtube-strategy/cover.png', canvas.toBuffer('image/png'));
console.log('Generated: cover.png (1200×630, composition rules applied)');
