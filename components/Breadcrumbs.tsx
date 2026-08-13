'use client'

import { usePathname } from 'next/navigation'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import { generateDynamicBreadcrumbs, BreadcrumbItem } from '@/lib/navigation-config'

export function Breadcrumbs({ customTrail, showOnHome = false }: { customTrail?: BreadcrumbItem[]; showOnHome?: boolean } = {}) {
  const pathname = usePathname() || '/'
  const normalizedPathname = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')

  if (normalizedPathname === '/articles' || normalizedPathname.startsWith('/articles/')) return null

  const breadcrumbs = generateDynamicBreadcrumbs(normalizedPathname, customTrail)

  if (normalizedPathname === '/' && !showOnHome) return null
  if (breadcrumbs.length <= 1) return null

  return (
    <div data-global-breadcrumb className="border-b border-brand-900/10 bg-[var(--surface)] dark:border-[var(--border-soft)] dark:bg-[var(--surface)]">
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

export function getBreadcrumbSchema(breadcrumbs: BreadcrumbItem[], siteUrl: string) {
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
