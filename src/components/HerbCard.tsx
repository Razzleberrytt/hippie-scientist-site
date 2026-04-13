/**
 * CANONICAL HERB CARD
 *
 * This is the ONLY allowed herb card component.
 * Do NOT create variants.
 * Extend via props only.
 */
import { memo } from 'react'
import { FlaskConical } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from './ui/Card'
import { formatBrowseTitle } from '@/utils/titleDisplay'
import './HerbCard.css'

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

const EVIDENCE_TIER_BADGE_CLASS: Record<string, string> = {
  'Tier 1': 'border-emerald-300/35 bg-emerald-400/15 text-emerald-200',
  'Tier 2': 'border-sky-300/35 bg-sky-400/15 text-sky-200',
  'Tier 3': 'border-amber-300/35 bg-amber-400/15 text-amber-200',
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
  const normalizedEvidenceTier = (evidence_tier || '').trim()
  const fallbackEvidence = normalizedEvidenceTier ? '' : (evidenceLevel || '').trim()
  const title = formatBrowseTitle(name, 60)
  const isTitleTruncated = title !== name
  const summaryText = summary?.trim() || 'Overview coming soon.'

  const priorityChips = [
    normalizedEvidenceTier
      ? {
          key: `tier-${normalizedEvidenceTier}`,
          label: normalizedEvidenceTier,
          className:
            EVIDENCE_TIER_BADGE_CLASS[normalizedEvidenceTier] ??
            'border-white/20 bg-white/[0.05] text-white/75',
        }
      : fallbackEvidence
        ? {
            key: `evidence-${fallbackEvidence}`,
            label: fallbackEvidence.slice(0, 24),
            className: 'border-white/20 bg-white/[0.05] text-white/75',
          }
        : null,
    hasCompoundCount
      ? {
          key: 'compound-count',
          label: `${compound_count} compounds`,
          className: 'border-white/20 bg-white/[0.05] text-white/70',
        }
      : null,
    primaryTag
      ? {
          key: `tag-${primaryTag}`,
          label: primaryTag,
          className: 'border-white/15 bg-white/[0.03] text-white/70',
        }
      : null,
  ]
    .filter(Boolean)
    .slice(0, 2) as Array<{ key: string; label: string; className: string }>

  return (
    <div className='HerbCardTilt group relative h-full transition-transform duration-200 ease-out hover:scale-[1.004]'>
      <div className='HerbCardGlow pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-0 transition-opacity duration-200 group-hover:opacity-100' />
      <Card
        className={`ds-card-paper card-pad border-white/12 relative flex h-full flex-col bg-white/[0.05] transition duration-200 ease-out group-hover:border-white/20 group-hover:bg-white/[0.07] ${
          compact ? 'gap-1 p-1.5' : 'gap-1.5 p-2 sm:p-2.5'
        }`}
      >
        <header className='space-y-0'>
          <h2
            title={isTitleTruncated ? name : undefined}
            className={
              compact
                ? 'line-clamp-2 min-h-[2.1rem] break-all text-[0.9rem] font-semibold leading-tight text-lime-200'
                : 'line-clamp-2 min-h-[2.3rem] break-all text-[0.96rem] font-semibold leading-tight text-lime-200 sm:text-base'
            }
          >
            {title}
          </h2>
        </header>

        <section className='space-y-0.5 text-white/80'>
          <p
            className={`line-clamp-2 text-[11px] text-white/68 ${compact ? 'leading-tight' : 'leading-snug sm:text-xs'}`}
          >
            {summaryText}
          </p>
          {priorityChips.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {priorityChips.map(chip => (
                <span
                  key={chip.key}
                  className={`inline-flex max-w-full items-center rounded-full border px-1.5 py-0 text-[10px] font-medium ${chip.className}`}
                >
                  <span className='truncate'>{chip.label}</span>
                </span>
              ))}
            </div>
          )}
        </section>

        <footer className='mt-auto flex items-center justify-between pt-0'>
          {hasCompoundCount ? (
            <span className='inline-flex items-center gap-1 text-[10px] text-white/45'>
              <FlaskConical className='h-3 w-3' aria-hidden='true' />
              {compound_count}
            </span>
          ) : (
            <span className='text-[10px] text-white/35'>Profile</span>
          )}
          <Link
            to={detailUrl}
            className='inline-flex min-h-5 items-center rounded-md border border-white/12 bg-white/[0.03] px-1.5 py-0 text-[10px] font-medium text-white/68 transition duration-200 ease-out hover:border-white/25 hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300'
          >
            View details
          </Link>
        </footer>
      </Card>
    </div>
  )
}

export default memo(HerbCard)
