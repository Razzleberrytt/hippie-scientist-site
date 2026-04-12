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

function truncateTitle(name: string, maxLength: number): string {
  if (name.length <= maxLength) return name
  const trimmed = name.slice(0, maxLength - 1).trimEnd()
  const cutoff = trimmed.lastIndexOf(' ')
  if (cutoff >= Math.floor(maxLength * 0.55)) return `${trimmed.slice(0, cutoff)}…`
  return `${trimmed}…`
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
  const visibleTags = mergedTags.slice(0, 2)
  const hasCompoundCount = typeof compound_count === 'number' && compound_count > 0
  const normalizedEvidenceTier = (evidence_tier || '').trim()
  const fallbackEvidence = normalizedEvidenceTier ? '' : (evidenceLevel || '').trim()
  const showMetadata =
    hasCompoundCount || Boolean(normalizedEvidenceTier) || Boolean(fallbackEvidence)
  const title = compact ? truncateTitle(name, 54) : name

  return (
    <div className='HerbCardTilt group relative h-full transition-transform duration-200 ease-out hover:scale-[1.01]'>
      <div className='HerbCardGlow pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-0 transition-opacity duration-200 group-hover:opacity-100' />
      <Card
        className={`card-pad border-white/12 relative flex h-full flex-col bg-white/[0.05] transition duration-200 ease-out group-hover:border-white/20 group-hover:bg-white/[0.07] ${
          compact ? 'gap-2 p-2.5' : 'gap-3 p-3'
        }`}
      >
        <header className={compact ? 'space-y-1' : 'space-y-2'}>
          <h2
            title={name}
            className={
              compact
                ? 'line-clamp-2 text-base font-semibold leading-tight text-lime-200'
                : 'text-[1.35rem] font-semibold leading-tight text-lime-200 sm:text-2xl'
            }
          >
            {title}
          </h2>
        </header>

        <section className={compact ? 'space-y-1.5 text-white/80' : 'space-y-2 text-white/80'}>
          <p
            className={`line-clamp-2 text-sm text-white/70 ${compact ? 'leading-tight' : 'leading-5'}`}
          >
            {summary}
          </p>
          {visibleTags.length > 0 && (
            <div className='flex flex-wrap gap-1.5'>
              {visibleTags.map(tag => (
                <span
                  key={tag}
                  className='rounded-full border border-white/15 bg-white/[0.03] px-2 py-0.5 text-[11px] font-medium text-white/70'
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {showMetadata && (
            <div className='flex min-h-0 flex-wrap items-center gap-1'>
              {hasCompoundCount && (
                <span className='inline-flex items-center gap-1 text-[11px] text-white/55'>
                  <FlaskConical className='h-3 w-3' aria-hidden='true' />
                  {compound_count} compounds
                </span>
              )}
              {normalizedEvidenceTier && (
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                    EVIDENCE_TIER_BADGE_CLASS[normalizedEvidenceTier] ??
                    'border-white/20 bg-white/[0.05] text-white/75'
                  }`}
                >
                  {normalizedEvidenceTier}
                </span>
              )}
              {!normalizedEvidenceTier && fallbackEvidence && (
                <span className='inline-flex max-w-[11rem] items-center rounded-full border border-white/20 bg-white/[0.05] px-2 py-0.5 text-[11px] font-medium text-white/75'>
                  <span className='truncate'>{fallbackEvidence.slice(0, 24)}</span>
                </span>
              )}
            </div>
          )}
        </section>

        <footer className='mt-auto flex items-center justify-end text-sm'>
          <Link
            to={detailUrl}
            className='inline-flex min-h-7 items-center rounded-md border border-white/15 bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-white/75 transition duration-200 ease-out hover:border-white/30 hover:bg-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300'
          >
            View details
          </Link>
        </footer>
      </Card>
    </div>
  )
}

export default memo(HerbCard)
