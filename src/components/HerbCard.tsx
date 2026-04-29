import { memo } from 'react'
import { FlaskConical } from 'lucide-react'
import { Link } from '@/lib/router-compat'
import Card from './ui/Card'
import { formatBrowseTitle } from '@/utils/titleDisplay'
import { normalizeTagList } from '@/lib/tagNormalization'
import { getProfileStatus, getSummaryQuality, shouldRenderSummary } from '@/lib/workbookRender'
import { hasPlaceholderText, sanitizeSurfaceText } from '@/lib/summary'

const normalizeEvidenceTier = (rawTier?: string): 'a' | 'b' | 'c' | null => {
  if (!rawTier) return null
  const value = rawTier.toLowerCase()

  if (value.includes('tier-a') || value.includes('a-tier') || value.includes('tier a') || value == 'a') return 'a'
  if (value.includes('tier-b') || value.includes('b-tier') || value.includes('tier b') || value == 'b') return 'b'
  if (value.includes('tier-c') || value.includes('c-tier') || value.includes('tier c') || value == 'c') return 'c'

  return null
}

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
  const summaryCandidate = sanitizeSurfaceText(
    hero?.trim() || summary?.trim() || (summaryQuality === 'strong' ? coreInsight?.trim() : ''),
  )
  const summaryText =
    summaryCandidate && !hasPlaceholderText(summaryCandidate) ? summaryCandidate : 'Profile pending review'

  const chipItems = normalizeTagList([evidence_tier || evidenceLevel || '', primaryTag || ''], {
    caseStyle: 'title',
    maxItems: 2,
  })

  const chipClass =
    'inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[0.68rem] font-medium text-white/55'
  const evidenceTier = normalizeEvidenceTier(evidence_tier || evidenceLevel)

  if (evidenceTier === 'c') return null

  const evidenceCardClass =
    evidenceTier === 'a'
      ? 'border-emerald-300/35 bg-emerald-500/[0.07] shadow-[0_0_0_1px_rgba(16,185,129,0.15)]'
      : evidenceTier === 'b'
        ? 'border-white/8 bg-white/[0.02] opacity-80'
        : 'border-white/8 bg-white/[0.03]'

  return (
    <Card className={`group relative flex h-full flex-col gap-2.5 rounded-[var(--radius-lg)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/[0.055] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${evidenceCardClass}`}>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 rounded-[var(--radius-lg)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 shadow-[inset_0_0_0_1px_rgba(14,207,179,0.12)]'
      />

      <header>
        <h2
          title={isTitleTruncated ? name : undefined}
          className='line-clamp-2 text-sm font-semibold leading-snug text-white sm:text-[0.95rem]'
        >
          {title}
        </h2>
      </header>

      {showSummary ? (
        <p className='mt-1 line-clamp-2 text-xs leading-[1.5] text-white/62'>{summaryText}</p>
      ) : null}

      {pills.length > 0 && (
        <div className='flex flex-wrap gap-1'>
          {pills.map(tag => (
            <span key={tag} className={chipClass}>
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
            <span className='inline-flex items-center gap-1 font-mono text-[0.68rem] text-[var(--accent-teal)]/80'>
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
              <span key={chip} className={`${chipClass} max-w-[92px] truncate`}>
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
