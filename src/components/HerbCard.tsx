import { memo } from 'react'
import { FlaskConical } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from './ui/Card'
import { formatBrowseTitle } from '@/utils/titleDisplay'
import { normalizeTagList } from '@/lib/tagNormalization'
import { getProfileStatus, getSummaryQuality, shouldRenderSummary } from '@/lib/workbookRender'

interface HerbCardProps {
  name: string
  summary: string
  tags?: string[]
  mechanismTags?: string[]
  hero?: string
  effects?: string[]
  coreInsight?: string
  compound_count?: number
  evidence_tier?: string
  evidenceLevel?: string
  detailUrl: string
  compact?: boolean
  profile_status?: string
  summary_quality?: string
  primary_effects?: string[]
}

function HerbCard({
  name,
  summary,
  tags = [],
  mechanismTags = [],
  hero,
  effects = [],
  coreInsight,
  compound_count,
  evidence_tier,
  evidenceLevel,
  detailUrl,
  compact = false,
  profile_status,
  summary_quality,
  primary_effects = [],
}: HerbCardProps) {
  const profileStatus = getProfileStatus({ profile_status })
  const summaryQuality = getSummaryQuality({ summary_quality })
  const showSummary = shouldRenderSummary(profileStatus, summaryQuality)
  const isMinimal = profileStatus === 'minimal'
  const isPartial = profileStatus === 'partial'
  const pills = normalizeTagList(primary_effects, { caseStyle: 'title', maxItems: 2 })
  const fallbackTags = normalizeTagList([...tags, ...mechanismTags], { caseStyle: 'title', maxItems: 2 })
  const primaryTag = pills[0] || fallbackTags[0]
  const hasCompoundCount = typeof compound_count === 'number' && compound_count > 0
  const title = formatBrowseTitle(name, 60)
  const isTitleTruncated = title !== name
  const summaryText = hero?.trim() || summary?.trim() || (summaryQuality === 'strong' ? coreInsight?.trim() : '')

  const chipItems = normalizeTagList([evidence_tier || evidenceLevel || '', primaryTag || ''], {
    caseStyle: 'title',
    maxItems: 2,
  })

  return (
    <Card
      className={`neo-card fade-in-surface ds-card relative flex h-full flex-col border-white/12 ${compact ? 'gap-2 p-2.5' : 'gap-2.5 p-3.5'}`}
    >
      <div aria-hidden className='pointer-events-none absolute -right-10 -top-14 h-24 w-24 rounded-full bg-fuchsia-400/10 blur-2xl' />
      <header>
        <h2
          title={isTitleTruncated ? name : undefined}
          className='line-clamp-2 min-h-[2.2rem] break-all text-[0.95rem] font-semibold leading-tight text-white sm:text-base'
        >
          {title}
        </h2>
      </header>

      {showSummary && summaryText ? (
        <p className='line-clamp-2 text-xs leading-[1.45] text-white/78'>{summaryText}</p>
      ) : null}

      {pills.length > 0 && (
        <div className='flex flex-wrap gap-1'>
          {pills.map(tag => (
            <span key={tag} className='ds-pill neo-pill'>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className='flex items-center justify-between gap-2 text-[11px] text-white/58'>
        <div className='truncate'>
          {isMinimal ? (
            <span>Minimal profile</span>
          ) : hasCompoundCount ? (
            <span className='inline-flex items-center gap-1'>
              <FlaskConical className='h-3 w-3' aria-hidden='true' />
              {compound_count} compounds
            </span>
          ) : (
            <span>{isPartial ? 'Partial profile' : 'Profile'}</span>
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
          className='inline-flex min-h-7 items-center rounded-md border border-white/15 bg-white/[0.03] px-2 py-1 text-[11px] font-medium text-white/78 transition duration-300 hover:border-cyan-300/45 hover:text-white'
        >
          View details
        </Link>
      </footer>
    </Card>
  )
}

export default memo(HerbCard)
