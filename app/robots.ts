import type { MetadataRoute } from 'next'
import { SITE_URL } from '../src/lib/seo'

export const dynamic = 'force-static'

const siteUrl = SITE_URL

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
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
    // No `host` directive: it is a non-standard Yandex-only field that Google and
    // Bing ignore, and scripts/ci/validate-robots.mjs rejects it outright. Canonical
    // host is enforced by canonical URLs and the apex/www redirects in _redirects.
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
