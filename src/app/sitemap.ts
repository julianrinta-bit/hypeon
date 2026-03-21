import type { MetadataRoute } from 'next'
import { posts } from '#velite'

export default function sitemap(): MetadataRoute.Sitemap {
  const blogEntries: MetadataRoute.Sitemap = posts.map(post => ({
    url: `https://hypeon.media${post.permalink}`,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    {
      url: 'https://hypeon.media',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://hypeon.media/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...blogEntries,
  ]
}
