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
}: HerbCardProps) {
  const mergedTags = Array.from(new Set([...tags, ...mechanismTags].filter(Boolean)))
  const hasCompoundCount = typeof compound_count === 'number' && compound_count > 0
  const normalizedEvidenceTier = (evidence_tier || '').trim()
  const fallbackEvidence = normalizedEvidenceTier ? '' : (evidenceLevel || '').trim()
  const showMetadata = hasCompoundCount || Boolean(normalizedEvidenceTier) || Boolean(fallbackEvidence)

  return (
    <div className='group relative h-full transition-transform duration-200 ease-out HerbCardTilt hover:scale-[1.01]'>
      <div className='HerbCardGlow pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-0 transition-opacity duration-200 group-hover:opacity-100' />
      <Card className='card-pad relative flex h-full flex-col gap-5 border-white/12 bg-white/[0.05] p-5 transition duration-200 ease-out group-hover:border-white/20 group-hover:bg-white/[0.07]'>
        <header className='space-y-2'>
          <h2 className='text-[1.35rem] font-semibold leading-tight text-lime-200 sm:text-2xl'>{name}</h2>
        </header>

        <section className='space-y-4 text-white/80'>
          <p className='line-clamp-3 text-sm leading-6 text-white/70'>{summary}</p>
          <div className='flex flex-wrap gap-2'>
            {mergedTags.map(tag => (
              <span
                key={tag}
                className='rounded-full border border-white/15 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-white/70'
              >
                {tag}
              </span>
            ))}
          </div>
          {showMetadata && (
            <div className='min-h-0 flex flex-wrap items-center gap-2'>
              {hasCompoundCount && (
                <span className='inline-flex items-center gap-1.5 text-xs text-white/55'>
                  <FlaskConical className='h-3.5 w-3.5' aria-hidden='true' />
                  {compound_count} compounds
                </span>
              )}
              {normalizedEvidenceTier && (
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                    EVIDENCE_TIER_BADGE_CLASS[normalizedEvidenceTier] ??
                    'border-white/20 bg-white/[0.05] text-white/75'
                  }`}
                >
                  {normalizedEvidenceTier}
                </span>
              )}
              {!normalizedEvidenceTier && fallbackEvidence && (
                <span className='inline-flex max-w-[12rem] items-center rounded-full border border-white/20 bg-white/[0.05] px-2.5 py-1 text-xs font-medium text-white/75'>
                  <span className='truncate'>{fallbackEvidence.slice(0, 24)}</span>
                </span>
              )}
            </div>
          )}
        </section>

        <footer className='mt-auto flex items-center justify-end pt-2 text-sm'>
          <Link
            to={detailUrl}
            className='inline-flex min-h-10 items-center rounded-lg border border-white/20 bg-white/[0.06] px-3 py-2 text-sm font-medium text-white/85 transition duration-200 ease-out hover:border-white/35 hover:bg-white/[0.12] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300'
          >
            View details
          </Link>
        </footer>
      </Card>
    </div>
  )
}

export default memo(HerbCard)
