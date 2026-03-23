import { memo, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from '@/lib/motion'
import Card from './ui/Card'
import { hasVal } from '../lib/pretty'
import { slugify } from '../lib/slug'
import { buildCardSummary } from '@/lib/summary'
import { extractPrimaryEffects } from '@/utils/extractPrimaryEffects'
import { calculateHerbConfidence, type ConfidenceLevel } from '@/utils/calculateConfidence'
import './HerbCard.css'

interface HerbCardProps {
  herb: Record<string, any>
  index?: number
  compact?: boolean
}

function confidenceBadgeClass(level: ConfidenceLevel) {
  if (level === 'high')
    return 'border-emerald-300/50 bg-emerald-500/15 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.35)]'
  if (level === 'medium')
    return 'border-amber-300/45 bg-amber-500/15 text-amber-100 shadow-[0_0_18px_rgba(245,158,11,0.35)]'
  return 'border-rose-300/50 bg-rose-500/15 text-rose-100 shadow-[0_0_18px_rgba(244,63,94,0.35)]'
}

function HerbCard({ herb, index = 0, compact = false }: HerbCardProps) {
  const [expanded, setExpanded] = useState(false)

  const scientific = String(herb.scientific ?? '').trim()
  const common = String(herb.common ?? '').trim()
  const hasCommon =
    Boolean(common) && (!scientific || common.toLowerCase() !== scientific.toLowerCase())
  const heading = hasCommon ? common : scientific || herb.name || 'Herb'
  const subheading = hasCommon ? scientific : ''
  const confidence =
    herb.confidence ??
    calculateHerbConfidence({
      mechanism: herb.mechanism || herb.mechanismofaction || herb.mechanismOfAction,
      effects: herb.effects,
      compounds: herb.compounds || herb.active_compounds,
    })
  const primaryEffects = extractPrimaryEffects(Array.isArray(herb.effects) ? herb.effects : [], 3)
  const sourceCount = Array.isArray(herb.sources)
    ? herb.sources.length
    : typeof herb.sourceCount === 'number'
      ? herb.sourceCount
      : 0
  const mechanismKnown = Boolean(
    String(herb.mechanism || herb.mechanismofaction || herb.mechanismOfAction || '').trim()
  )
  const confidenceLabel = confidence.charAt(0).toUpperCase() + confidence.slice(1)

  const showShowMore = !compact && (hasVal(herb.effects) || hasVal(herb.description))
  const surfaceSummary = buildCardSummary({
    effects: herb.effects,
    mechanism: herb.mechanism,
    description: herb.description,
    activeCompounds: herb.compounds,
    therapeuticUses: herb.therapeuticUses,
    maxLen: expanded ? 240 : 150,
  })

  const detailHref = useMemo(() => {
    const slug = hasVal(herb.slug)
      ? String(herb.slug)
      : slugify(String(herb.common || herb.scientific || ''))
    if (!slug) return '/herbs'
    return `/herbs/${encodeURIComponent(slug)}`
  }, [herb.common, herb.scientific, herb.slug])

  const resetTilt = (element: HTMLElement) => {
    element.style.setProperty('--rx', '0deg')
    element.style.setProperty('--ry', '0deg')
    element.style.setProperty('--glowX', '50%')
    element.style.setProperty('--glowY', '50%')
    element.style.transform =
      'perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 250, damping: 15, delay: index * 0.02 }}
      whileHover={{ scale: 1.015, y: -2 }}
      whileTap={{ scale: 0.985 }}
      className='h-full'
    >
      <div
        onPointerMove={event => {
          const element = event.currentTarget as HTMLElement
          const rect = element.getBoundingClientRect()
          const percentX = ((event.clientX - rect.left) / rect.width) * 100
          const percentY = ((event.clientY - rect.top) / rect.height) * 100
          const tiltX = ((percentY - 50) / -12).toFixed(2)
          const tiltY = ((percentX - 50) / 12).toFixed(2)
          element.style.setProperty('--rx', `${tiltX}deg`)
          element.style.setProperty('--ry', `${tiltY}deg`)
          element.style.setProperty('--glowX', `${percentX.toFixed(2)}%`)
          element.style.setProperty('--glowY', `${percentY.toFixed(2)}%`)
        }}
        onPointerLeave={event => {
          resetTilt(event.currentTarget as HTMLElement)
        }}
        onPointerUp={event => {
          resetTilt(event.currentTarget as HTMLElement)
        }}
        onPointerCancel={event => {
          resetTilt(event.currentTarget as HTMLElement)
        }}
        className='HerbCardTilt group relative h-full transition-transform duration-200'
      >
        <div className='HerbCardGlow pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-0 transition-opacity duration-200 group-hover:opacity-100' />
        <Card
          className={`relative flex h-full flex-col ${compact ? 'mini-card gap-3' : 'gap-4'} card-pad hover:shadow-glow transition-shadow duration-200`}
        >
          <header className='stack relative pr-20'>
            <span
              className={`absolute right-0 top-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${confidenceBadgeClass(confidence)}`}
            >
              {confidence}
            </span>
            {compact ? (
              <h3 className='line-clamp-2 text-base font-semibold text-lime-300'>{heading}</h3>
            ) : (
              <h2 className='h2 line-clamp-2 text-lime-300'>{heading}</h2>
            )}
            {hasVal(subheading) && (
              <p className='small line-clamp-1 italic text-white/65'>{subheading}</p>
            )}
          </header>

          <section className='stack min-h-[112px] text-white/80'>
            {hasVal(surfaceSummary) && !compact ? (
              <p className={`small text-white/85 ${expanded ? '' : 'line-clamp-3'}`}>
                {surfaceSummary}
              </p>
            ) : null}
            {primaryEffects.length > 0 ? (
              <div className='flex flex-wrap gap-1.5'>
                {primaryEffects.map(effect => (
                  <span
                    key={effect}
                    className='line-clamp-1 rounded-full border border-violet-300/35 bg-violet-500/15 px-2.5 py-1 text-[11px] text-violet-100 shadow-[0_0_14px_rgba(139,92,246,0.3)]'
                  >
                    {effect}
                  </span>
                ))}
              </div>
            ) : (
              <p className='small rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-white/65'>
                No high-confidence effect tags yet.
              </p>
            )}
            <p className='small text-white/70'>
              Confidence: <span className='text-white/90'>{confidenceLabel}</span>
              {sourceCount > 0 ? ` · Sources: ${sourceCount}` : ''}
              {compact ? '' : ` · Mechanism: ${mechanismKnown ? 'Known' : 'Unknown'}`}
            </p>
            {confidence === 'low' && (
              <p className='small rounded-lg border border-amber-300/35 bg-amber-500/10 px-2.5 py-1.5 text-amber-100'>
                ⚠️ This entry is incomplete. Data is still being verified.
              </p>
            )}
          </section>

          <footer
            className={`mt-auto flex items-center justify-between text-sm ${compact ? 'pt-1' : ''}`}
          >
            {showShowMore && (
              <button
                type='button'
                className='text-sub hover:text-text underline decoration-dotted underline-offset-4 transition'
                onClick={() => setExpanded(value => !value)}
                aria-expanded={expanded}
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
            <Link
              to={detailHref}
              className='text-sub hover:text-text underline underline-offset-4 transition'
            >
              View details
            </Link>
          </footer>
        </Card>
      </div>
    </motion.div>
  )
}

export default memo(HerbCard)
