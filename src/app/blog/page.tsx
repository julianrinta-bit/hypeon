import { posts } from '#velite'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Insights & Playbooks — Hype On Media',
  description: 'YouTube growth strategies, case studies, and industry insights from Hype On Media.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Insights & Playbooks — Hype On Media',
    description: 'YouTube growth strategies, case studies, and industry insights.',
    type: 'website',
    url: 'https://hypeon.media/blog',
  },
}

export default function BlogPage() {
  const sortedPosts = posts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const [featured, ...rest] = sortedPosts

  return (
    <main id="main-content">
      <section className="blog-hero">
        <Link href="/" className="blog-back">&larr; Back to home</Link>
        <h1>Insights &amp; Playbooks</h1>
        <p>Strategies, frameworks, and deep dives on YouTube growth</p>
      </section>

      {/* Featured post */}
      {featured && (
        <section className="blog-featured-wrap">
          <Link href={featured.permalink} className="blog-featured">
            <Image
              src={featured.cover.src}
              alt={featured.coverAlt}
              width={featured.cover.width}
              height={featured.cover.height}
              className="blog-featured__cover"
            />
            <div className="blog-featured__body">
              <div className="blog-card__meta">
                <time dateTime={featured.date}>
                  {new Date(featured.date).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </time>
                <span>{featured.metadata.readingTime} min read</span>
                <span>{featured.views.toLocaleString()} views</span>
              </div>
              <h2>{featured.title}</h2>
              <p>{featured.description}</p>
              {featured.tags.length > 0 && (
                <div className="blog-card__tags">
                  {featured.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="blog-card__tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        </section>
      )}

      {/* Remaining posts */}
      <section className="blog-grid">
        {rest.map(post => (
          <article key={post.slug} className="blog-card">
            <Link href={post.permalink}>
              <Image
                src={post.cover.src}
                alt={post.coverAlt}
                width={post.cover.width}
                height={post.cover.height}
                className="blog-card__cover"
              />
              <div className="blog-card__body">
                <div className="blog-card__meta">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </time>
                  <span>{post.metadata.readingTime} min read</span>
                  <span>{post.views.toLocaleString()} views</span>
                </div>
                <h2>{post.title}</h2>
                <p>{post.description}</p>
                {post.tags.length > 0 && (
                  <div className="blog-card__tags">
                    {post.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="blog-card__tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          </article>
        ))}
      </section>
    </main>
  )
}
