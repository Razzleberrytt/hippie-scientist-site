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
  const safeTags = splitField(herb.tags)
  const safeEffects = splitField(herb.effects)
  const rawCompounds = (herb as any).compounds
  const safeCompounds = Array.isArray(rawCompounds)
    ? rawCompounds.filter(Boolean)
    : splitField(rawCompounds)
  const rawSources = (herb as any).sources
  const sources = Array.isArray(rawSources) ? rawSources.filter(Boolean) : splitField(rawSources)
  const favorite = isFavorite(herb.id)

  const scientificName = (herb.scientificname || (herb as any).scientific || '').trim()
  const mechanism = (herb as any).mechanismOfAction
    ? String((herb as any).mechanismOfAction).trim()
    : ''
  const pharmacokinetics = (herb as any).pharmacokinetics
    ? String((herb as any).pharmacokinetics).trim()
    : ''
  const toxicityInfo = ((herb as any).toxicityLD50 || (herb as any).toxicity || '').toString().trim()
  const region = (herb as any).region ? String((herb as any).region).trim() : ''
  const therapeutic = (herb as any).therapeuticUses
    ? String((herb as any).therapeuticUses).trim()
    : ''
  const sideEffects = (herb as any).sideEffects ? String((herb as any).sideEffects).trim() : ''
  const contraindications = (herb as any).contraindications
    ? String((herb as any).contraindications).trim()
    : ''
  const drugInteractions = (herb as any).drugInteractions
    ? String((herb as any).drugInteractions).trim()
    : ''
  const legalStatus = (herb as any).legalStatus ? String((herb as any).legalStatus).trim() : ''
  const dosage = (herb as any).dosage ? String((herb as any).dosage).trim() : ''
  const onset = (herb as any).onset ? String((herb as any).onset).trim() : ''
  const duration = (herb as any).duration ? String((herb as any).duration).trim() : ''
  const intensityLevel = ((herb as any).intensityLevel || herb.intensityLevel || '').toString().trim().toLowerCase()
  const intensityLabel = (herb as any).intensityLabel
    ? String((herb as any).intensityLabel).trim()
    : intensityLevel
    ? `${intensityLevel.charAt(0).toUpperCase()}${intensityLevel.slice(1)}`
    : ''
  const intensityTone = intensityLevel.includes('strong')
    ? 'bg-rose-500/20 text-rose-100 ring-1 ring-rose-300/40'
    : intensityLevel.includes('moderate')
    ? 'bg-amber-500/20 text-amber-100 ring-1 ring-amber-300/40'
    : intensityLevel.includes('mild')
    ? 'bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-300/40'
    : intensityLevel.includes('variable')
    ? 'bg-sky-500/20 text-sky-100 ring-1 ring-sky-300/40'
    : 'bg-white/6 text-white/90 ring-1 ring-white/15'
  const benefits = (herb as any).benefits ? String((herb as any).benefits).trim() : ''
  const descriptionText = (herb.description || herbBlurbs[herbName(herb)] || '').trim()
  const hasInfo = Boolean(
    mechanism ||
      pharmacokinetics ||
      toxicityInfo ||
      region ||
      therapeutic ||
      sideEffects ||
      contraindications ||
      drugInteractions ||
      legalStatus ||
      dosage ||
      onset ||
      duration ||
      intensityLabel ||
      benefits ||
      safeCompounds.length > 0 ||
      sources.length > 0
  )

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
      id={slugify(herbName(herb))}
      className='group relative overflow-hidden rounded-3xl bg-white/14 p-4 text-shadow text-gray-100 ring-1 ring-white/12 shadow-[0_10px_40px_-10px_rgba(0,0,0,.6)] backdrop-blur-xl'
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
        className='hover-glow absolute right-3 top-3 rounded-full bg-white/6 p-1 text-sand ring-1 ring-white/15 backdrop-blur-xl hover:bg-white/9'
        aria-label='Toggle favorite'
      >
        <Star className={`h-5 w-5 ${favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
      </button>
      <button
        type='button'
        onClick={toggleExpanded}
        aria-expanded={expanded}
        className='w-full bg-transparent p-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400'
      >
        <div className='flex items-center gap-2'>
          <span className='text-xl font-bold text-lime-600 transition group-hover:text-lime-700 group-hover:drop-shadow-[0_0_6px_rgba(163,255,134,0.8)] dark:text-lime-300 dark:group-hover:text-lime-200'>
            {herbName(herb) || herb.slug || 'Herb'}
          </span>
        </div>
        {scientificName && (
          <p className='text-sm italic text-gray-700 dark:text-gray-300 transition-colors duration-300'>{scientificName}</p>
        )}
        {!expanded && herbBlurbs[herbName(herb)] && (
          <p className='mt-1 text-sm italic text-gray-800 dark:text-gray-100 transition-colors duration-300'>
            {herbBlurbs[herbName(herb)]}
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
          {intensityLabel && (
            <span className={`pill text-[12px] ${intensityTone}`}>
              <span className='font-semibold uppercase tracking-wide text-[11px] text-white/80'>Intensity:</span>&nbsp;{intensityLabel}
            </span>
          )}
          {benefits && (
            <span className='pill text-[12px]'>{benefits}</span>
          )}
        </div>
      </button>

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
                {toxicityInfo && (
                  <motion.p key='toxicity' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <span role='img' aria-label='Toxicity'>
                      🧪
                    </span>{' '}
                    {toxicityInfo}
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
                {sideEffects && (
                  <motion.p key='sideeffects' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <strong>Side Effects:</strong> {sideEffects}
                  </motion.p>
                )}
                {contraindications && (
                  <motion.p key='contraindications' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <strong>Contraindications:</strong> {contraindications}
                  </motion.p>
                )}
                {drugInteractions && (
                  <motion.p key='interactions' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <strong>Drug Interactions:</strong> {drugInteractions}
                  </motion.p>
                )}
                {legalStatus && (
                  <motion.p key='legal' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <strong>Legal Status:</strong> {legalStatus}
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
                {intensityLabel && (
                  <motion.p key='intensity' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <strong>Intensity:</strong> {intensityLabel || 'Unknown'}
                  </motion.p>
                )}
                {benefits && (
                  <motion.p key='benefits' variants={itemVariants} className='whitespace-pre-wrap break-words'>
                    <strong>Benefits:</strong> {benefits}
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
