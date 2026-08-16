import Link from 'next/link'

type LastUpdatedBadgeProps = {
  date?: string | null
  label?: string
  className?: string
  citationCount?: number
  showCorrectionLink?: boolean
}

function formatReviewDate(value: string | null | undefined): string | null {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function LastUpdatedBadge({
  date,
  label = 'Last reviewed',
  className = '',
  citationCount,
  showCorrectionLink = true,
}: LastUpdatedBadgeProps) {
  const formatted = formatReviewDate(date)
  if (!formatted) return null
  const sourceLabel = citationCount === 1 ? 'source cited' : 'sources cited'

  return (
    <span
      data-editorial-provenance="true"
      data-last-reviewed={date || undefined}
      data-citation-count={citationCount !== undefined ? citationCount : undefined}
      aria-label={`${label}: ${formatted}${citationCount ? `. ${citationCount} ${sourceLabel}.` : ''}${showCorrectionLink ? ' Report a correction.' : ''}`}
      className={`inline-flex flex-wrap items-center gap-x-2 gap-y-1.5 ${className}`}
    >
      <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-brand-900/10 bg-white/80 px-3 py-1 text-xs font-semibold text-muted">
        <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-evidence-strong)]' aria-hidden='true' />
        <span className="min-w-0">
          {label}: <time itemProp="dateModified" dateTime={date || undefined}>{formatted}</time>
          {citationCount !== undefined && citationCount > 0 ? (
            <>
              <span className='mx-1.5 text-muted/30'>•</span>
              <span>{citationCount} {sourceLabel}</span>
            </>
          ) : null}
        </span>
      </span>
      {showCorrectionLink ? (
        <Link
          href="/info/corrections/"
          className="inline-flex min-h-8 items-center rounded-full px-2 text-xs font-semibold text-brand-700 underline-offset-2 hover:underline dark:text-brand-100"
        >
          Report a correction
        </Link>
      ) : null}
    </span>
  )
}
