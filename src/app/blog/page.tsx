import { posts } from '#velite'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — Hype On Media',
  description: 'YouTube growth strategies, case studies, and industry insights from Hype On Media.',
  alternates: { canonical: '/blog' },
}

export default function BlogPage() {
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
                </div>
                <h2>{post.title}</h2>
                <p>{post.description}</p>
              </div>
            </Link>
          </article>
        ))}
      </section>
    </main>
  )
}
