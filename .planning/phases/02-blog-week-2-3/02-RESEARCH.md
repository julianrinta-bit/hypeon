# Phase 2 Research: Blog System

## 1. Velite Setup

### 1.1 Installation

```bash
npm install velite -D
npm install rehype-pretty-code rehype-slug rehype-autolink-headings -D
```

Velite is ESM-only. The project already has `"type": "module"` in package.json — no change needed.

### 1.2 velite.config.ts

Create at project root:

```ts
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { defineCollection, defineConfig, s } from 'velite'

const posts = defineCollection({
  name: 'Post',
  pattern: 'blog/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(120),
      slug: s.slug('blog'),
      description: s.string().max(300),
      date: s.isodate(),
      updated: s.isodate().optional(),
      cover: s.image(),
      coverAlt: s.string(),
      tags: s.array(s.string()).default([]),
      draft: s.boolean().default(false),
      metadata: s.metadata(),  // wordCount, readingTime
      excerpt: s.excerpt(),
      toc: s.toc(),
      code: s.mdx(),           // compiled MDX function body
    })
    .transform(data => ({
      ...data,
      permalink: `/blog/${data.slug}`,
    })),
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { posts },
  markdown: {
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      rehypePrettyCode,
    ],
  },
  prepare: ({ posts }) => {
    // Filter drafts in production
    const published = posts.filter(
      p => process.env.NODE_ENV !== 'production' || !p.draft
    )
    posts.length = 0
    posts.push(...published)
  },
})
```

### 1.3 Content directory structure

```
content/
└── blog/
    ├── youtube-seo-guide-2026/
    │   ├── index.mdx
    │   └── cover.jpg
    ├── thumbnail-click-through-rate/
    │   ├── index.mdx
    │   └── cover.jpg
    └── multilingual-youtube-strategy/
        ├── index.mdx
        └── cover.jpg
```

Each article gets its own directory so images are co-located with the MDX file. Velite's `s.image()` resolves relative paths from the content file.

### 1.4 Frontmatter example

```mdx
---
title: "YouTube SEO in 2026: The Complete Playbook"
slug: youtube-seo-guide-2026
description: "How top channels rank #1 — keyword research, metadata, retention signals, and the algorithm shifts you need to know."
date: 2026-03-25
cover: ./cover.jpg
coverAlt: "YouTube search results showing optimized video metadata"
tags: [youtube, seo, growth]
draft: false
---

Article body in MDX...
```

### 1.5 Next.js integration (next.config.ts)

The project uses `next dev --turbo` (Turbopack). Use the top-level await pattern — the webpack plugin approach does not work with Turbopack.

```ts
import type { NextConfig } from 'next'

// Velite build integration (Turbopack-compatible)
const isDev = process.argv.indexOf('dev') !== -1
const isBuild = process.argv.indexOf('build') !== -1
if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
  process.env.VELITE_STARTED = '1'
  import('velite').then(m => m.build({ watch: isDev, clean: !isDev }))
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
}

export default nextConfig
```

### 1.6 TypeScript path alias

Add to `tsconfig.json` paths:

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "#velite": ["./.velite"]
  }
}
```

Then import collections as:

```ts
import { posts } from '#velite'
```

### 1.7 .gitignore

Add `.velite/` to `.gitignore` — it is build output, regenerated every build.

### 1.8 Build script update

No changes needed. Velite builds automatically via the `next.config.ts` integration above — it runs before Next.js compilation in both `dev` and `build`.

---

## 2. Blog Page Patterns (Next.js 16 App Router)

### 2.1 File structure

```
src/app/blog/
├── page.tsx              # Blog index (SSG)
└── [slug]/
    └── page.tsx          # Article page (SSG)
```

### 2.2 Blog index — `src/app/blog/page.tsx`

```tsx
import { posts } from '#velite'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — Hype On Media',
  description: 'YouTube growth strategies, case studies, and industry insights from Hype On Media.',
  alternates: { canonical: '/blog' },
}

export default function BlogPage() {
  // Sort by date descending, filter out drafts (already done by velite prepare)
  const sortedPosts = posts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <main id="main-content">
      <section className="blog-hero">
        <h1>Blog</h1>
        <p>YouTube growth strategies and insights</p>
      </section>
      <section className="blog-grid">
        {sortedPosts.map(post => (
          <article key={post.slug} className="blog-card">
            <a href={post.permalink}>
              <img src={post.cover.src} alt={post.coverAlt} />
              <h2>{post.title}</h2>
              <p>{post.description}</p>
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </time>
              <span>{post.metadata.readingTime} min read</span>
            </a>
          </article>
        ))}
      </section>
    </main>
  )
}
```

### 2.3 Article page — `src/app/blog/[slug]/page.tsx`

```tsx
import { posts } from '#velite'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MDXContent } from '@/components/blog/MDXContent'
import BlogJsonLd from '@/components/blog/BlogJsonLd'
import InlineCTA from '@/components/blog/InlineCTA'

