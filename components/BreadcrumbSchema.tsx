/**
 * Breadcrumb Schema Component
 *
 * Generates Schema.org BreadcrumbList markup from current pathname.
 * Used by search engines to display breadcrumb navigation in search results.
 *
 * Renders as JSON-LD script tag in document head.
 *
 * @component
 */

'use client'

import { usePathname } from 'next/navigation'
import {
  generateDynamicBreadcrumbs,
  SITE_URL,
  BreadcrumbItem,
} from '@/lib/navigation-config'
import { serializeJsonLd } from '@/src/lib/schema-injector'

/**
 * Generate BreadcrumbList schema from pathname
 *
 * @param breadcrumbs - Array of breadcrumb items
 * @param siteUrl - Base URL for absolute paths
 * @returns Schema.org BreadcrumbList JSON-LD object
 */
function generateBreadcrumbSchema(breadcrumbs: BreadcrumbItem[], siteUrl: string) {
  // Only generate schema if there are multiple breadcrumbs
  // (single item breadcrumbs aren't useful in search results)
  if (breadcrumbs.length <= 1) {
    return null
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.label,
      item: `${siteUrl}${breadcrumb.href}`,
    })),
  }
}

/**
 * BreadcrumbSchema Component
 *
 * Automatically generates BreadcrumbList schema from current pathname.
 * Renders as JSON-LD script tag.
 *
 * Usage:
 * Place in your layout or page template (client-side):
 * ```tsx
 * <BreadcrumbSchema />
 * ```
 *
 * The component reads usePathname() and generates appropriate schema.
 */
export function BreadcrumbSchema() {
  const pathname = usePathname()
  const breadcrumbs = generateDynamicBreadcrumbs(pathname || '/')
  const schema = generateBreadcrumbSchema(breadcrumbs, SITE_URL)

  // Don't render if schema is null (single-level breadcrumbs)
  if (!schema) {
    return null
  }

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

export { generateBreadcrumbSchema }
