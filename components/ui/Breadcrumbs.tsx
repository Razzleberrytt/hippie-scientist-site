import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function Breadcrumbs({ items = [] }: { items?: { href?: string; label?: string }[] }) {
  if (items.length <= 1) return null

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && (
            <ChevronRight className="h-3 w-3 shrink-0 text-muted/40" aria-hidden="true" />
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="text-brand-700 transition-colors hover:text-brand-800 hover:underline dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)]"
            >
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="font-medium text-ink dark:text-[var(--text-primary)]">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
