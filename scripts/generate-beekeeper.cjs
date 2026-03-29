const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'AIzaSyAOwsromYnvCbhVKYzgDcBN9DytPM_yQeI');

const MODEL_CASCADE = [
  'gemini-3-pro-image-preview',
  'gemini-3.1-flash-image-preview',
  'gemini-2.5-flash-image',
];

const prompt = `A single beekeeper in a wide morning meadow, shot on Nikon Z8 with 35mm f/2.0 lens, ISO 400, camera at waist height looking slightly up. Landscape orientation, width approximately 1.8 times the height, NOT ultra-wide, NOT cinematic widescreen.

COMPOSITION: The beekeeper stands on the left third of the frame, three-quarter profile facing right. Two-thirds of the image is open meadow and sky to his right. Asymmetrical counterbalance — small vivid figure against vast environment. The upper-right area is open pale morning sky with soft clouds, providing a natural text zone above the distant hive rows.

THE BEEKEEPER: A man in his 50s, weathered and sun-lined face, 3-day silver-flecked stubble. Visible pores on nose and cheeks, slight sunburn pink on the nose bridge, crow's feet at the temples, faint undereye crescents. NOT airbrushed, realistic skin with subsurface scattering. He wears a full-body beekeeping suit in aged off-white (#F0EAD6) coarse cotton twill canvas with yellowing at the cuffs from years of propolis contact, faint golden honey stains near the wrists and thighs. A brass zipper (#B5882B) partially open at the chest reveals a faded sage-green (#7C9070) cotton t-shirt. Sleeves rolled to mid-forearm showing tanned forearms with fine arm hair catching light. His round beekeeper hat veil is pushed back behind his head, white mesh with a straw-colored wide brim (#C9B57E), draping over the back of his neck. Thick elbow-length natural tan leather gauntlets (#C4A76C), well-worn, creased at knuckles, honey residue on the fingertips. Olive-green (#4A5D3A) rubber Wellington boots, mud-splashed at toes and ankles.

EXPRESSION AND BODY LANGUAGE: The calm, unhurried focus of a man who has done this exact same thing a thousand mornings. He looks down at the honey frame with quiet satisfaction — no excitement, no surprise, no performance. Mouth relaxed, lips slightly parted. Eyes soft-focused on the comb. Three-quarter profile, head tilted slightly down toward the frame. Both gloved hands gripping a large wooden bee frame — left hand on the top ear, right hand supporting the bottom bar. Weight on his left foot, right foot slightly back — a relaxed working stance. Shoulders relaxed, slight forward lean.

THE HONEY FRAME: A large wooden bee frame with fully built-out honeycomb — capped cells in golden-amber (#DAA520), some uncapped cells showing dark liquid honey (#8B6914). Thick viscous honey ribbons (#E8A317 bright amber) cascading from the bottom bar of the frame like warm caramel — 4-5 ribbons stretching and thinning as they descend. One central ribbon is the longest, stretching all the way down to his left boot, forming a small golden puddle on the dewy grass. The puddle catches the morning sun as a bright golden mirror (#FFD700 highlights). The honey is THICK, NOT watery — warm caramel viscosity. A few small honeybees visible as dark shapes crawling on the golden comb surface.

THE HIVE: An open wooden hive body beside the beekeeper in weathered pine (#A0845C) with layers of old paint peeling to reveal bare wood. The hive sits on a flat stone base with green moss (#6B8F5A) growing at the edges.

THE MEADOW: Wildflowers distributed naturally — lavender stalks (#9B7DB8) in small clusters, individual red poppies (#CC2936), white chamomile in patches, wild yellow buttercups (#FFD300) scattered. Mixed-height meadow grass with morning dew as tiny bright specular highlights on blades. Grass color gradient: dark green (#2D5A27) in shadows to yellow-green (#8DB600) where sun hits.

30+ WOODEN HIVES: Staggered rows of wooden hives stretching from center-frame to the right, receding into distance. Each hive a slightly different shade of aged wood. Thin wisps of morning ground mist threading between the lower hive rows.

THE COMMERCIAL FARM (far background, 60+ meters away, seen through atmospheric haze): A cluster of 5-6 dark-suited silhouettes standing with crossed arms and pointing gestures, gathered around industrial-scale metal equipment and stacked clean white modern plastic hive boxes whose entrance slots show no bee activity — visibly empty. The silhouettes and equipment are slightly desaturated and blue-shifted from atmospheric perspective. NO facial features — body language and outline only.

LIGHTING: Early morning sun from camera-left at 15 degrees above the horizon, warm 3200K golden directional light casting long shadows across the meadow. The honey GLOWS with warm amber subsurface scattering. Cool blue sky ambient fill on the shadow side of the beekeeper. Warm-cool color temperature split visible across his face. The translucent honey ribbons glow from within where backlit.

SKY: Soft gradient from warm peach (#FFDAB9) at the horizon to pale blue (#B0C4DE) overhead, with two thin cirrus clouds.

CRITICAL COLOR DIRECTIVE: 15 distinct color zones minimum. The honey ribbons (#E8A317) are the MOST SATURATED element. Do NOT wash everything in a single golden tone. The greens, purples, reds, and blues must remain distinct and vivid alongside the warm honey amber.

TEXT OVERLAY: The words "900 subs. $2.4M." in large bold sans-serif font, warm white (#F5F0E6), positioned over the open pale morning sky in the upper-right area of the image, above the distant rows of hives. The text sits against the sky, not over any person. Perfectly straight horizontal text, not tilted, not curved. A very faint, barely visible small watermark reading "HYPE ON MEDIA" in the lower-right corner over the grass.

This is a real photograph. NOT a stock photo. NOT centered. NOT posed. NOT airbrushed. Documentary-style environmental portrait of a craftsman mid-harvest in early morning light. Natural lens vignetting, slight chromatic aberration at frame edges, Kodak Portra 400 color warmth.`;

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
        const outputPath = 'content/blog/b2b-youtube-strategy/cover-beekeeper-v1.' + ext;
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
