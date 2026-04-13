import { memo } from 'react'
import { FlaskConical } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from './ui/Card'
import { formatBrowseTitle } from '@/utils/titleDisplay'

interface HerbCardProps {
  name: string
  summary: string
  tags?: string[]
  mechanismTags?: string[]
  compound_count?: number
  evidence_tier?: string
  evidenceLevel?: string
  detailUrl: string
  compact?: boolean
}

function HerbCard({
  name,
  summary,
  tags = [],
  mechanismTags = [],
  compound_count,
  evidence_tier,
  evidenceLevel,
  detailUrl,
  compact = false,
}: HerbCardProps) {
  const mergedTags = Array.from(new Set([...tags, ...mechanismTags].filter(Boolean)))
  const primaryTag = mergedTags[0]
  const hasCompoundCount = typeof compound_count === 'number' && compound_count > 0
  const title = formatBrowseTitle(name, 60)
  const isTitleTruncated = title !== name
  const summaryText = summary?.trim() || 'Overview coming soon.'

  const chipItems = [evidence_tier || evidenceLevel || '', primaryTag || ''].filter(Boolean).slice(0, 2)

  return (
    <Card
      className={`ds-card relative flex h-full flex-col border-white/12 bg-white/[0.02] ${compact ? 'gap-1.5 p-2.5' : 'gap-2 p-3'}`}
    >
      <header>
        <h2
          title={isTitleTruncated ? name : undefined}
          className='line-clamp-2 min-h-[2.2rem] break-all text-[0.95rem] font-semibold leading-tight text-white sm:text-base'
        >
          {title}
        </h2>
      </header>

      <p className='line-clamp-2 text-xs leading-[1.35] text-white/72'>{summaryText}</p>

      <div className='flex items-center justify-between gap-2 text-[11px] text-white/58'>
        <div className='truncate'>
          {hasCompoundCount ? (
            <span className='inline-flex items-center gap-1'>
              <FlaskConical className='h-3 w-3' aria-hidden='true' />
              {compound_count} compounds
            </span>
          ) : (
            <span>Profile</span>
          )}
        </div>
        {chipItems.length > 0 && (
          <div className='flex items-center gap-1'>
            {chipItems.map(chip => (
              <span key={chip} className='ds-pill max-w-[92px] truncate'>
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>

      <footer className='mt-auto pt-0.5'>
        <Link
          to={detailUrl}
          className='inline-flex min-h-7 items-center rounded-md border border-white/15 bg-white/[0.03] px-2 py-1 text-[11px] font-medium text-white/78 transition hover:border-cyan-300/45 hover:text-white'
        >
          View details
        </Link>
      </footer>
    </Card>
  )
}

export default memo(HerbCard)
