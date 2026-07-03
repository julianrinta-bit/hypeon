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

// Find related articles by tag overlap (not random)
function getRelatedPosts(currentPost: typeof posts[0], allPosts: typeof posts, count = 3) {
  const scored = allPosts
    .filter(p => p.slug !== currentPost.slug)
    .map(p => {
      const tagOverlap = p.tags.filter(t => currentPost.tags.includes(t)).length;
      return { post: p, score: tagOverlap };
    })
    .sort((a, b) => {
      // Sort by tag overlap first, then by date (newer first)
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
    });

  return scored.slice(0, count).map(s => s.post);
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
  const prevTitle = prevSlug ? sortedPosts[currentIndex + 1].title : undefined
  const nextTitle = nextSlug ? sortedPosts[currentIndex - 1].title : undefined

  const related = getRelatedPosts(post, posts, 3)

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

        {/* Prev/Next article navigation */}
        {(prevSlug || nextSlug) && (
          <nav className="blog-prevnext" aria-label="Article navigation">
            {prevSlug ? (
              <Link href={`/blog/${prevSlug}`} className="blog-prevnext__link blog-prevnext__link--prev">
                <span className="blog-prevnext__label">&larr; Previous</span>
                <span className="blog-prevnext__title">{prevTitle}</span>
              </Link>
            ) : <div />}
            {nextSlug ? (
              <Link href={`/blog/${nextSlug}`} className="blog-prevnext__link blog-prevnext__link--next">
                <span className="blog-prevnext__label">Next &rarr;</span>
                <span className="blog-prevnext__title">{nextTitle}</span>
              </Link>
            ) : <div />}
          </nav>
        )}

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

        {/* Bottom CTA */}
        <section className="blog-article-cta">
          <p className="blog-article-cta__headline">Want results like these for your channel?</p>
          <p className="blog-article-cta__body">Our team has generated 5B+ organic views. Let us show you what&apos;s possible.</p>
          <a href="/#contact" className="blog-listing-cta__button">Get your free audit</a>
        </section>

        <SwipeNavigation prevSlug={prevSlug} nextSlug={nextSlug} />
      </main>
    </>
  )
}
