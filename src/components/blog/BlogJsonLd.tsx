interface FAQItem {
  question: string
  answer: string
}

interface Post {
  title: string
  description: string
  date: string
  updated?: string
  permalink: string
  cover: { src: string; width: number; height: number }
}

export default function BlogJsonLd({ post, faq }: { post: Post; faq?: FAQItem[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    image: {
      '@type': 'ImageObject',
      url: post.cover.src.startsWith('http') ? post.cover.src : `https://hypeon.media${post.cover.src}`,
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

  const faqLd = faq?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }
    : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
    </>
  )
}
