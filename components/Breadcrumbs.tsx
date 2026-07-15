'use client'

import { usePathname } from 'next/navigation'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import {
  generateDynamicBreadcrumbs,
  BreadcrumbItem,
} from '@/lib/navigation-config'

/**
 * Dynamic Breadcrumbs Component
 *
 * Automatically generates breadcrumb navigation from current pathname
 * using navigation-config.ts hierarchy.
 *
 * Features:
 * - Fully dynamic (no hardcoding per route)
 * - Accessible (ARIA labels, semantic HTML)
 * - Mobile-responsive (hides intermediate items on small screens)
 * - Emerald styling with ChevronRight separators
 * - Schema.org structured data compatible
 *
 * Usage:
 * Simply place in your layout or page template:
 * ```tsx
 * <Breadcrumbs />
 * ```
 *
 * The component reads usePathname() and auto-generates the trail.
 *
 * @component
 */
export function Breadcrumbs({
  /** Optional custom breadcrumb trail to prepend */
  customTrail,
  /** Whether to show on homepage (default: false) */
  showOnHome = false,
}: {
  customTrail?: BreadcrumbItem[]
  showOnHome?: boolean
} = {}) {
  const pathname = usePathname() || '/'

  // Generate breadcrumbs from pathname
  const breadcrumbs = generateDynamicBreadcrumbs(pathname || '/', customTrail)

  // Don't show on homepage unless explicitly requested
  if (pathname === '/' && !showOnHome) {
    return null
  }

  // Don't render if only one breadcrumb (home)
  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <div
      data-global-breadcrumb
      className="border-b border-brand-900/10 bg-[var(--surface)] dark:border-[var(--border-soft)] dark:bg-[var(--surface)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <AuthorityBreadcrumbs items={breadcrumbs.map(({ href, label }) => ({ href, label }))} />
      </div>
    </div>
  )
}

function normalizeBreadcrumbSchemaItem(siteUrl: string, href: string): string {
  const cleanSiteUrl = siteUrl.replace(/\/$/, '')
  if (!href || href === '/') return `${cleanSiteUrl}/`
  if (href.includes('?') || href.includes('#')) return `${cleanSiteUrl}${href}`
  if (href.split('/').pop()?.includes('.')) return `${cleanSiteUrl}${href}`

  const path = href.startsWith('/') ? href : `/${href}`
  const canonicalPath = path.endsWith('/') ? path : `${path}/`
  return `${cleanSiteUrl}${canonicalPath}`
}

/**
 * Breadcrumb structured data (JSON-LD)
 * Used by BreadcrumbSchema component for Schema.org markup
 *
 * @param breadcrumbs - Array of breadcrumb items
 * @param siteUrl - Base URL for absolute paths
 * @returns Schema.org BreadcrumbList JSON-LD
 */
export function getBreadcrumbSchema(
  breadcrumbs: BreadcrumbItem[],
  siteUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.label,
      item: normalizeBreadcrumbSchemaItem(siteUrl, breadcrumb.href),
    })),
  }
}
