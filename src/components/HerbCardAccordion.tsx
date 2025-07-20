import React, { useState, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronRight, Star } from 'lucide-react'
import type { Herb } from '../types'
import { decodeTag, tagVariant } from '../utils/format'
import { canonicalTag } from '../utils/tagUtils'
import { UNKNOWN, NOT_WELL_DOCUMENTED } from '../utils/constants'
import TagBadge from './TagBadge'
import { useHerbFavorites } from '../hooks/useHerbFavorites'
import InfoTooltip from './InfoTooltip'
import { slugify } from '../utils/slugify'
import ErrorBoundary from './ErrorBoundary'

interface Props {
  herb: Herb
  highlight?: string
}

const categoryColors: Record<string, Parameters<typeof TagBadge>[0]['variant']> = {
  Oneirogen: 'blue',
  Dissociative: 'purple',
  Psychedelic: 'purple',
  Empathogen: 'pink',
  Stimulant: 'yellow',
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

const TAG_LIMIT = 5

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
  if (c.includes('psychedelic')) return 'from-fuchsia-700/40 to-pink-700/40'
  if (c.includes('dissociative')) return 'from-purple-700/40 to-violet-700/40'
  if (c.includes('empathogen')) return 'from-rose-700/40 to-pink-600/40'
  if (c.includes('stimulant')) return 'from-orange-700/40 to-amber-700/40'
  return 'from-white/10 to-white/5'
}


