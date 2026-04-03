import { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from '@/lib/motion'
import Card from './ui/Card'
import { hasVal } from '../lib/pretty'
import { slugify } from '../lib/slug'
import { buildCardSummary } from '@/lib/summary'
import { extractPrimaryEffects } from '@/utils/extractPrimaryEffects'
import './HerbCard.css'

interface HerbCardProps {
  herb: Record<string, any>
  index?: number
  compact?: boolean
  performanceMode?: boolean
}

function HerbCard({ herb, index = 0, compact = false, performanceMode = false }: HerbCardProps) {
  const scientific = String(herb.scientific ?? '').trim()
  const common = String(herb.common ?? '').trim()
  const hasCommon =
    Boolean(common) && (!scientific || common.toLowerCase() !== scientific.toLowerCase())
  const heading = hasCommon ? common : scientific || herb.name || 'Herb'
  const subheading = hasCommon ? scientific : String(herb.name || '').trim()
  const effectsArray: string[] = Array.isArray(herb.effects) ? herb.effects : []
  const primaryEffects = extractPrimaryEffects(effectsArray, 2)
  const summary = buildCardSummary({
    effects: effectsArray,
    mechanism: herb.mechanism,
    description: herb.description,
    activeCompounds: herb.compounds,
    therapeuticUses: herb.therapeuticUses,
    maxLen: 130,
  })
  const surfaceSummary = buildCardSummary({
    therapeuticUses: herb.therapeuticUses,
    effects: effectsArray,
    description: herb.description,
    maxLen: 90,
  })
  const shortSummary = summary || surfaceSummary

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

  const cardContent = (
    <div
      onPointerMove={
        performanceMode
          ? undefined
          : event => {
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
            }
      }
      onPointerLeave={
        performanceMode
          ? undefined
          : event => {
              resetTilt(event.currentTarget as HTMLElement)
            }
      }
      onPointerUp={
        performanceMode
          ? undefined
          : event => {
              resetTilt(event.currentTarget as HTMLElement)
            }
      }
      onPointerCancel={
        performanceMode
          ? undefined
          : event => {
              resetTilt(event.currentTarget as HTMLElement)
            }
      }
      className={`group relative h-full transition-transform duration-200 ${performanceMode ? '' : 'HerbCardTilt'}`}
    >
      {!performanceMode && (
        <div className='HerbCardGlow pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-0 transition-opacity duration-200 group-hover:opacity-100' />
      )}
      <Card
        className='card-pad relative flex h-full flex-col gap-4 transition-shadow duration-200 hover:shadow-glow'
      >
        <header className='space-y-1'>
          <h2 className={`${compact ? 'text-xl' : 'text-2xl'} font-semibold leading-tight text-lime-300`}>
            {heading}
          </h2>
          {hasVal(subheading) && <p className='text-sm italic text-white/65'>{subheading}</p>}
        </header>

        <section className='space-y-3 text-white/80'>
          {shortSummary && <p className='line-clamp-3 text-sm leading-6 text-white/85'>{shortSummary}</p>}
          {primaryEffects.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {primaryEffects.map(effect => (
                <span
                  key={effect}
                  className='rounded-full border border-violet-300/35 bg-violet-500/15 px-2.5 py-1 text-xs text-violet-100'
                >
                  {effect}
                </span>
              ))}
            </div>
          )}
        </section>

        <footer className='mt-auto flex items-center justify-end pt-1 text-sm'>
          <Link
            to={detailHref}
            className='rounded-md px-2 py-1 text-white/75 underline underline-offset-4 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300'
          >
            View details
          </Link>
        </footer>
      </Card>
    </div>
  )

  if (performanceMode) {
    return <div className='h-full'>{cardContent}</div>
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
      {cardContent}
    </motion.div>
  )
}

export default memo(HerbCard)
