import React, { useState, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronRight, Star } from 'lucide-react'
import type { Herb } from '../types'
import { decodeTag, tagVariant, safetyColorClass } from '../utils/format'
import { canonicalTag } from '../utils/tagUtils'
import { UNKNOWN, NOT_WELL_DOCUMENTED } from '../utils/constants'
import TagBadge from './TagBadge'
import { useHerbFavorites } from '../hooks/useHerbFavorites'
import InfoTooltip from './InfoTooltip'
import { slugify } from '../utils/slugify'

interface Props {
  herb: Herb
  highlight?: string
}

const categoryColors: Record<string, Parameters<typeof TagBadge>[0]['variant']> = {
  Oneirogen: 'blue',
  'Dissociative / Sedative': 'purple',
  'Empathogen / Euphoriant': 'pink',
  'Ritual / Visionary': 'green',
  Other: 'yellow',
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

const TAG_LIMIT = 6

const fieldTooltips: Record<string, string> = {
  mechanismOfAction: 'How this herb produces its effects in the body.',
  toxicity: 'Known adverse effects or poisoning information.',
  therapeuticUses: 'Traditional or potential healing applications.',
  contraindications: 'Situations where this herb should be avoided.',
  dosage: 'Common oral or smoked amount for effects.',
}

function gradientForCategory(cat: string): string {
  const c = cat.toLowerCase()
  if (c.includes('oneirogen')) return 'from-indigo-700/40 to-purple-700/40'
  if (c.includes('ritual') || c.includes('visionary')) return 'from-green-800/40 to-blue-800/40'
  if (c.includes('stimulant')) return 'from-orange-700/40 to-red-700/40'
  return 'from-white/10 to-white/5'
}

type SafetyTier = 'safe' | 'caution' | 'danger' | undefined

function safetyTier(rating: any, toxicity?: string): SafetyTier {
  let r: number | undefined
  if (typeof rating === 'number') r = rating
  if (typeof rating === 'string') {
    const val = rating.toLowerCase()
    if (val === 'low') r = 1
    else if (val === 'moderate') r = 3
    else if (val === 'high') r = 5
  }
  if (toxicity && /severe|danger/i.test(toxicity)) return 'danger'
  if (r == null) return undefined
  if (r <= 2) return 'safe'
  if (r <= 4) return 'caution'
  return 'danger'
}

export default function HerbCardAccordion({ herb, highlight = '' }: Props) {
  const [open, setOpen] = useState(false)
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const toggle = () => setOpen(v => !v)
  const { isFavorite, toggle: toggleFavorite } = useHerbFavorites()

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle()
    }
  }

  const mark = (text: string) => {
    if (!highlight) return text
    const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escaped})`, 'ig')
    return text.replace(regex, '<span class="font-bold text-yellow-300">$1</span>')
  }

  const sortedTags = React.useMemo(() => {
    const active = new Set(
      herb.activeConstituents?.map(c => canonicalTag(c.name)) || []
    )
    return [...herb.tags].sort((a, b) => {
      const aActive = active.has(canonicalTag(a))
      const bActive = active.has(canonicalTag(b))
      return aActive === bActive ? 0 : aActive ? -1 : 1
    })
  }, [herb])

  const gradient = gradientForCategory(herb.category)
  const tier = safetyTier(herb.safetyRating, herb.toxicity)

  return (
    <motion.div
      id={`herb-${herb.id}`}
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={toggle}
      onKeyDown={handleKey}
      tabIndex={0}
      role='button'
      aria-expanded={open}
      whileHover={{
        scale: 1.03,
        boxShadow: '0 0 20px rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(255,255,255,0.1)',
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ layout: { duration: 0.4, ease: 'easeInOut' } }}
      className={`hover-glow card-contrast relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} border border-white/10 p-3 shadow-lg shadow-black/50 ring-1 ring-white/30 backdrop-blur-lg hover:shadow-psychedelic-pink/40 hover:drop-shadow-2xl focus:outline-none focus-visible:shadow-intense focus-visible:ring-2 focus-visible:ring-psychedelic-pink focus-visible:ring-offset-2 focus-visible:ring-offset-space-dark focus-visible:ring-sky-400 focus-visible:ring-4 sm:p-6`}
    >
      <motion.span
        initial={{ opacity: 0, y: -4 }}
        whileHover={{ opacity: 1, y: 0 }}
        whileTap={{ opacity: 1, y: 0 }}
        className='pointer-events-none absolute right-4 top-2 text-xs text-sand'
      >
        + More Info
      </motion.span>
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <div className='flex flex-wrap items-baseline gap-1'>
            <h3
              className='text-shadow mb-0.5 font-herb text-xl text-white sm:text-2xl'
              dangerouslySetInnerHTML={{ __html: mark(herb.name) }}
            />
            {tier && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium shadow ${
                  tier === 'safe'
                    ? 'bg-green-700/40 text-green-200 ring-1 ring-green-400/60'
                    : tier === 'caution'
                      ? 'bg-yellow-700/40 text-yellow-200 ring-1 ring-yellow-400/60'
                      : 'bg-red-700/40 text-red-200 ring-1 ring-red-500/60'
                }`}
              >
                {tier === 'safe' ? '✅ Safe' : tier === 'caution' ? '⚠️ Caution' : '☠️ High Risk'}
              </span>
            )}
          </div>
          {herb.scientificName && (
            <p
              className='mt-0.5 text-xs italic text-sand'
              dangerouslySetInnerHTML={{ __html: mark(herb.scientificName) }}
            />
          )}
          <div className='mt-1 flex flex-wrap items-center gap-2 text-sm text-sand sm:text-base'>
            {herb.category && (
              <TagBadge label={herb.category} variant={categoryColors[herb.category] || 'purple'} />
            )}
            {herb.effects?.length > 0 && <span>{herb.effects.join(', ')}</span>}
            {herb.affiliateLink ? (
              <a
                href={herb.affiliateLink}
                target='_blank'
                rel='noopener noreferrer'
                onClick={e => e.stopPropagation()}
                className='rounded bg-lime-700/40 px-2 py-0.5 text-xs text-lime-200 hover:underline'
              >
                Buy Online
              </a>
            ) : (
              <span className='rounded bg-slate-700/30 px-2 py-0.5 text-xs text-slate-300'>
                ⚠️ No Link
              </span>
            )}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={e => {
              e.stopPropagation()
              toggleFavorite(herb.id)
            }}
            aria-label={isFavorite(herb.id) ? 'Remove favorite' : 'Add favorite'}
            className='rounded-md p-1 text-yellow-400 hover:bg-white/10'
          >
            <Star fill={isFavorite(herb.id) ? 'currentColor' : 'none'} size={18} />
          </button>
          <motion.span
            layout
            initial={false}
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.3 }}
            className='text-cyan-200 transition-transform'
          >
            <ChevronRight size={18} />
          </motion.span>
        </div>
      </div>

      <div className='mt-2 flex flex-wrap gap-2'>
        {(tagsExpanded || sortedTags.length <= TAG_LIMIT
          ? sortedTags
          : sortedTags.slice(0, TAG_LIMIT)
        ).map(tag => (
          <TagBadge
            key={tag}
            label={decodeTag(tag)}
            variant={tagVariant(tag)}
            className={open ? 'animate-pulse' : ''}
          />
        ))}
        {sortedTags.length > TAG_LIMIT && (
          <button
            type='button'
            onClick={e => {
              e.stopPropagation()
              setTagsExpanded(t => !t)
            }}
            className='focus:outline-none'
          >
            <TagBadge
              label={tagsExpanded ? 'Show Less' : `+${sortedTags.length - TAG_LIMIT} more`}
              variant='yellow'
            />
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            layout
            key='content'
            initial='collapsed'
            animate='open'
            exit='collapsed'
            variants={{
              open: { opacity: 1, height: 'auto' },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className='mt-4 overflow-hidden whitespace-pre-line break-words text-sm text-sand sm:text-base'
          >
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              exit='hidden'
              className='space-y-3'
            >
              {[
                'description',
                'mechanismOfAction',
                'therapeuticUses',
                'sideEffects',
                'contraindications',
                'drugInteractions',
                'preparation',
                'dosage',
                'pharmacokinetics',
                'onset',
                'duration',
                'intensity',
                'region',
                'legalStatus',
                'safetyRating',
                'toxicity',
                'toxicityLD50',
              ].map(key => {
                const raw = (herb as any)[key]
                const value =
                  typeof raw === 'string' && raw.trim() && raw !== 'No description provided.'
                    ? raw
                    : key === 'mechanismOfAction' || key === 'toxicity' || key === 'toxicityLD50'
                      ? UNKNOWN
                      : NOT_WELL_DOCUMENTED
                return (
                  <motion.div key={key} variants={itemVariants}>
                    <span className='font-semibold text-lime-300'>
                      {key.replace(/([A-Z])/g, ' $1') + ':'}
                      {fieldTooltips[key] && <InfoTooltip text={fieldTooltips[key]} />}
                    </span>{' '}
                    {key === 'safetyRating' ? (
                      <span className={typeof raw === 'number' ? safetyColorClass(raw) : ''}>
                        {value}
                      </span>
                    ) : (
                      value
                    )}
                  </motion.div>
                )
              })}

              {herb.activeConstituents?.length > 0 && (
                <motion.div variants={itemVariants}>
                  <span className='font-semibold text-lime-300'>Active Compounds:</span>{' '}
                  {herb.activeConstituents.map((c, i) => (
                    <React.Fragment key={c.name}>
                      {i > 0 && ', '}
                      <Link
                        to={`/compounds#${slugify(c.name)}`}
                        onClick={e => e.stopPropagation()}
                        className='hover-glow inline-block rounded px-1 text-sky-300 underline'
                      >
                        {c.name}
                      </Link>
                    </React.Fragment>
                  ))}
                </motion.div>
              )}

              {herb.tags?.length > 0 && (
                <motion.div
                  variants={itemVariants}
                  className='flex max-h-32 flex-wrap gap-2 overflow-y-auto pt-2'
                >
                  {herb.tags.slice(0, 10).map(tag => (
                    <TagBadge
                      key={tag}
                      label={decodeTag(tag)}
                      variant={tagVariant(tag)}
                      className={open ? 'animate-pulse' : ''}
                    />
                  ))}
                </motion.div>
              )}
              <motion.div variants={itemVariants} className='pt-2'>
                <Link
                  to={`/herbs/${herb.id}`}
                  onClick={e => e.stopPropagation()}
                  className='text-comet underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psychedelic-pink'
                >
                  View full page
                </Link>
                {herb.affiliateLink ? (
                  <a
                    href={herb.affiliateLink}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={e => e.stopPropagation()}
                    className='ml-4 text-sm text-sky-300 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psychedelic-pink'
                  >
                    🌐 Buy Online
                  </a>
                ) : (
                  <span className='ml-4 text-sm text-sand/50'>⚠️ Buy Online</span>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
