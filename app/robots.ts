import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const siteUrl = 'https://www.thehippiescientist.net'

const disallowedRoutes = [
  '/analytics',
  '/dashboard',
  '/dashboard/revenue',
  '/data-fix',
  '/graph',
  '/theme',
  '/preview',
  '/drafts',
  '/tmp',
  '/temp',
  '/test',
  '/dev',
  '/data-report',
]

// app/robots.ts is the canonical robots.txt source for the Next.js static export.
// Do not add a duplicate public/robots.txt; keep canonical host and disallow rules here.
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