function HerbCardAccordionInner({ herb, highlight = '' }: Props) {
  if (!herb || !herb.name) {
    console.warn('Skipping malformed herb:', herb)
    return null
  }

  const h = {
    ...herb,
    name: herb.name || 'Unknown Herb',
    effects: Array.isArray(herb.effects) ? herb.effects : [],
    category: herb.category || 'Other',
    slug: (herb as any).slug || slugify(herb.name),
  }

  const [open, setOpen] = useState(false)
  const [tagsExpanded, setTagsExpanded] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const toggleField = (k: string) =>
    setExpanded(e => ({ ...e, [k]: !e[k] }))
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
    const active = new Set(h.activeConstituents?.map(c => canonicalTag(c.name)) || [])
    return [...h.tags].sort((a, b) => {
      const aActive = active.has(canonicalTag(a))
      const bActive = active.has(canonicalTag(b))
      return aActive === bActive ? 0 : aActive ? -1 : 1
    })
  }, [h])

  const gradient = gradientForCategory(
    h.normalizedCategories?.[0] || h.category
  )

  return (
    <motion.article
      id={`herb-${h.id}`}
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
      aria-label={`Herb card for ${h.name}`}
      whileHover={{
        scale: 1.03,
        boxShadow: '0 0 20px rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(255,255,255,0.1)',
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ layout: { duration: 0.4, ease: 'easeInOut' } }}
      className={`hover-glow card-contrast relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} border border-white/10 p-3 shadow-lg shadow-black/50 ring-1 ring-white/30 backdrop-blur-lg hover:shadow-psychedelic-pink/40 hover:drop-shadow-2xl focus:outline-none focus-visible:shadow-intense focus-visible:ring-2 focus-visible:ring-4 focus-visible:ring-psychedelic-pink focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-space-dark sm:p-6`}
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
              dangerouslySetInnerHTML={{ __html: mark(h.name) }}
            />
          </div>
          {h.scientificName && (
            <p
              className='mt-0.5 text-xs italic text-sand'
              dangerouslySetInnerHTML={{ __html: mark(h.scientificName) }}
            />
          )}
          {h.normalizedCategories?.length > 0 && (
            <div className='flex flex-wrap gap-2 mt-2'>
              {h.normalizedCategories.slice(0, 3).map(tag => (
                <TagBadge key={tag} label={tag} variant={categoryColors[tag] || 'purple'} />
              ))}
            </div>
          )}
          <div className='mt-1 flex flex-wrap items-center gap-2 text-sm text-sand sm:text-base'>
            {(() => {
              const effectText = Array.isArray(h.effects)
                ? h.effects.join(', ')
                : h.effects
              return effectText ? <span>{effectText}</span> : null
            })()}
            {h.affiliateLink && (
              <a
                href={h.affiliateLink}
                target='_blank'
                rel='noopener noreferrer'
                onClick={e => e.stopPropagation()}
                className='rounded bg-lime-700/40 px-2 py-0.5 text-xs text-lime-200 hover:underline'
              >
                Buy Online
              </a>
            )}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={e => {
              e.stopPropagation()
              toggleFavorite(h.id)
            }}
            aria-label={isFavorite(h.id) ? 'Remove favorite' : 'Add favorite'}
            className='rounded-md p-1 text-yellow-400 hover:bg-white/10'
          >
            <Star fill={isFavorite(h.id) ? 'currentColor' : 'none'} size={18} />
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

      <motion.div
        layout
        onHoverStart={() => setTagsExpanded(true)}
        onHoverEnd={() => setTagsExpanded(false)}
        className='mt-2 flex flex-wrap gap-1 text-xs sm:gap-2 sm:text-sm'
      >
        {(tagsExpanded ? sortedTags : sortedTags.slice(0, TAG_LIMIT)).map(tag => (
          <TagBadge
            key={tag}
            label={decodeTag(tag)}
            variant={tagVariant(tag)}
            className={open ? 'animate-pulse' : ''}
          />
        ))}
        {sortedTags.length > TAG_LIMIT && !tagsExpanded && (
          <TagBadge label={`+${sortedTags.length - TAG_LIMIT} more`} variant='yellow' />
        )}
      </motion.div>

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
              {(function () {
                try {
                  const fieldOrder = [
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
                  ]

                  const exclude = new Set([
                    'id',
                    'name',
                    'slug',
                    'tags',
                    'category',
                    'normalizedCategories',
                    'affiliateLink',
                    'activeConstituents',
                    'scientificName',
                    'effects',
                  ])

                  const extras = Object.keys(h).filter(
                    k => !exclude.has(k) && !fieldOrder.includes(k)
                  )
                  const keys = [...fieldOrder, ...extras]
                  return keys.map(key => {
                    const raw = (h as any)[key]
                    if (raw == null || raw === '' || raw === 'N/A') {
                      if (key === 'mechanismOfAction' || key === 'toxicity' || key === 'toxicityLD50') {
                        return (
                          <motion.div key={key} variants={itemVariants}>
                            <span className='font-semibold text-lime-300'>
                              {key.replace(/([A-Z])/g, ' $1') + ':'}
                              {fieldTooltips[key] && (
                                <InfoTooltip text={fieldTooltips[key]} />
                              )}
                            </span>{' '}
                            {UNKNOWN}
                          </motion.div>
                        )
                      }
                      return null
                    }
                    const value = Array.isArray(raw) ? raw.join(', ') : String(raw)
                    if (!value.trim()) return null
                    const display = (
                      <span
                        className={
                          expanded[key] || value.length < 200 ? '' : 'line-clamp-2'
                        }
                      >
                        {value}
                      </span>
                    )
                    return (
                      <motion.div key={key} variants={itemVariants}>
                        <span className='font-semibold text-lime-300'>
                          {key.replace(/([A-Z])/g, ' $1') + ':'}
                          {fieldTooltips[key] && (
                            <InfoTooltip text={fieldTooltips[key]} />
                          )}
                        </span>{' '}
                        {display}
                        {value.length > 200 && (
                          <button
                            type='button'
                            onClick={e => {
                              e.stopPropagation()
                              toggleField(key)
                            }}
                            aria-expanded={!!expanded[key]}
                            className='ml-2 text-sky-300 underline'
                          >
                            {expanded[key] ? 'Show Less' : 'Show More'}
                          </button>
                        )}
                      </motion.div>
                    )
                  })
                } catch (err) {
                  console.error('Render fields failed', err)
                  return null
                }
              })()}

              {h.activeConstituents?.length > 0 && (
                <motion.div variants={itemVariants}>
                  <span className='font-semibold text-lime-300'>Active Compounds:</span>{' '}
                  {h.activeConstituents.map((c, i) => (
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

              {h.tags?.length > 0 && (
                <motion.div
                  variants={itemVariants}
                  className='flex max-h-24 flex-wrap gap-2 overflow-y-auto pt-2 sm:max-h-32'
                >
                  {h.tags.slice(0, 10).map(tag => (
                    <TagBadge
                      key={tag}
                      label={decodeTag(tag)}
                      variant={tagVariant(tag)}
                      className={open ? 'animate-pulse' : ''}
                    />
                  ))}
                </motion.div>
              )}

              {(h.safetyRating || h.toxicity || h.toxicityLD50) && (
                <motion.div variants={itemVariants} className='space-y-1 pt-2'>
                  {h.safetyRating && (
                    <div>
                      <span className='font-semibold text-lime-300'>Safety Rating:</span>{' '}
                      <TagBadge
                        label={h.safetyRating}
                        variant={h.safetyRating?.toString().toLowerCase() === 'low' ? 'green' : 'purple'}
                      />
                    </div>
                  )}
                  {h.toxicity && (
                    <div>
                      <span className='font-semibold text-lime-300'>Toxicity:</span>{' '}
                      {h.toxicity}
                    </div>
                  )}
                  {h.toxicityLD50 && (
                    <div>
                      <span className='font-semibold text-lime-300'>Toxicity LD50:</span>{' '}
                      {h.toxicityLD50}
                    </div>
                  )}
                </motion.div>
              )}
              <motion.div variants={itemVariants} className='pt-2'>
                <Link
                  to={`/herbs/${h.id}`}
                  onClick={e => e.stopPropagation()}
                  className='text-comet underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psychedelic-pink'
                >
                  View full page
                </Link>
                {h.affiliateLink && (
                  <a
                    href={h.affiliateLink}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={e => e.stopPropagation()}
                    className='ml-4 text-sm text-sky-300 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psychedelic-pink'
                  >
                    🌐 Buy Online
                  </a>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

export default function HerbCardAccordion(props: Props) {
  return (
    <ErrorBoundary>
      <HerbCardAccordionInner {...props} />
    </ErrorBoundary>
  )
}
