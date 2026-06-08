import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-static'

const siteUrl = SITE_URL

const disallowedRoutes = [
  '/compare/dynamic',
  '/analytics',
  '/dashboard',
  '/dashboard/revenue',
  '/data-fix',
  '/theme',
  '/preview',
  '/drafts',
  '/tmp',
  '/temp',
  '/test',
  '/dev',
  '/data-report',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowedRoutes,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
