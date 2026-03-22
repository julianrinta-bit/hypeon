'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  cover: { src: string; width: number; height: number };
  coverAlt: string;
  tags: string[];
  views: number;
  metadata: { readingTime: number };
  permalink: string;
}

const POSTS_PER_PAGE = 12;

export default function BlogGrid({ posts }: { posts: Post[] }) {
  const [visible, setVisible] = useState(POSTS_PER_PAGE);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [posts, search]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <>
      <div className="blog-search-wrap">
        <div className="blog-search-field">
          <svg
            className="blog-search-icon"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
          <input
            type="search"
            placeholder="Search articles..."
            value={search}
            onChange={e => { setSearch(e.target.value); setVisible(POSTS_PER_PAGE); }}
            className="blog-search"
            aria-label="Search blog articles"
          />
          {search && (
            <button
              className="blog-search-clear"
              onClick={() => { setSearch(''); setVisible(POSTS_PER_PAGE); }}
              aria-label="Clear search"
              type="button"
            >
              ESC
            </button>
          )}
        </div>
      </div>

      <section className="blog-grid">
        {shown.map(post => (
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

      {hasMore && (
        <div className="blog-load-more-wrap">
          <button
            onClick={() => setVisible(v => v + POSTS_PER_PAGE)}
            className="blog-load-more"
          >
            Load more articles ({filtered.length - visible} remaining)
          </button>
        </div>
      )}

      {filtered.length === 0 && search && (
        <p className="blog-no-results">No articles match &ldquo;{search}&rdquo;</p>
      )}
    </>
  );
}
