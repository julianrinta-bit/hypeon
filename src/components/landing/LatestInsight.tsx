import Link from 'next/link';
import Image from 'next/image';
import { posts } from '#velite';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

/* Tag accent colors matching the .dc.html §55 design */
const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  youtube:    { bg: 'rgba(245,158,11,.15)',  color: '#F59E0B' },
  b2b:        { bg: 'rgba(255,255,255,.06)', color: 'rgba(240,240,236,.45)' },
  strategy:   { bg: 'rgba(255,255,255,.06)', color: 'rgba(240,240,236,.45)' },
  production: { bg: 'rgba(129,140,248,.15)', color: '#818CF8' },
  ai:         { bg: 'rgba(255,255,255,.06)', color: 'rgba(240,240,236,.45)' },
  translation:{ bg: 'rgba(45,212,191,.15)',  color: '#2DD4BF' },
  growth:     { bg: 'rgba(255,255,255,.06)', color: 'rgba(240,240,236,.45)' },
  seo:        { bg: 'rgba(200,255,46,.12)',   color: '#c8ff2e' },
  thumbnails: { bg: 'rgba(200,255,46,.12)',   color: '#c8ff2e' },
};

function tagStyle(tag: string) {
  const key = tag.toLowerCase();
  return TAG_COLORS[key] ?? { bg: 'rgba(255,255,255,.06)', color: 'rgba(240,240,236,.45)' };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function LatestInsight() {
  const published = posts
    .filter((p) => !p.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  if (published.length === 0) return null;

  return (
    <section className="blog-section" id="blog">
      <div className="blog-section-inner">
        {/* Header row */}
        <div className="blog-section-header">
          <div>
            <p className="blog-section-eyebrow">Latest insights</p>
            <h2 className="blog-section-title">
              Insights &amp; strategies<br />from YouTube experts.
            </h2>
          </div>
          <Link href="/blog" className="blog-section-see-all">
            See all →
          </Link>
        </div>

        {/* 3-col grid */}
        <div className="blog-grid-v2">
          {published.map((post, i) => (
            <RevealOnScroll key={post.slug}>
              <Link href={post.permalink} className="blog-card-v2">
                {/* Thumbnail */}
                <div className="blog-card-v2__thumb">
                  <Image
                    src={post.cover.src}
                    alt={post.title}
                    width={post.cover.width}
                    height={post.cover.height}
                    className="blog-card-v2__img"
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                  {/* YouTube logo badge */}
                  <div className="blog-card-v2__yt-badge" aria-hidden="true">
                    <svg width="26" height="18" viewBox="0 0 26 18" fill="none">
                      <rect width="26" height="18" rx="3" fill="#FF0000" />
                      <path d="M10 5L17.5 9L10 13V5Z" fill="white" />
                    </svg>
                  </div>
                </div>

                {/* Body */}
                <div className="blog-card-v2__body">
                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="blog-card-v2__tags">
                      {post.tags.slice(0, 3).map((tag) => {
                        const s = tagStyle(tag);
                        return (
                          <span
                            key={tag}
                            className="blog-card-v2__tag"
                            style={{ background: s.bg, color: s.color }}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <h3 className="blog-card-v2__title">{post.title}</h3>
                  <p className="blog-card-v2__excerpt">{post.description}</p>
                  <p className="blog-card-v2__meta">
                    {formatDate(post.date)} · {post.metadata.readingTime} min read
                  </p>
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
