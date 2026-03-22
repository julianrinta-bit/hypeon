---
name: hypeon-weekly-article
description: >
  Generate this week's blog article end-to-end: research news, write article,
  generate thumbnail, build, deploy. One command, full pipeline.
  Use when: "haz el artículo de esta semana", "weekly article", "write this week's post",
  "nuevo artículo", "publish new article", "what should we write about".
metadata:
  version: 1.0.0
  author: Hype On Media
  domain: content-pipeline
---

# Weekly Article Pipeline

One command. Full pipeline. Julian approves at the end.

## The Pipeline

```
Step 1: Research    → What happened in YouTube/video this week?
Step 2: Decide      → Which topic? What angle? What title?
Step 3: Write       → Full article following hypeon-blog-writer skill
Step 4: Thumbnail   → Board deliberates → NanoBanana generates → canvas overlays
Step 5: Publish     → Build + deploy to production
```

## Step 1: Research This Week's News

Use web search to find YouTube/creative strategy news from the past 7 days:

```
Search queries:
- "YouTube [this week's date range]"
- "YouTube update [current month] [current year]"
- "YouTube creator news this week"
- "video marketing news [current month] [current year]"
- "YouTube algorithm [current month]"
- site:blog.youtube.com (last 7 days)
- site:tubefilter.com (last 7 days)
```

Also check:
- Has anything changed that contradicts existing articles? → Flag for update
- Is there a trending topic on LinkedIn that VPs are discussing? → Timely angle

## Step 2: Decide Topic + Angle

Choose based on:
1. **Newsworthiness** — did something actually happen this week?
2. **Buyer relevance** — would a VP of Marketing care?
3. **Gap in our blog** — do we already cover this?
4. **Empowerment angle** — can we frame it as an outcome the reader achieves?

If no major news this week → write an evergreen piece from the backlog at `content/blog/BACKLOG.md`

### Create brief:
```markdown
TOPIC: [what happened]
TITLE: [outcome formula — reader is the hero, credibility guardrail applied]
SLUG: [url-friendly]
TAGS: [3-5 from existing taxonomy]
TYPE: [news-reaction / how-to / thought-leadership / data-piece]
AVATAR: [VP / Founder / Creative Director / Operator — based on tags]
```

Present the brief to Julian for approval before writing.

## Step 3: Write Article

Follow `.claude/skills/hypeon-blog-writer/SKILL.md` completely:

- Title = outcome the reader achieves (credibility guardrail)
- Authority through knowledge, not self-promotion
- Hype On appears 2-3 times max (as character, not narrator)
- Answer blocks after every H2 (AEO)
- FAQ section at end
- ReadAlso cross-links (2)
- InlineCTA (1, at end)
- NewsletterCTA (1)
- 1500-2500 words
- Buyer language (pipeline > views, $ > %)

### Frontmatter:
```yaml
---
title: "[the title]"
slug: [the slug]
description: "[150-160 chars]"
date: [today's date]
cover: ./cover.jpg
coverAlt: "[descriptive]"
tags: [matching taxonomy]
views: 0
draft: false
---
```

Save to: `content/blog/{slug}/index.mdx`

## Step 4: Generate Thumbnail

**SEQUENTIAL — article must be finished first.**

Follow `.claude/skills/hypeon-infographic-cover/SKILL.md`:

1. **Strategy** — extract hook from finished article, pick avatar, environment, text overlay decision
2. **Congruence check** — title says X, thumb says Y, together they tell the complete story
3. **Generate with NanoBanana** — documentary style, API call to gemini-3.1-flash-image-preview
4. **Post-process** — canvas overlay (text if needed + 85px category band)
5. **Devil's advocate** — scroll test, share test, FOFU test, documentary test
6. **Save** to vault campaign folder first, then to `content/blog/{slug}/cover.jpg`

API key: from `~/.env` → `GOOGLE_AI_API_KEY`

## Step 5: Publish

```bash
cd ~/projects/hypeon-website
npm run build
git add content/blog/{slug}/
git commit -m "content: {slug} — {short description}"
git push origin main
ssh alpha "cd /opt/hypeon-website && git pull && npm run build && pm2 restart hypeon-website"
```

After deploy, update existing articles with ReadAlso pointing to the new one (where thematically relevant).

## Step 6: Update Vault

Update the engagement tracking:
```
CREATIVE AGENCY OS/05_MARKETING/Campaigns/2026-03_Website_Blog/_Index.md
```
Add the new article to the session history.

## Approval Points

Julian approves at TWO points:
1. **After Step 2** — the topic brief (before writing)
2. **After Step 5** — the live result (after deploy)

Everything else is autonomous.

## Time Estimate

- Steps 1-2: ~2 minutes (research + brief)
- Step 3: ~3 minutes (writing)
- Step 4: ~2 minutes (thumbnail generation)
- Step 5: ~2 minutes (build + deploy)
- **Total: ~10 minutes** from "haz el artículo" to live

## Dependencies

- `.claude/skills/hypeon-blog-writer/SKILL.md` — article writing rules
- `.claude/skills/hypeon-infographic-cover/SKILL.md` — thumbnail generation
- `~/.env` → `GOOGLE_AI_API_KEY` — NanoBanana API
- `content/blog/BACKLOG.md` — fallback topics
- Server: `alpha` (167.172.246.198) — deploy target
