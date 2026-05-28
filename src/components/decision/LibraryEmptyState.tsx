import Link from 'next/link'

interface RecoveryLink {
  label: string
  href: string
}

interface LibraryEmptyStateProps {
  title?: string
  description?: string
  recoveryLinks?: RecoveryLink[]
  suggestedSearches?: string[]
}

export default function LibraryEmptyState({
  title = 'Nothing found',
  description = 'Try adjusting your search or browse by a different goal.',
  recoveryLinks = [],
  suggestedSearches = [],
}: LibraryEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-[var(--radius-card-premium)] border border-brand-900/10 bg-white/80 px-6 py-14 text-center shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-brand-900/10 bg-surface text-2xl">
        🌿
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      </div>

      {suggestedSearches.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {suggestedSearches.map((term) => (
            <Link
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="rounded-full border border-brand-900/15 bg-white px-3.5 py-1 text-xs font-medium text-ink transition-colors hover:border-brand-700/30 hover:bg-surface"
            >
              {term}
            </Link>
          ))}
        </div>
      )}

      {recoveryLinks.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3">
          {recoveryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-brand-900/10 bg-white px-4 py-1.5 text-sm font-medium text-ink shadow-sm transition-all hover:border-brand-700/20 hover:shadow"
            >
              {link.label} →
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
