import { posts } from '#velite'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { MDXContent } from '@/components/blog/MDXContent'
import BlogJsonLd from '@/components/blog/BlogJsonLd'
import TableOfContents from '@/components/blog/TableOfContents'
import ReadingProgress from '@/components/blog/ReadingProgress'
import ShareButtons from '@/components/blog/ShareButtons'
import SwipeNavigation from '@/components/blog/SwipeNavigation'

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

  const sortedPosts = posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const currentIndex = sortedPosts.findIndex(p => p.slug === post.slug)
  const prevSlug = currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1].slug : undefined
  const nextSlug = currentIndex > 0 ? sortedPosts[currentIndex - 1].slug : undefined

  const related = posts
    .filter(p => p.slug !== post.slug)
    .slice(0, 2)

  return (
    <>
      <ReadingProgress />
      <main id="main-content">
        <article className="blog-article">
          <BlogJsonLd post={post} />

          <Link href="/blog" className="blog-back">&larr; All articles</Link>

          <header className="blog-article__header">
            <div className="blog-article__meta">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </time>
              <span>{post.metadata.readingTime} min read</span>
              <span>{post.views.toLocaleString()} views</span>
              <span>Hype On Media</span>
            </div>
            <h1>{post.title}</h1>
            <p className="blog-article__description">{post.description}</p>
            {post.tags && post.tags.length > 0 && (
              <div className="blog-card__tags">
                {post.tags.map(tag => (
                  <span key={tag} className="blog-card__tag">{tag}</span>
                ))}
              </div>
            )}
            <ShareButtons title={post.title} url={post.permalink} />
          </header>

          <Image
            src={post.cover.src}
            alt={post.coverAlt}
            width={post.cover.width}
            height={post.cover.height}
            className="blog-article__cover"
            priority
          />

          <div className="blog-article__layout">
            <div className="blog-article__body prose">
              <MDXContent code={post.code} />
            </div>
            <aside className="blog-article__sidebar">
              <TableOfContents toc={post.toc} />
            </aside>
          </div>
        </article>

        {related.length > 0 && (
          <section className="blog-related">
            <p className="blog-related__title">You might also like</p>
            <div className="blog-related__grid">
              {related.map(r => (
                <Link key={r.slug} href={r.permalink} className="blog-related__card">
                  <Image
                    src={r.cover.src}
                    alt={r.coverAlt}
                    width={r.cover.width}
                    height={r.cover.height}
                    className="blog-related__image"
                  />
                  <div className="blog-related__info">
                    <h3 className="blog-related__card-title">{r.title}</h3>
                    <span className="blog-related__reading-time">{r.metadata.readingTime} min read</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
        <SwipeNavigation prevSlug={prevSlug} nextSlug={nextSlug} />
      </main>
    </>
  )
}
