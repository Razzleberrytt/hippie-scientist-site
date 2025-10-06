import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Herb } from '../types/Herb'
import TagBadge from './TagBadge'
import InfoTooltip from './InfoTooltip'
import CompoundBadge from './CompoundBadge'
import { decodeTag, tagVariant } from '../utils/format'
import { useHerbFavorites } from '../hooks/useHerbFavorites'
import { Star } from 'lucide-react'
import { slugify } from '../utils/slugify'
import { herbBlurbs } from '../data/herbs/blurbs'
import { herbName, splitField } from '../utils/herb'

interface Props {
  herb: Herb
}

export default function HerbCardAccordion({ herb }: Props) {
  const [expanded, setExpanded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const { toggle, isFavorite } = useHerbFavorites()

  const toggleExpanded = () => setExpanded(prev => !prev)

  useEffect(() => {
    if (expanded && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      const viewH = window.innerHeight || document.documentElement.clientHeight
      if (rect.bottom > viewH || rect.top < 0) {
        cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }, [expanded])
  const pickString = (...values: unknown[]): string => {
    for (const value of values) {
      if (typeof value === 'string') {
        const trimmed = value.trim()
        if (trimmed) return trimmed
      }
    }
    return ''
  }
  const joinList = (list: string[]): string => list.join('; ')

  const safeTags = splitField((herb as any).tags ?? herb.tags)
  const safeEffects = splitField(herb.effects)
  const safeCompounds = splitField((herb as any).compounds ?? herb.compounds)
  const sources = splitField((herb as any).sources ?? herb.sources)
  const prepList = splitField((herb as any).preparations ?? herb.preparations)
  const interactionsList = splitField((herb as any).interactions ?? herb.interactions)
  const contraindicationsList = splitField((herb as any).contraindications ?? herb.contraindications)
  const sideEffectsList = splitField(
    (herb as any).sideeffects ?? (herb as any).sideEffects ?? herb.sideeffects
  )
  const regionTags = splitField(
    (herb as any).regiontags ?? (herb as any).regionTags ?? herb.regiontags
  )
  const favorite = isFavorite(herb.id)

  const scientificName = pickString(
    herb.scientific,
    (herb as any).scientificname,
    (herb as any).scientificName
  )
  const mechanism = pickString(
    herb.mechanism,
    (herb as any).mechanismOfAction,
    (herb as any).mechanismofaction
  )
  const pharmacokinetics = pickString((herb as any).pharmacokinetics)
  const region = pickString(herb.region, (herb as any).regionNotes)
  const therapeutic = pickString(herb.therapeutic, (herb as any).therapeuticUses)
  const safety = pickString(herb.safety, (herb as any).safetyrating)
  const legalStatus = pickString(
    herb.legalstatus,
    (herb as any).legalStatus,
    (herb as any).legalstatusClean
  )
  const scheduleText = pickString(
    herb.schedule,
    (herb as any).schedule_text,
    (herb as any).scheduleText
  )
  const legalNotes = pickString(herb.legalnotes, (herb as any).legalNotes)
  const dosage = pickString(herb.dosage, (herb as any).dosage_notes)
  const onset = pickString((herb as any).onset)
  const duration = pickString((herb as any).duration)
  const intensity = pickString(
    (herb as any).intensity_label,
    herb.intensity,
    (herb as any).intensityClean
  )
  const categoryLabel = pickString(
    (herb as any).category_label,
    herb.category
  )
  const subcategory = pickString(herb.subcategory)
  const toxicityNotes = pickString(herb.toxicity)
  const toxicityLD50 = pickString(
    herb.toxicity_ld50,
    (herb as any).toxicityLD50,
    (herb as any).toxicityld50
  )
  const descriptionText = pickString(herb.description, herbBlurbs[herbName(herb)])
  const summaryBlurb = pickString(herbBlurbs[herbName(herb)])

  const preparationsText = joinList(prepList)
  const sideEffectsText = joinList(sideEffectsList)
  const contraindicationsText = joinList(contraindicationsList)
  const interactionsText = joinList(interactionsList)

  const hasInfo = Boolean(
    mechanism ||
      pharmacokinetics ||
      toxicityNotes ||
      toxicityLD50 ||
      region ||
      therapeutic ||
      safety ||
      sideEffectsText ||
      contraindicationsText ||
      interactionsText ||
      legalStatus ||
      scheduleText ||
      legalNotes ||
      dosage ||
      onset ||
      duration ||
      intensity ||
      preparationsText ||
      safeCompounds.length > 0 ||
      sources.length > 0 ||
      regionTags.length > 0
  )

  const metaLineParts = [categoryLabel, subcategory, intensity].filter(Boolean)
  const metaLine = metaLineParts.join(' • ')
  const legalLine = [legalStatus, scheduleText].filter(Boolean).join(' • ')

  const containerVariants = {
    open: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
    collapsed: { transition: { staggerDirection: -1, staggerChildren: 0.05 } },
  }

  const itemVariants = {
    open: { opacity: 1, y: 0, scale: 1 },
    collapsed: { opacity: 0, y: -8, scale: 0.95 },
  }

  return (
    <motion.article
      ref={cardRef}
      layout
      transition={{ layout: { type: 'spring', stiffness: 200, damping: 20 } }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={toggleExpanded}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          toggleExpanded()
        }
      }}
      id={slugify(herbName(herb))}
      role='button'
      tabIndex={0}
      aria-expanded={expanded}
      className='glassmorphic-card soft-border-glow group relative cursor-pointer overflow-hidden p-4 text-shadow text-gray-100'
    >
      <motion.div
        className='pointer-events-none absolute inset-0 rounded-lg border-2 border-fuchsia-500/40 dark:rounded-2xl'
        animate={expanded ? { opacity: 1, scale: 1.05 } : { opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      />
      <button
        type='button'
        onClick={e => {
          e.stopPropagation()
          toggle(herb.id)
        }}
        className='hover-glow absolute right-3 top-3 rounded-full bg-black/40 p-1 text-sand backdrop-blur-md hover:bg-white/10'
        aria-label='Toggle favorite'
      >
        <Star className={`h-5 w-5 ${favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
      </button>
      <div className='flex items-center gap-2'>
        <span className='text-xl font-bold text-lime-600 transition group-hover:text-lime-700 group-hover:drop-shadow-[0_0_6px_rgba(163,255,134,0.8)] dark:text-lime-300 dark:group-hover:text-lime-200'>
          {herbName(herb) || herb.slug || 'Herb'}
        </span>
      </div>
      {scientificName && (
        <p className='text-sm italic text-gray-700 dark:text-gray-300 transition-colors duration-300'>{scientificName}</p>
      )}
      {metaLine && (
        <p className='mt-1 text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400'>{metaLine}</p>
      )}
      {legalLine && (
        <p className='mt-0.5 text-xs text-gray-600 dark:text-gray-400'>{legalLine}</p>
      )}
      {regionTags.length > 0 && (
        <div className='mt-1 flex flex-wrap gap-1 text-[0.65rem] uppercase tracking-wide text-emerald-900 dark:text-emerald-200'>
          {regionTags.map(tag => (
            <span
              key={tag}
              className='rounded-full bg-emerald-400/30 px-2 py-0.5 font-semibold dark:bg-emerald-300/20'
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {!expanded && summaryBlurb && (
        <p className='mt-1 text-sm italic text-gray-800 dark:text-gray-100 transition-colors duration-300'>
          {summaryBlurb}
        </p>
      )}

      {expanded && (
        <>
          {safeEffects.length > 0 && (
            <div className='mt-2 text-sm text-gray-800 dark:text-white'>
              <strong>Effects:</strong> {safeEffects.join(', ')}
            </div>
          )}

          {descriptionText && (
            <div className='mt-2 text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300'>
              <strong>Description:</strong> {descriptionText}
            </div>
          )}
        </>
      )}

      <div className='mt-2 flex max-w-full flex-wrap gap-2'>
        {safeTags.map(tag => (
          <TagBadge key={tag} label={decodeTag(tag)} variant={tagVariant(tag)} />
        ))}
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            layout
            variants={containerVariants}
            initial='collapsed'
            animate='open'
            exit='collapsed'
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
            className='mt-4 space-y-2 text-sm text-sand'
          >
            {hasInfo ? (
              <>
                {mechanism && (
                  <motion.p key='mechanism' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <span role='img' aria-label='Mechanism'>
                      🧠
                    </span>{' '}
                    {mechanism}
                  </motion.p>
                )}
                {pharmacokinetics && (
                  <motion.p key='pharmacokinetics' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <span role='img' aria-label='Pharmacokinetics'>
                      ⏳
                    </span>{' '}
                    {pharmacokinetics}
                  </motion.p>
                )}
                {toxicityNotes && (
                  <motion.p key='toxicity-notes' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <span role='img' aria-label='Toxicity Notes'>
                      🧪
                    </span>{' '}
                    {toxicityNotes}
                  </motion.p>
                )}
                {toxicityLD50 && (
                  <motion.p key='toxicity-ld50' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <span role='img' aria-label='LD50'>
                      📉
                    </span>{' '}
                    LD50: {toxicityLD50}
                  </motion.p>
                )}
                {region && (
                  <motion.p key='region' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <span role='img' aria-label='Region'>
                      🌎
                    </span>{' '}
                    {region}
                  </motion.p>
                )}
                {therapeutic && (
                  <motion.p key='therapeutic' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <strong>Therapeutic Uses:</strong> {therapeutic}
                  </motion.p>
                )}
                {safety && (
                  <motion.p key='safety' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <strong>Safety:</strong> {safety}
                  </motion.p>
                )}
                {preparationsText && (
                  <motion.p key='preparations' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <strong>Preparations:</strong> {preparationsText}
                  </motion.p>
                )}
                {sideEffectsText && (
                  <motion.p key='sideeffects' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <strong>Side Effects:</strong> {sideEffectsText}
                  </motion.p>
                )}
                {contraindicationsText && (
                  <motion.p key='contraindications' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <strong>Contraindications:</strong> {contraindicationsText}
                  </motion.p>
                )}
                {interactionsText && (
                  <motion.p key='interactions' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <strong>Interactions:</strong> {interactionsText}
                  </motion.p>
                )}
                {legalStatus && (
                  <motion.p key='legal' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <strong>Legal Status:</strong> {legalStatus}
                  </motion.p>
                )}
                {scheduleText && (
                  <motion.p key='schedule' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <strong>Schedule:</strong> {scheduleText}
                  </motion.p>
                )}
                {legalNotes && (
                  <motion.p key='legalnotes' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <strong>Legal Notes:</strong> {legalNotes}
                  </motion.p>
                )}
                {dosage && (
                  <motion.p key='dosage' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <strong>Dosage:</strong> {dosage}
                  </motion.p>
                )}
                {onset && (
                  <motion.p key='onset' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <strong>Onset:</strong> {onset}
                  </motion.p>
                )}
                {duration && (
                  <motion.p key='duration' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <strong>Duration:</strong> {duration}
                  </motion.p>
                )}
                {intensity && (
                  <motion.p key='intensity' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <strong>Intensity:</strong> {intensity}
                  </motion.p>
                )}
                {safeCompounds.length > 0 && (
                  <motion.div key='compounds' variants={itemVariants} className='flex flex-wrap items-center gap-1'>
                    <strong className='mr-1'>Active Compounds:</strong>
                    {safeCompounds.map(c => (
                      <CompoundBadge key={c} name={c} />
                    ))}
                  </motion.div>
                )}
                {sources.length > 0 && (
                  <motion.div key='sources' variants={itemVariants}>
                    <strong>Sources:</strong>
                    <ul className='list-inside list-disc space-y-1 pl-4'>
                      {sources.map(src => (
                        <li key={src} className='whitespace-pre-wrap break-words'>
                          {src.startsWith('http') ? (
                            <a
                              href={src}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-sky-300 underline'
                            >
                              {src}
                            </a>
                          ) : (
                            src
                          )}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.p variants={itemVariants} className='text-sm opacity-70'>
                No additional information available for this section yet.
              </motion.p>
            )}
            {herb.slug && (
              <motion.div variants={itemVariants}>
                <InfoTooltip text='Open full herb page'>
                  <Link to={`/herbs/${herb.slug}`} className='text-sky-300 underline'>
                    View Full Herb
                  </Link>
                </InfoTooltip>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}
