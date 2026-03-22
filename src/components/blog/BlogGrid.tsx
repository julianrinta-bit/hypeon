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
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [posts, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const shown = filtered.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* Build page number buttons: 1 2 3 ... last */
  const pageNumbers: (number | 'ellipsis')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pageNumbers.push(i);
    } else if (
      pageNumbers[pageNumbers.length - 1] !== 'ellipsis'
    ) {
      pageNumbers.push('ellipsis');
    }
  }

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
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="blog-search"
            aria-label="Search blog articles"
          />
          {search && (
            <button
              className="blog-search-clear"
              onClick={() => { setSearch(''); setPage(1); }}
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

      {totalPages > 1 && (
        <nav className="blog-pagination" aria-label="Blog pagination">
          <button
            className="blog-pagination__btn"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            &larr; Prev
          </button>

          {pageNumbers.map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`ellipsis-${i}`} className="blog-pagination__btn" style={{ border: 'none', cursor: 'default' }}>
                &hellip;
              </span>
            ) : (
              <button
                key={p}
                className={`blog-pagination__btn${p === currentPage ? ' blog-pagination__btn--active' : ''}`}
                onClick={() => goToPage(p)}
                aria-label={`Page ${p}`}
                aria-current={p === currentPage ? 'page' : undefined}
              >
                {p}
              </button>
            )
          )}

          <button
            className="blog-pagination__btn"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            Next &rarr;
          </button>

          <span className="blog-pagination__info">
            Page {currentPage} of {totalPages}
          </span>
        </nav>
      )}

      {filtered.length === 0 && search && (
        <p className="blog-no-results">No articles match &ldquo;{search}&rdquo;</p>
      )}
    </>
  );
}
