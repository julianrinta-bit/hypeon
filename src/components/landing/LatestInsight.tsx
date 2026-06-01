import Link from 'next/link';
import Image from 'next/image';
import { posts } from '#velite';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

export default function LatestInsight() {
  const published = posts
    .filter(p => !p.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latest = published[0];
  if (!latest) return null;

  const dateFormatted = new Date(latest.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <section className="latest-insight section" id="insight">
      <div className="container">
        <RevealOnScroll>
          <p className="section-number"><span>&mdash;</span> Latest Insight</p>
        </RevealOnScroll>
        <RevealOnScroll>
          <Link href={latest.permalink} className="latest-insight__card">
            <div className="latest-insight__cover-wrap">
              <Image
                src={latest.cover.src}
                alt={latest.coverAlt}
                width={latest.cover.width}
                height={latest.cover.height}
                className="latest-insight__cover"
              />
            </div>
            <div className="latest-insight__body">
              <div className="latest-insight__meta">
                <time dateTime={latest.date}>{dateFormatted}</time>
                <span>{latest.metadata.readingTime} min read</span>
              </div>
              <h3 className="latest-insight__title">{latest.title}</h3>
              <p className="latest-insight__desc">{latest.description}</p>
              {latest.tags.length > 0 && (
                <div className="latest-insight__tags">
                  {latest.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="blog-card__tag">{tag}</span>
                  ))}
                </div>
              )}
              <span className="latest-insight__link">
                Read article <span aria-hidden="true">&rarr;</span>
              </span>
            </div>
          </Link>
        </RevealOnScroll>
      </div>
    </section>
  );
}
