import type { MetadataRoute } from 'next'
import { SITE_URL } from '../src/lib/seo'

export const dynamic = 'force-static'

const siteUrl = SITE_URL

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      // Keep the generated runtime-data surface private from crawlers while
      // explicitly exposing the public AI entity graph advertised in llms.txt.
      // Robots matching uses the most-specific path rule, so this allow safely
      // overrides the broader /data/ disallow only for /data/ai-entities/.
      allow: ['/', '/data/ai-entities/'],
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

        // Query-state URLs are UI state, not independent landing pages. Keep the
        // clean canonical libraries crawlable while preventing search/facet state
        // from multiplying the crawl space. The underlying HTML links remain
        // discoverable through the clean routes and paginated paths.
        '/search?*',
        '/search/?*',
        '/herbs?*q=*',
        '/herbs/?*q=*',
        '/herbs?*context=*',
        '/herbs/?*context=*',
        '/herbs?*evidence=*',
        '/herbs/?*evidence=*',
        '/compounds?*q=*',
        '/compounds/?*q=*',
        '/compounds?*context=*',
        '/compounds/?*context=*',
        '/compounds?*evidence=*',
        '/compounds/?*evidence=*',
        '/guides/compare?*c=*',
        '/guides/compare/?*c=*',
        '/guides/compare/dynamic?*',
        '/guides/compare/dynamic/?*',
      ],
    },
    // No `host` directive: it is a non-standard Yandex-only field that Google and
    // Bing ignore, and scripts/ci/validate-robots.mjs rejects it outright. Canonical
    // host is enforced by canonical URLs and the apex/www redirects in _redirects.
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
