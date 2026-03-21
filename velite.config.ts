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
      views: s.number().default(0),
      draft: s.boolean().default(false),
      metadata: s.metadata(),
      excerpt: s.excerpt(),
      toc: s.toc(),
      code: s.mdx(),
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
    const published = posts.filter(
      p => process.env.NODE_ENV !== 'production' || !p.draft
    )
    posts.length = 0
    posts.push(...published)
  },
})
