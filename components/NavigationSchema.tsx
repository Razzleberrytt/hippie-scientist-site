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

import { mainNavigation, SITE_URL } from '@/lib/navigation-config'
import { serializeJsonLd } from '@/src/lib/schema-injector'

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
    items: typeof mainNavigation
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

  const flatItems = flattenNav(mainNavigation)

  for (const item of flatItems) {
    hasPart.push({
      '@type': 'WebPage',
      name: item.label,
      url: `${SITE_URL}${item.href}`,
    })
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: 'Main Navigation',
    url: SITE_URL,
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