// SSG: pre-render all slugs at build time
export function generateStaticParams() {
  return posts.map(post => ({ slug: post.slug }))
}

// Dynamic metadata per article
export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const post = posts.find(p => p.slug === params.slug)
  if (!post) return {}

  return {
    title: `${post.title} — Hype On Media`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      url: `https://hypeon.media${post.permalink}`,
      images: [{ url: post.cover.src }],
    },
    twitter: { card: 'summary_large_image' },
    alternates: { canonical: post.permalink },
  }
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = posts.find(p => p.slug === params.slug)
  if (!post) notFound()

  return (
    <main id="main-content">
      <article className="blog-article">
        <BlogJsonLd post={post} />
        <header className="blog-article__header">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </time>
          <span>{post.metadata.readingTime} min read</span>
          <h1>{post.title}</h1>
          <p className="blog-article__description">{post.description}</p>
        </header>

        <img
          src={post.cover.src}
          alt={post.coverAlt}
          width={post.cover.width}
          height={post.cover.height}
          className="blog-article__cover"
        />

        <div className="blog-article__body prose">
          <MDXContent code={post.code} components={{ InlineCTA }} />
        </div>
      </article>
    </main>
  )
}
```

### 2.4 MDXContent component — `src/components/blog/MDXContent.tsx`

```tsx
'use client'

import * as runtime from 'react/jsx-runtime'
import type { ComponentType } from 'react'

const useMDXComponent = (code: string) => {
  const fn = new Function(code)
  return fn({ ...runtime }).default
}

interface MDXProps {
  code: string
  components?: Record<string, ComponentType>
}

export const MDXContent = ({ code, components }: MDXProps) => {
  const Component = useMDXComponent(code)
  return <Component components={components} />
}
```

Note: `MDXContent` must be a client component because `new Function()` requires client-side execution. The page itself remains a Server Component — only this rendering piece is client.

### 2.5 InlineCTA component — `src/components/blog/InlineCTA.tsx`

Used inside MDX articles to link readers to the audit form:

```tsx
export default function InlineCTA() {
  return (
    <aside className="blog-cta" role="complementary">
      <h3>Ready to grow your channel?</h3>
      <p>Get a free audit of your YouTube strategy.</p>
      <a href="/#audit" className="blog-cta__button">
        Get Your Free Audit
      </a>
    </aside>
  )
}
```

Usage in MDX: `<InlineCTA />` — no import needed, passed via the `components` prop.

---

## 3. JSON-LD BlogPosting Schema

### 3.1 Component — `src/components/blog/BlogJsonLd.tsx`

```tsx
interface Post {
  title: string
  description: string
  date: string
  updated?: string
  permalink: string
  cover: { src: string; width: number; height: number }
}

