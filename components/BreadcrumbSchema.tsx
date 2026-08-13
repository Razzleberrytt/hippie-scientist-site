'use client'

import { usePathname } from 'next/navigation'
import {
  generateDynamicBreadcrumbs,
  SITE_URL,
  BreadcrumbItem,
} from '@/lib/navigation-config'
import { serializeJsonLd } from '@/src/lib/schema-injector'

function canonicalBreadcrumbUrl(siteUrl: string, href: string): string {
  const base = siteUrl.replace(/\/$/, '')
  if (!href || href === '/') return `${base}/`
  if (href.includes('?') || href.includes('#')) return `${base}${href}`
  if (href.split('/').pop()?.includes('.')) return `${base}${href}`
  const path = href.startsWith('/') ? href : `/${href}`
  return `${base}${path.endsWith('/') ? path : `${path}/`}`
}

function generateBreadcrumbSchema(breadcrumbs: BreadcrumbItem[], siteUrl: string) {
  if (breadcrumbs.length <= 1) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.label,
      item: canonicalBreadcrumbUrl(siteUrl, breadcrumb.href),
    })),
  }
}

export function BreadcrumbSchema() {
  const pathname = usePathname()
  const breadcrumbs = generateDynamicBreadcrumbs(pathname || '/')
  const schema = generateBreadcrumbSchema(breadcrumbs, SITE_URL)

  if (!schema) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
      suppressHydrationWarning
    />
  )
}

export { generateBreadcrumbSchema }
