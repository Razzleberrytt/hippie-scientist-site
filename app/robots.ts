import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const siteUrl = 'https://thehippiescientist.net'

const disallowedRoutes = [
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