export default function BlogJsonLd({ post }: { post: Post }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    image: {
      '@type': 'ImageObject',
      url: `https://hypeon.media${post.cover.src}`,
      width: post.cover.width,
      height: post.cover.height,
    },
    author: {
      '@type': 'Organization',
      name: 'Hype On Media',
      url: 'https://hypeon.media',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Hype On Media',
      url: 'https://hypeon.media',
      logo: {
        '@type': 'ImageObject',
        url: 'https://hypeon.media/logo.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://hypeon.media${post.permalink}`,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

Important: The brand is faceless — `author` is the Organization, not a Person. No individual names or photos.

---

## 4. SEO Infrastructure

### 4.1 Existing assets from Phase 1

| Asset | Status | Location |
|-------|--------|----------|
| `robots.txt` | EXISTS | `public/robots.txt` — allows all crawlers, references sitemap |
| `sitemap.ts` | EXISTS (needs update) | `src/app/sitemap.ts` — currently only lists `/` |
| `opengraph-image.tsx` | EXISTS | `src/app/opengraph-image.tsx` — site-level OG image |

### 4.2 Updated sitemap.ts

Must add blog post URLs dynamically:

```ts
import type { MetadataRoute } from 'next'
import { posts } from '#velite'

export default function sitemap(): MetadataRoute.Sitemap {
  const blogEntries: MetadataRoute.Sitemap = posts.map(post => ({
    url: `https://hypeon.media${post.permalink}`,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    {
      url: 'https://hypeon.media',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://hypeon.media/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...blogEntries,
  ]
}
```

### 4.3 robots.txt

Already correct — no changes needed:

```
User-agent: *
Allow: /
Sitemap: https://hypeon.media/sitemap.xml
```

### 4.4 Per-article canonical URL

Handled via `generateMetadata` in the `[slug]/page.tsx`:

```ts
alternates: { canonical: post.permalink }
```

Next.js resolves this against `metadataBase` (already set to `https://hypeon.media` in root layout).

### 4.5 Per-article OG image

Option A (simple): Use the article's cover image in `openGraph.images`.
Option B (advanced): Create `src/app/blog/[slug]/opengraph-image.tsx` using Next.js ImageResponse to generate branded OG images with the article title overlaid on a template. This is a nice-to-have for later.

Phase 2 will use Option A. The cover image is already set in `generateMetadata`.

---

## 5. SEO Checklist

- [x] `robots.txt` allows indexation (exists from Phase 1)
- [ ] `sitemap.ts` includes blog URLs (update existing file)
- [ ] `generateMetadata` on every blog page (title, description, OG, canonical)
- [ ] JSON-LD BlogPosting on every article page
- [ ] `<h1>` is the article title (one per page)
- [ ] Cover images have descriptive `alt` text (from `coverAlt` frontmatter)
- [ ] Internal links from blog articles back to the landing page audit form
- [ ] Blog index has its own metadata and canonical
- [ ] All blog pages are server-rendered / statically generated (SSG via `generateStaticParams`)
- [ ] Headings have anchor links (rehype-slug + rehype-autolink-headings)

---

## 6. Gotchas and Version-Specific Issues

### Velite 0.2.x

1. **ESM-only**: Velite requires `"type": "module"` in package.json. Already present in this project.

2. **Turbopack compatibility**: The webpack plugin approach (`VeliteWebpackPlugin`) does NOT work with Turbopack. Must use the top-level `import('velite')` pattern in `next.config.ts`. This project uses `--turbo` in the dev script, so this is critical.

3. **`.velite/` output directory**: Must be added to `.gitignore`. Generated at build time. Contains typed JSON data and TypeScript declarations.

4. **Image processing**: `s.image()` copies images to `public/static/` with content hashes. The returned object includes `src`, `width`, `height`, and `blurDataURL` — compatible with Next.js `<Image>` component.

5. **Pre-1.0 risk**: Velite is 0.2.x. Low blast radius because it runs at build time only and outputs static JSON. If it breaks, replacing it with manual `fs` + `compileMDX` is a few hours of work (as noted in the stack research).

### Next.js 16.2

6. **`params` is a Promise in Next.js 15+**: In Next.js 15+, `params` in dynamic routes is a Promise. The patterns above may need `await params` depending on the exact Next.js 16.2 behavior. Check the actual runtime — if params is a Promise, the page component signature becomes:

```tsx
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  // ...
}
```

Same for `generateMetadata`:

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  // ...
}
```

This is the most likely gotcha. Test during implementation.

7. **`generateStaticParams` return type**: Returns plain objects (not Promises). No change from Next.js 14/15.

### MDX rendering

8. **`new Function()` and CSP**: The `MDXContent` component uses `new Function(code)` which is equivalent to `eval`. If you add Content Security Policy headers, you must allow `'unsafe-eval'` for the blog pages, or switch to `s.markdown()` (returns HTML string) rendered via `dangerouslySetInnerHTML` instead. For a blog with no user-generated content, this is acceptable.

9. **`MDXContent` must be `'use client'`**: The `new Function()` call cannot run in a Server Component. Mark `MDXContent` with the `'use client'` directive.

### Blog layout

10. **Root layout has Nav + Footer**: The root `layout.tsx` already includes `<Nav />`, `<Footer />`, `<CustomCursor />`, etc. Blog pages inherit these automatically. If the blog needs a different layout (e.g., no sticky mobile CTA, different nav style), create `src/app/blog/layout.tsx` to override specific elements.

---

## 7. Implementation Order

1. Install velite + rehype plugins
2. Create `velite.config.ts`
3. Update `next.config.ts` with velite build integration
4. Add `#velite` path alias to `tsconfig.json`
5. Add `.velite/` to `.gitignore`
6. Create `content/blog/` directory with first article
7. Create `MDXContent` component
8. Create `BlogJsonLd` component
9. Create `InlineCTA` component
10. Create `src/app/blog/page.tsx` (index)
11. Create `src/app/blog/[slug]/page.tsx` (article)
12. Update `src/app/sitemap.ts` to include blog URLs
13. Add blog CSS to `globals.css` (prose styles for article body)
14. Write remaining 2 articles
15. Test build, verify sitemap, validate JSON-LD with Google Rich Results Test
