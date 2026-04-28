import type { MetadataRoute } from 'next'
import posts from '@/data/blog/posts.json'
import { getCompounds, getHerbs } from '@/lib/runtime-data'

export const dynamic = 'force-static'

type SlugRecord = {
  slug: string
}

type BlogPost = {
  slug: string
}

const siteUrl = 'https://thehippiescientist.net'

const withSiteUrl = (path: string): string =>
  path === '/' ? siteUrl : `${siteUrl}${path}`

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [herbs, compounds] = await Promise.all([
    getHerbs() as Promise<SlugRecord[]>,
    getCompounds() as Promise<SlugRecord[]>,
  ])

  const blogPosts = posts as BlogPost[]
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: withSiteUrl('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: withSiteUrl('/herbs'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: withSiteUrl('/compounds'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: withSiteUrl('/blog'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  const herbRoutes: MetadataRoute.Sitemap = herbs.map(herb => ({
    url: withSiteUrl(`/herbs/${herb.slug}`),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const compoundRoutes: MetadataRoute.Sitemap = compounds.map(compound => ({
    url: withSiteUrl(`/compounds/${compound.slug}`),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map(post => ({
    url: withSiteUrl(`/blog/${post.slug}`),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...herbRoutes, ...compoundRoutes, ...blogRoutes]
}
