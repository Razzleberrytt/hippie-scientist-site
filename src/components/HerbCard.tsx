import { useState } from 'react'
import type { Herb } from '../types'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Dna, FlaskConical, Pill, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import { decodeTag, safetyColorClass } from '../utils/format'

interface Props {
  herb: Herb
}

const categoryColors: Record<string, string> = {
  Oneirogen: 'text-pink-400',
  'Dissociative / Sedative': 'text-blue-400',
  'Empathogen / Euphoriant': 'text-green-400',
  'Ritual / Visionary': 'text-violet-400',
  Other: 'text-orange-400',
}

export default function HerbCard({ herb }: Props) {
  const [open, setOpen] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  const safetyColor = safetyColorClass(herb.safetyRating)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      className='glass-card overflow-hidden rounded-lg transition-shadow hover:shadow-glow hover:ring-2 hover:ring-lichen/50'
    >
      <button
        type='button'
        onClick={() => setOpen(!open)}
        className='flex w-full items-start justify-between p-4 text-left transition active:scale-95'
        aria-expanded={open}
      >
        <div>
          <h2 className='text-lg font-semibold leading-snug'>{herb.name}</h2>
          {herb.scientificName && (
            <p className='text-xs italic text-gray-400'>{herb.scientificName}</p>
          )}
          <div className='mt-2 flex flex-wrap gap-1'>
            {herb.tags.map(tag => {
              const decoded = decodeTag(tag)
              const match = decoded.match(/^(\p{Extended_Pictographic})(.*)/u)
              const icon = match?.[1] || ''
              const label = match ? match[2].trim() : decoded
              const color = categoryColors[herb.category] ?? 'text-purple-300'
              return (
                <span key={tag} className='tag-pill'>
                  {icon && <span className={color}>{icon}</span>} {label}
                </span>
              )
            })}
          </div>
        </div>
        <ChevronDown className={clsx('mt-1 h-5 w-5 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key='content'
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className='space-y-3 overflow-hidden px-4 pb-4 text-sm text-gray-200'
          >
            <div className='flex flex-wrap gap-x-6 gap-y-1'>
              <p>
                <strong>Category:</strong> {herb.category}
              </p>
              <p>
                <strong>Intensity:</strong> {herb.intensity}
              </p>
              <p>
                <strong>Onset:</strong> {herb.onset}
              </p>
              <p>
                <strong>Preparation:</strong> {herb.preparation}
              </p>
            </div>
            <div className='my-2 h-px bg-gradient-to-r from-transparent via-lichen/20 to-transparent' />
            <div className='flex flex-wrap gap-x-6 gap-y-1'>
              <p>
                <strong>Region:</strong> {herb.region}
              </p>
              <p>
                <strong>Legal:</strong> {herb.legalStatus}
              </p>
              <p>
                <strong>Safety:</strong>{' '}
                <span className={safetyColor}>{herb.safetyRating ?? 'N/A'}</span>
              </p>
            </div>
            {herb.effects.length > 0 && (
              <div>
                <strong className='bg-gradient-to-tr from-pink-400 to-violet-600 bg-clip-text text-transparent'>
                  Effects:
                </strong>
                <ul className='ml-4 list-disc text-sm text-slate-300'>
                  {herb.effects.map(e => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
            {herb.description && <p>{herb.description}</p>}

            {(
              [
                {
                  key: 'moa',
                  title: 'Mechanism of Action',
                  content: herb.mechanismOfAction,
                  icon: Dna,
                },
                {
                  key: 'pk',
                  title: 'Pharmacokinetics',
                  content: herb.pharmacokinetics,
                  icon: FlaskConical,
                },
                { key: 'thera', title: 'Therapeutic Uses', content: herb.therapeuticUses },
                { key: 'side', title: 'Side Effects', content: herb.sideEffects },
                { key: 'contra', title: 'Contraindications', content: herb.contraindications },
                {
                  key: 'drug',
                  title: 'Drug Interactions',
                  content: herb.drugInteractions,
                  icon: Pill,
                },
                {
                  key: 'tox',
                  title: 'Toxicity / LD50',
                  content: herb.toxicity || herb.toxicityLD50,
                  icon: AlertTriangle,
                },
              ] as {
                key: string
                title: string
                content?: string
                icon?: React.ComponentType<{ className?: string }>
              }[]
            ).map(
              ({ key, title, content, icon: Icon }) =>
                content && (
                  <div key={key} className='pt-1'>
                    <button
                      type='button'
                      onClick={() => setOpenSections(s => ({ ...s, [key]: !s[key] }))}
                      className='flex w-full items-center gap-2 text-left font-medium transition active:scale-95'
                      aria-expanded={openSections[key] ?? false}
                    >
                      {Icon && <Icon className='h-4 w-4 text-pink-400' />}
                      <span>{title}</span>
                      <ChevronDown
                        className={clsx(
                          'ml-auto h-4 w-4 transition-transform',
                          openSections[key] && 'rotate-180'
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {openSections[key] && (
                        <motion.div
                          key='content'
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className='overflow-hidden pl-6 text-gray-300'
                        >
                          <p className='mt-1'>{content}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
            )}
            {herb.sourceRefs && herb.sourceRefs.length > 0 && (
              <div className='text-xs text-gray-400'>
                <strong className='text-sm text-gray-300'>Sources:</strong>
                <ul className='ml-4 list-decimal'>
                  {herb.sourceRefs.map((ref, i) => (
                    <li key={ref}>
                      <a
                        href={ref}
                        className='underline decoration-dotted'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        [{i + 1}] {ref}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
