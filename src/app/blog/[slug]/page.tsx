import { posts } from '#velite'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { MDXContent } from '@/components/blog/MDXContent'
import BlogJsonLd from '@/components/blog/BlogJsonLd'
import InlineCTA from '@/components/blog/InlineCTA'

// SSG: pre-render all slugs at build time
export function generateStaticParams() {
  return posts.map(post => ({ slug: post.slug }))
}

// Dynamic metadata per article
// Next.js 16: params is a Promise — must await
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = posts.find(p => p.slug === slug)
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

// Next.js 16: params is a Promise — must await
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = posts.find(p => p.slug === slug)
  if (!post) notFound()

  return (
    <main id="main-content">
      <article className="blog-article">
        <BlogJsonLd post={post} />
        <header className="blog-article__header">
          <div className="blog-article__meta">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </time>
            <span>{post.metadata.readingTime} min read</span>
          </div>
          <h1>{post.title}</h1>
          <p className="blog-article__description">{post.description}</p>
        </header>

        <Image
          src={post.cover.src}
          alt={post.coverAlt}
          width={post.cover.width}
          height={post.cover.height}
          className="blog-article__cover"
          priority
        />

        <div className="blog-article__body prose">
          <MDXContent code={post.code} components={{ InlineCTA }} />
        </div>
      </article>
    </main>
  )
}
