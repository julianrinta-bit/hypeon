interface Post {
  title: string
  description: string
  date: string
  updated?: string
  permalink: string
  cover: { src: string; width: number; height: number }
}

export default function BlogJsonLd({ post }: { post: Post }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    image: {
      '@type': 'ImageObject',
      url: `https://hypeon.media${post.cover.src}`,
      width: post.cover.width,
      height: post.cover.height,
    },
    author: {
      '@type': 'Organization',
      name: 'Hype On Media',
      url: 'https://hypeon.media',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Hype On Media',
      url: 'https://hypeon.media',
      logo: {
        '@type': 'ImageObject',
        url: 'https://hypeon.media/favicon.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://hypeon.media${post.permalink}`,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
