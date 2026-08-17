import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export type BreadcrumbItem = {
  label: string
  href?: string
}

type AuthorityBreadcrumbsProps = {
  items?: BreadcrumbItem[]
}

function normalizeBreadcrumbHref(href: string): string {
  if (!href || href === '/') return '/'
  if (href.includes('?') || href.includes('#')) return href
  if (href.split('/').pop()?.includes('.')) return href

  return href.endsWith('/') ? href : `${href}/`
}

export default function AuthorityBreadcrumbs({
  items,
}: AuthorityBreadcrumbsProps) {
  if (!items?.length) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb">
      <ol className="-mx-1 flex flex-nowrap items-center gap-1.5 overflow-x-auto px-1 pb-0.5 whitespace-nowrap text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0 sm:pb-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const href = item.href ? normalizeBreadcrumbHref(item.href) : undefined

          return (
            <li
              key={href ?? item.label}
              className="flex shrink-0 items-center gap-1.5"
            >
              {href && !isLast ? (
                <Link
                  href={href}
                  className="inline-flex items-center py-2 text-brand-700 transition-colors hover:text-brand-800 hover:underline underline-offset-2 dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)]"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={isLast ? 'font-semibold text-ink dark:text-[var(--text-primary)]' : 'text-muted dark:text-[var(--text-muted)]'}
                >
                  {item.label}
                </span>
              )}

              {!isLast ? (
                <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-muted/40" />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
