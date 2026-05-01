import { memo } from 'react'
import { Link } from '@/lib/router-compat'
import Card from './ui/Card'
import { formatBrowseTitle } from '@/utils/titleDisplay'
import { normalizeTagList } from '@/lib/tagNormalization'
import { getProfileStatus, getSummaryQuality, shouldRenderSummary } from '@/lib/workbookRender'
import { hasPlaceholderText, sanitizeSurfaceText } from '@/lib/summary'

const FALLBACK = 'Traditionally used with growing research interest.'

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
  coreInsight,
  evidence_tier,
  evidenceLevel,
  detailUrl,
  profile_status,
  summary_quality,
  primary_effects = [],
}: HerbCardProps) {
  const profileStatus = getProfileStatus({ profile_status })
  const summaryQuality = getSummaryQuality({ summary_quality })
  const showSummary = shouldRenderSummary(profileStatus, summaryQuality)
  const primaryTag = normalizeTagList(primary_effects, { caseStyle: 'title', maxItems: 1 })[0]
    || normalizeTagList([...tags, ...mechanismTags], { caseStyle: 'title', maxItems: 1 })[0]
  const title = formatBrowseTitle(name, 60)
  const isTitleTruncated = title !== name

  const raw = hero?.trim() || summary?.trim() || (summaryQuality === 'strong' ? coreInsight?.trim() : '')
  const cleaned = sanitizeSurfaceText(raw)

  const isWeak = String(summary_quality || '').toLowerCase() === 'none'
  const isBad = !cleaned || hasPlaceholderText(raw) || hasPlaceholderText(cleaned)

  const summaryText = isWeak || isBad
    ? FALLBACK
    : cleaned.length > 120
      ? `${cleaned.slice(0,119).trimEnd()}…`
      : cleaned

  const evidenceTier = normalizeEvidenceTier(evidence_tier || evidenceLevel)
  const letterBadge = title.charAt(0).toUpperCase()

  if (evidenceTier === 'c') return null

  const evidenceCardClass =
    evidenceTier === 'a'
      ? 'border-emerald-300/35 bg-emerald-500/[0.07] shadow-[0_0_0_1px_rgba(16,185,129,0.15)]'
      : evidenceTier === 'b'
        ? 'border-white/8 bg-white/[0.02] opacity-90'
        : 'border-white/8 bg-white/[0.03]'

  return (
    <Card className={`group relative flex h-full flex-col gap-3 rounded-[var(--radius-lg)] p-4 pr-12 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/16 hover:bg-white/[0.055] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${evidenceCardClass}`}>
      <span className='absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-xs font-semibold text-white/35'>
        {letterBadge}
      </span>

      <header className='space-y-2'>
        <h2
          title={isTitleTruncated ? name : undefined}
          className='line-clamp-2 text-base font-semibold leading-snug text-white'
        >
          {title}
        </h2>
        {primaryTag ? (
          <span className='inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.7rem] font-medium text-white/60'>
            {primaryTag}
          </span>
        ) : null}
      </header>

      {showSummary ? (
        <p className='line-clamp-3 text-sm leading-6 text-white/70'>{summaryText}</p>
      ) : null}

      <footer className='mt-auto pt-1'>
        <Link
          to={detailUrl}
          className='inline-flex min-h-8 items-center rounded-md border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/80 transition duration-300 hover:border-cyan-300/45 hover:text-white'
        >
          Open →
        </Link>
      </footer>
    </Card>
  )
}

export default memo(HerbCard)
