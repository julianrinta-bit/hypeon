'use client';
import { useState, useEffect } from 'react';

interface TocEntry {
  title: string;
  url: string;
  items: TocEntry[];
}

interface FlatItem {
  title: string;
  url: string;
  depth: number;
}

function flatten(entries: TocEntry[], depth = 2): FlatItem[] {
  return entries.flatMap((e) => [
    { title: e.title, url: e.url, depth },
    ...flatten(e.items, depth + 1),
  ]);
}

export default function TableOfContents({ toc }: { toc: TocEntry[] }) {
  const [activeId, setActiveId] = useState('');
  const items = flatten(toc);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    const headings = document.querySelectorAll('.prose h2, .prose h3');
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <nav className="toc" aria-label="Table of contents">
      <p className="toc__title">On this page</p>
      <ul className="toc__list">
        {items.map((item) => (
          <li key={item.url} className={`toc__item toc__item--${item.depth}`}>
            <a
              href={item.url}
              className={`toc__link${activeId === item.url.slice(1) ? ' toc__link--active' : ''}`}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
