'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
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
    <nav
      aria-label="Breadcrumb"
      className="border-b border-brand-900/10 bg-[var(--surface)] dark:border-[var(--border-soft)] dark:bg-[var(--surface)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={breadcrumb.href} className="flex items-center gap-2">
              {/* Separator */}
              {index > 0 && (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted/50 dark:text-[var(--text-muted)]/40" />
              )}

              {/* Link or Current Page */}
              {breadcrumb.current ? (
                <span
                  className="inline-flex min-h-[44px] items-center font-semibold text-ink line-clamp-1 dark:text-[var(--text-primary)]"
                  aria-current="page"
                >
                  {breadcrumb.label}
                </span>
              ) : (
                <Link
                  href={breadcrumb.href}
                  className="inline-flex min-h-[44px] items-center text-brand-700 transition-colors hover:text-brand-800 hover:underline line-clamp-1 dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)]"
                >
                  {breadcrumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  )
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
      item: `${siteUrl}${breadcrumb.href}`,
    })),
  }
}
