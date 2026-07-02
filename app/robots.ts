import type { MetadataRoute } from 'next'
import { SITE_URL } from '../src/lib/seo'

export const dynamic = 'force-static'

const siteUrl = SITE_URL

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Prefix-based rules: '/dashboard' also covers '/dashboard/revenue',
      // so specific internal sub-paths are not enumerated here (avoids
      // disclosing the existence of internal tooling endpoints).
      disallow: [
        '/api/',
        '/guides/compare/dynamic',
        '/analytics',
        '/admin/',
        '/dashboard',
        '/data/',
        '/data-fix',
        '/theme',
        '/preview/',
        '/drafts/',
        '/tmp/',
        '/temp/',
        '/test/',
        '/dev/',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
