import type { MetadataRoute } from 'next'
import { SITE_URL } from '../src/lib/seo'

export const dynamic = 'force-static'

const siteUrl = SITE_URL

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      // Public search and answer engines are intentionally allowed to crawl the
      // canonical HTML site. Most runtime data stays private, but the small set
      // of machine-readable research artifacts below is explicitly crawlable so
      // entity/claim provenance can be resolved back to human-readable pages.
      // Robots matching uses the most-specific path rule, so these allows safely
      // override the broader /data/ disallow only for approved public datasets.
      allow: [
        '/',
        '/llms.txt',
        '/data/ai-entities/',
        '/data/ingredients/',
        '/data/claim-knowledge-graph.json',
        '/data/research-relationship-graph.json',
      ],
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
