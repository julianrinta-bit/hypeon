const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'AIzaSyAOwsromYnvCbhVKYzgDcBN9DytPM_yQeI');

const prompt = `Professional editorial infographic with a dark, premium aesthetic. Style: data visualization meets Bloomberg editorial design. Clean, authoritative, executive-grade.

Background: Deep charcoal (#0A0A0A) with a very subtle grid pattern at 3% opacity.

Layout: Three massive data columns dominate the composition, arranged left to right across the full width of the image:

COLUMN 1 (LEFT THIRD): A tall vertical bar chart element in bold YouTube red (#FF0000) reaching near the top of the frame. At the base, small gray (#666666) bars represent the global newspaper industry. The red bar towers over them dramatically — at least 4x taller. Above the red bar in large white (#FFFFFF) Bebas Neue Bold text: "$36.1B". Below the bar in small gray (#999999) text: "AD REVENUE". Below the gray bars in tiny text: "vs all newspapers combined".

COLUMN 2 (CENTER THIRD): A circular donut chart or large number display. The hero number "$70B" in massive gold (#FFD700) text dominates this section. Below it in white text: "PAID TO CREATORS". Below that in smaller gray text: "3 years, 3M+ channels".

COLUMN 3 (RIGHT THIRD): An icon of a television screen outline in teal (#00CED1) with "1B" in white inside it. Below: "HOURS/DAY" in white text. Below that: "ON TV SCREENS" in small gray text. Below that in even smaller text: "Most-watched streaming service — Nielsen 2024".

At the very bottom of the image, a thin horizontal line in gold (#FFD700) at 1px spans the width. Below it, centered small text in white: "YOUTUBE 2024 — THE YEAR IT STOPPED BEING A PLATFORM".

Barely visible watermark "HYPE ON MEDIA" very faint, bottom-right corner.

The overall feel: like a Bloomberg terminal visualization redesigned by Pentagram. Dark, clean, massive numbers, minimal decoration. The data IS the design. No illustrations, no photos, no gradients, no 3D effects. Pure data typography on dark background.

Typography: All numbers in bold condensed sans-serif (like Bebas Neue or Impact). Labels in clean sans-serif. The size hierarchy is dramatic — the dollar figures are at least 5x larger than the labels.

Width should be about 1.8 times the height, NOT ultra-wide. Landscape orientation, wider than tall.

NOT colorful — NOT playful — NOT corporate blue — NOT PowerPoint — NOT clip art — NOT rounded corners on everything — NOT gradient backgrounds.`;

const models = [
  'gemini-3-pro-image-preview',
  'gemini-3.1-flash-image-preview',
  'gemini-2.5-flash-image'
];

async function generate() {
  for (const modelName of models) {
    try {
      console.log('Trying model:', modelName);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
      });

      const result = await model.generateContent(prompt);
      const parts = result.response.candidates[0].content.parts;
      const imagePart = parts.find(p => p.inlineData);

      if (imagePart) {
        const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
        fs.writeFileSync(__dirname + '/../content/blog/youtube-2024-year-review-numbers/cover-original.jpg', buffer);
        console.log('Image saved! Size:', buffer.length, 'bytes');
        console.log('Model used:', modelName);
        return;
      } else {
        console.log('No image from', modelName);
        const t = parts.find(p => p.text);
        if (t) console.log('Text:', t.text.substring(0, 200));
      }
    } catch (err) {
      console.log('Error with', modelName, ':', (err.message || '').substring(0, 300));
      if (modelName === models[models.length - 1]) throw err;
      console.log('Waiting 15s...');
      await new Promise(r => setTimeout(r, 15000));
    }
  }
}

generate().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
