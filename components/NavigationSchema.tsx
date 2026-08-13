/**
 * Navigation Schema Component
 *
 * Generates Schema.org SiteNavigationElement markup for SEO.
 * Helps search engines understand site hierarchy and main navigation structure.
 *
 * Renders as JSON-LD script tag in document head.
 *
 * @component
 */

import { SITE_URL } from '@/lib/navigation-config'
import { primaryNavigation } from '@/lib/primary-navigation'
import { serializeJsonLd } from '@/src/lib/schema-injector'

const WEBSITE_ID = `${SITE_URL}/#website`
const NAVIGATION_ID = `${SITE_URL}/#navigation`

function canonicalNavigationUrl(href: string): string {
  const base = SITE_URL.replace(/\/$/, '')
  if (!href || href === '/') return `${base}/`
  if (href.includes('?') || href.includes('#')) return `${base}${href}`
  if (href.split('/').pop()?.includes('.')) return `${base}${href}`
  const path = href.startsWith('/') ? href : `/${href}`
  return `${base}${path.endsWith('/') ? path : `${path}/`}`
}

/**
 * Generate SiteNavigationElement schema from navigation config
 * @returns Schema.org SiteNavigationElement JSON-LD object
 */
function generateNavigationSchema() {
  const hasPart: Array<{
    '@type': string
    name: string
    url: string
  }> = []

  /**
   * Flatten hierarchical navigation into flat array for schema
   */
  const flattenNav = (
    items: typeof primaryNavigation
  ): Array<{ label: string; href: string }> => {
    const result: Array<{ label: string; href: string }> = []

    for (const item of items) {
      result.push({ label: item.label, href: item.href })
      if (item.children) {
        result.push(...flattenNav(item.children))
      }
    }

    return result
  }

  const flatItems = flattenNav(primaryNavigation)

  for (const item of flatItems) {
    hasPart.push({
      '@type': 'WebPage',
      name: item.label,
      url: canonicalNavigationUrl(item.href),
    })
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    '@id': NAVIGATION_ID,
    name: 'Main Navigation',
    url: canonicalNavigationUrl('/'),
    isPartOf: {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      name: 'The Hippie Scientist',
      url: canonicalNavigationUrl('/'),
    },
    hasPart,
  }
}

/**
 * NavigationSchema Component
 *
 * Renders SiteNavigationElement schema as JSON-LD script tag.
 * Should be placed in document head (typically in layout.tsx).
 */
export function NavigationSchema() {
  const schema = generateNavigationSchema()

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(schema),
      }}
      suppressHydrationWarning
    />
  )
}

export { generateNavigationSchema }
