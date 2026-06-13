type LastUpdatedBadgeProps = {
  date?: string | null
  label?: string
  className?: string
  citationCount?: number
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
}: LastUpdatedBadgeProps) {
  const formatted = formatReviewDate(date)
  if (!formatted) return null

  return (
    <p
      aria-label={`${label}: ${formatted}${citationCount ? `. ${citationCount} human studies cited.` : ''}`}
      className={`inline-flex items-center gap-2 rounded-full border border-brand-900/10 bg-white/80 px-3 py-1 text-xs font-semibold text-muted ${className}`}
    >
      <span className='h-1.5 w-1.5 rounded-full bg-emerald-600' aria-hidden='true' />
      <span>
        {label}: <time dateTime={date || undefined}>{formatted}</time>
        {citationCount !== undefined && citationCount > 0 ? (
          <>
            <span className='mx-1.5 text-muted/30'>•</span>
            <span>{citationCount} human studies cited</span>
          </>
        ) : null}
      </span>
    </p>
  )
}
