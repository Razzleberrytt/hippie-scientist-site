import type { ReactNode } from 'react'

type ResultsSummaryCardProps = {
  goal: string
  blendName: string
  herbs: string[]
  explanation: string
  timestamp?: string
  ctaButtons?: ReactNode
  variant?: 'compact' | 'expanded'
  className?: string
}

const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) return null
  const parsed = new Date(timestamp)
  if (Number.isNaN(parsed.getTime())) return timestamp
  return parsed.toLocaleString()
}

export default function ResultsSummaryCard({
  goal,
  blendName,
  herbs,
  explanation,
  timestamp,
  ctaButtons,
  variant = 'expanded',
  className = '',
}: ResultsSummaryCardProps) {
  const isCompact = variant === 'compact'
  const formattedTimestamp = formatTimestamp(timestamp)

  return (
    <article
      className={`border-border/80 from-panel/95 via-panel/85 to-panel/75 relative overflow-hidden rounded-2xl border bg-gradient-to-br shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_14px_34px_-24px_rgba(148,163,184,0.55)] ${isCompact ? 'space-y-3 p-3' : 'space-y-4 p-4 sm:p-5'} ${className}`}
    >
      <div className='from-brand-lime/14 via-brand-lime/4 pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent' />
      <div className='relative z-10 space-y-2'>
        <p className='text-sub text-[11px] uppercase tracking-[0.22em]'>Your Recommended Blend</p>
        <h3 className={`${isCompact ? 'text-base' : 'text-lg sm:text-xl'} text-text font-semibold`}>
          {blendName}
        </h3>
        <span className='text-brand-lime bg-brand-lime/18 border-brand-lime/35 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize tracking-wide'>
          {goal}
        </span>
      </div>

      <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-sub relative z-10`}>{explanation}</p>

      <div className='relative z-10 space-y-2'>
        <p className='text-sub text-xs uppercase tracking-wide'>Herb list</p>
        {herbs.length ? (
          <ul
            className={`${isCompact ? 'text-xs' : 'text-sm'} text-sub list-inside list-disc space-y-1`}
          >
            {herbs.map(herb => (
              <li key={`${blendName}-${herb}`}>{herb}</li>
            ))}
          </ul>
        ) : (
          <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-sub`}>No herbs saved yet.</p>
        )}
      </div>

      {formattedTimestamp && (
        <p className='text-sub relative z-10 text-xs'>Recommended: {formattedTimestamp}</p>
      )}

      {ctaButtons && <div className='relative z-10'>{ctaButtons}</div>}
    </article>
  )
}
