'use client';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
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
const SCROLL_KEY = 'blog-grid-scroll';
const PAGE_KEY = 'blog-grid-page';

export default function BlogGrid({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const gridRef = useRef<HTMLElement>(null);

  // Read initial page from URL searchParams, fallback to sessionStorage, fallback to 1
  const getInitialPage = () => {
    const urlPage = searchParams.get('page');
    if (urlPage) {
      const n = parseInt(urlPage, 10);
      if (!isNaN(n) && n >= 1) return n;
    }
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(PAGE_KEY);
      if (stored) {
        const n = parseInt(stored, 10);
        if (!isNaN(n) && n >= 1) return n;
      }
    }
    return 1;
  };

  const [page, setPage] = useState(getInitialPage);
  const [search, setSearch] = useState(() => {
    const urlSearch = searchParams.get('q');
    return urlSearch || '';
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [posts, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const shown = filtered.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  // Sync state to URL (shallow, no full page reload)
  const updateUrl = useCallback((newPage: number, newSearch: string) => {
    const params = new URLSearchParams();
    if (newPage > 1) params.set('page', String(newPage));
    if (newSearch.trim()) params.set('q', newSearch.trim());
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, { scroll: false });
  }, [pathname, router]);

  // Update URL when page or search changes
  useEffect(() => {
    updateUrl(currentPage, search);
  }, [currentPage, search, updateUrl]);

  // Save scroll position before navigating away (to an article)
  useEffect(() => {
    const saveScroll = () => {
      sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
      sessionStorage.setItem(PAGE_KEY, String(currentPage));
    };

    // Save on any click that might navigate away
    const handleClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a');
      if (link && link.href && link.href.includes('/blog/')) {
        saveScroll();
      }
    };

    document.addEventListener('click', handleClick, { capture: true });
    // Also save before unload (browser back/forward)
    window.addEventListener('beforeunload', saveScroll);

    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
      window.removeEventListener('beforeunload', saveScroll);
    };
  }, [currentPage]);

  // Restore scroll position when coming back from an article
  useEffect(() => {
    const savedScroll = sessionStorage.getItem(SCROLL_KEY);
    if (savedScroll) {
      const y = parseInt(savedScroll, 10);
      if (!isNaN(y) && y > 0) {
        // Small delay to let the grid render
        requestAnimationFrame(() => {
          window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
        });
      }
      // Clear after restoring so next fresh visit starts at top
      sessionStorage.removeItem(SCROLL_KEY);
    }
  }, []);

  const goToPage = (p: number) => {
    setPage(p);
    // Scroll to grid top, not page top — keeps hero/featured visible context
    if (gridRef.current) {
      const top = gridRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
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

  // Collect all unique tags for filter chips
  const allTags = useMemo(() => {
    const tagCount = new Map<string, number>();
    posts.forEach(p => p.tags.forEach(t => {
      tagCount.set(t, (tagCount.get(t) || 0) + 1);
    }));
    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [posts]);

  const [activeTag, setActiveTag] = useState<string | null>(() => {
    return searchParams.get('tag') || null;
  });

  const tagFiltered = useMemo(() => {
    if (!activeTag) return filtered;
    return filtered.filter(p => p.tags.includes(activeTag));
  }, [filtered, activeTag]);

  // Recalculate with tag filter
  const tagTotalPages = Math.max(1, Math.ceil(tagFiltered.length / POSTS_PER_PAGE));
  const tagCurrentPage = Math.min(currentPage, tagTotalPages);
  const tagShown = tagFiltered.slice(
    (tagCurrentPage - 1) * POSTS_PER_PAGE,
    tagCurrentPage * POSTS_PER_PAGE
  );

  const handleTagClick = (tag: string) => {
    if (activeTag === tag) {
      setActiveTag(null);
    } else {
      setActiveTag(tag);
    }
    setPage(1);
  };

  // Use tag-filtered values for display
  const displayPages = activeTag ? tagTotalPages : totalPages;
  const displayCurrentPage = activeTag ? tagCurrentPage : currentPage;
  const displayShown = activeTag ? tagShown : shown;

  // Rebuild page numbers for display
  const displayPageNumbers: (number | 'ellipsis')[] = [];
  for (let i = 1; i <= displayPages; i++) {
    if (
      i === 1 ||
      i === displayPages ||
      (i >= displayCurrentPage - 1 && i <= displayCurrentPage + 1)
    ) {
      displayPageNumbers.push(i);
    } else if (
      displayPageNumbers[displayPageNumbers.length - 1] !== 'ellipsis'
    ) {
      displayPageNumbers.push('ellipsis');
    }
  }

  return (
    <>
      {/* Search + Tag filters */}
      <div className="blog-filters">
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
              onChange={e => handleSearch(e.target.value)}
              className="blog-search"
              aria-label="Search blog articles"
            />
            {search && (
              <button
                className="blog-search-clear"
                onClick={() => handleSearch('')}
                aria-label="Clear search"
                type="button"
              >
                ESC
              </button>
            )}
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="blog-tags-filter" role="group" aria-label="Filter by topic">
            {allTags.map(tag => (
              <button
                key={tag}
                className={`blog-tag-chip${activeTag === tag ? ' blog-tag-chip--active' : ''}`}
                onClick={() => handleTagClick(tag)}
                aria-pressed={activeTag === tag}
              >
                {tag}
              </button>
            ))}
            {activeTag && (
              <button
                className="blog-tag-chip blog-tag-chip--clear"
                onClick={() => { setActiveTag(null); setPage(1); }}
                aria-label="Clear filter"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Results count */}
        {(search || activeTag) && (
          <p className="blog-results-count">
            {(activeTag ? tagFiltered : filtered).length} article{(activeTag ? tagFiltered : filtered).length !== 1 ? 's' : ''} found
            {search && <> for &ldquo;{search}&rdquo;</>}
            {activeTag && <> in <strong>{activeTag}</strong></>}
          </p>
        )}
      </div>

      <section className="blog-grid" ref={gridRef} id="blog-grid">
        {displayShown.map(post => (
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

      {displayPages > 1 && (
        <nav className="blog-pagination" aria-label="Blog pagination">
          <button
            className="blog-pagination__btn"
            onClick={() => goToPage(displayCurrentPage - 1)}
            disabled={displayCurrentPage === 1}
            aria-label="Previous page"
          >
            &larr; Prev
          </button>

          {displayPageNumbers.map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`ellipsis-${i}`} className="blog-pagination__ellipsis">
                &hellip;
              </span>
            ) : (
              <button
                key={p}
                className={`blog-pagination__btn${p === displayCurrentPage ? ' blog-pagination__btn--active' : ''}`}
                onClick={() => goToPage(p)}
                aria-label={`Page ${p}`}
                aria-current={p === displayCurrentPage ? 'page' : undefined}
              >
                {p}
              </button>
            )
          )}

          <button
            className="blog-pagination__btn"
            onClick={() => goToPage(displayCurrentPage + 1)}
            disabled={displayCurrentPage === displayPages}
            aria-label="Next page"
          >
            Next &rarr;
          </button>

          <span className="blog-pagination__info">
            Page {displayCurrentPage} of {displayPages}
          </span>
        </nav>
      )}

      {(activeTag ? tagFiltered : filtered).length === 0 && (search || activeTag) && (
        <p className="blog-no-results">
          No articles match your filters.
          <button
            className="blog-no-results__reset"
            onClick={() => { setSearch(''); setActiveTag(null); setPage(1); }}
          >
            Reset all filters
          </button>
        </p>
      )}

      {/* Blog listing CTA */}
      <section className="blog-listing-cta">
        <div className="blog-listing-cta__inner">
          <p className="blog-listing-cta__label">Ready to grow?</p>
          <h2 className="blog-listing-cta__headline">
            Stop reading about YouTube growth.<br />Start experiencing it.
          </h2>
          <p className="blog-listing-cta__body">
            Get a free channel audit and see exactly what&apos;s holding your YouTube back.
          </p>
          <a href="/#contact" className="blog-listing-cta__button">
            Get your free audit
          </a>
        </div>
      </section>
    </>
  );
}
