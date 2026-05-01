import React from 'react'
import { AnimatePresence, motion } from '@/lib/motion'
import type { Herb } from '../types'
import HerbCard from './HerbCard'
import { buildCardSummary } from '@/lib/summary'
import { hasVal } from '@/lib/pretty'
import { slugify } from '@/lib/slug'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

interface Props {
  herbs: Herb[]
  highlightQuery?: string
  batchSize?: number
  view?: 'grid' | 'list'
}

const herbSlug = (herb: Herb): string =>
  hasVal(herb.slug)
    ? String(herb.slug)
    : slugify(String(herb.common || herb.scientific || herb.name || ''))

const meta = (herb: Herb, key: string, fallbackKey: string): string =>
  String((herb as Record<string, unknown>)[key] || (herb as Record<string, unknown>)[fallbackKey] || '').toLowerCase()

const scoreHerb = (herb: Herb): number => {
  const summaryQuality = meta(herb, 'summary_quality', 'summaryQuality')
  const profileStatus = meta(herb, 'profile_status', 'profileStatus')
  let score = 0

  if (summaryQuality && summaryQuality !== 'none') score += 2
  if (summaryQuality === 'strong') score += 2
  if (profileStatus === 'complete') score += 4
  if (profileStatus === 'partial') score += 1
  if (String(herb.description || '').trim()) score += 1
  if (Array.isArray((herb as Record<string, unknown>).primary_effects)) score += 1

  return score
}

const dedupeHerbsBySlug = (items: Herb[]): Herb[] => {
  const bySlug = new Map<string, Herb>()

  for (const herb of items) {
    const slug = herbSlug(herb)
    if (!slug) continue

    const current = bySlug.get(slug)
    if (!current || scoreHerb(herb) > scoreHerb(current)) {
      bySlug.set(slug, herb)
    }
  }

  return Array.from(bySlug.values())
}

const HerbList: React.FC<Props> = ({
  herbs,
  highlightQuery = '',
  batchSize = 24,
  view = 'grid',
}) => {
  const dedupedHerbs = React.useMemo(() => dedupeHerbsBySlug(herbs), [herbs])
  const [visible, setVisible] = React.useState(batchSize)

  React.useEffect(() => {
    setVisible(batchSize)
  }, [batchSize, highlightQuery, dedupedHerbs.length])

  const showMore = () => setVisible(v => Math.min(v + batchSize, dedupedHerbs.length))

  if (dedupedHerbs.length === 0) {
    return <p className='text-white/70/80 text-center'>No herbs match your search.</p>
  }

  return (
    <>
      <motion.div
        key={`${highlightQuery}-${dedupedHerbs.map(h => herbSlug(h)).join('-')}`}
        layout
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        viewport={{ once: true, amount: 0.2 }}
        className={
          view === 'grid'
            ? 'grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3'
            : 'flex flex-col gap-5'
        }
      >
        <AnimatePresence>
          {dedupedHerbs.slice(0, visible).map(h => {
            const slug = herbSlug(h)

            return (
              <motion.div key={slug} variants={itemVariants} layout>
                <HerbCard
                  name={String(h.common || h.scientific || h.name || 'Herb')}
                  summary={
                    buildCardSummary({
                      effects: h.effects,
                      mechanism: h.mechanism,
                      description: h.description,
                      activeCompounds: h.activeCompounds,
                      therapeuticUses: h.traditionalUses,
                      maxLen: 130,
                    }) || 'Learn more about this herb and its potential uses.'
                  }
                  primary_effects={Array.isArray((h as Record<string, unknown>).primary_effects)
                    ? ((h as Record<string, unknown>).primary_effects as string[])
                    : Array.isArray((h as Record<string, unknown>).primaryEffects)
                      ? ((h as Record<string, unknown>).primaryEffects as string[])
                      : []}
                  profile_status={String((h as Record<string, unknown>).profile_status || (h as Record<string, unknown>).profileStatus || '')}
                  summary_quality={String((h as Record<string, unknown>).summary_quality || (h as Record<string, unknown>).summaryQuality || '')}
                  detailUrl={`/herbs/${encodeURIComponent(slug)}`}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
      {visible < dedupedHerbs.length && (
        <div className='mt-6 text-center'>
          <button
            type='button'
            onClick={showMore}
            className='rounded-md bg-black/30 px-4 py-2 text-white/70 backdrop-blur-md hover:bg-white/10'
          >
            Show More
          </button>
        </div>
      )}
    </>
  )
}

export default HerbList
