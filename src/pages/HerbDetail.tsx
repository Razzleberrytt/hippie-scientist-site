import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { herbs } from '../data/herbs'
import { safeRenderHerb } from '../utils/safeRenderHerb'
import { safeHerbField } from '../utils/safeHerbField'
import { decodeTag, tagVariant } from '../utils/format'
import TagBadge from '../components/TagBadge'
import { slugify } from '../utils/slugify'
import { useLocalStorage } from '../hooks/useLocalStorage'
import ErrorBoundary from '../components/ErrorBoundary'

function findSimilar(current: any) {
  const scores = herbs.map(h => {
    if (h.id === current.id) return { h, score: -1 }
    let score = 0
    const tags = new Set(h.tags ?? [])
    const effects = new Set(h.effects || [])
    ;(current.tags ?? []).forEach((t: string) => {
      if (tags.has(t)) score += 2
    })
    ;(current.effects || []).forEach((e: string) => {
      if (effects.has(e)) score += 1
    })
    if (
      current.mechanismOfAction &&
      h.mechanismOfAction &&
      current.mechanismOfAction === h.mechanismOfAction
    )
      score += 2
    return { h, score }
  })
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .filter(x => x.score > 0)
    .map(x => x.h)
}

function HerbDetailInner() {
  const { id } = useParams<{ id: string }>()
  const herbRaw = herbs.find(h => h.id === id)
  const herb = safeRenderHerb(herbRaw || {})
  const [notes, setNotes] = useLocalStorage(`notes-${id}`, '')
  const [showSimilar, setShowSimilar] = React.useState(false)

  if (!herbRaw) {
    console.warn('Herb not found or malformed:', id)
    return (
      <div className='p-6 text-center'>
        <p>Herb not found.</p>
        <Link to='/database' className='text-comet underline'>
          Back to database
        </Link>
      </div>
    )
  }

  const h = {
    ...herb,
    name: safeHerbField(herb.name, 'Unnamed Herb'),
    description: safeHerbField(herb.description, ''),
    category: safeHerbField(herb.category, 'Other'),
    tags: Array.isArray(herb.tags) ? herb.tags : [],
    effects: Array.isArray(herb.effects) ? herb.effects : [],
    slug: (herb as any).slug || slugify(safeHerbField(herb.name, '')),
  }

  if (!herbRaw?.name || !herbRaw?.description) {
    console.warn('Incomplete herb data', id, herbRaw)
  }

  const similar = React.useMemo(() => findSimilar(h), [h])
  const summary = `${h.name} is classified as ${h.category}. Known effects include ${h.effects.join(', ')}.`

  return (
    <>
      <Helmet>
        <title>{h.name} - The Hippie Scientist</title>
        {h.description && <meta name='description' content={h.description} />}
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='mx-auto max-w-3xl space-y-6 px-6 py-12'
      >
        <Link to='/database' className='text-comet underline'>
          ← Back
        </Link>
        <h1 className='text-gradient text-4xl font-bold'>{h.name}</h1>
        {h.scientificName && <p className='italic'>{h.scientificName}</p>}
        <div className='space-y-2'>
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
            const raw = (h as any)[key]
            const isArray = Array.isArray(raw)
            const safe = isArray ? (raw as any[]) : safeHerbField(raw, '')
            if (!isArray && safe === '') return null
            const value = isArray ? (safe as any[]).join(', ') : String(safe)
            return (
              <div key={key}>
                <span className='font-semibold text-lime-300'>
                  {key.replace(/([A-Z])/g, ' $1')}:
                </span>{' '}
                {value}
              </div>
            )
          })}
          {h.activeConstituents?.length > 0 && (
            <div>
              <span className='font-semibold text-lime-300'>Active Compounds:</span>{' '}
              {h.activeConstituents.map((c, i) => (
                <React.Fragment key={c.name}>
                  {i > 0 && ', '}
                  <Link className='text-sky-300 underline' to={`/compounds#${slugify(c.name)}`}>
                    {c.name}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          )}
          {h.affiliateLink && h.affiliateLink.startsWith('http') && (
            <a
              href={h.affiliateLink}
              target='_blank'
              rel='noopener noreferrer'
              className='text-sky-300 underline'
            >
              Buy Online
            </a>
          )}
          <div className='flex flex-wrap gap-2 pt-2'>
            {h.tags?.map(tag => (
              <TagBadge key={tag} label={decodeTag(tag)} variant={tagVariant(tag)} />
            ))}
          </div>
        </div>
        <button
          type='button'
          className='rounded-md bg-gradient-to-r from-violet-900 to-sky-900 px-3 py-2 text-white hover:opacity-90'
          onClick={() => setShowSimilar(s => !s)}
        >
          🧠 Smart Explore
        </button>
        {showSimilar && similar.length > 0 && (
          <div className='space-y-2'>
            <h2 className='mt-4 text-2xl font-bold text-sky-300'>Similar Herbs</h2>
            <ul className='list-inside list-disc'>
              {similar.map(h => (
                <li key={h.id}>
                  <Link className='text-comet underline' to={`/herbs/${h.id}`}>
                    {h.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h2 className='text-2xl font-bold text-sky-300'>Your Notes</h2>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className='mt-2 w-full rounded-md bg-black/20 p-2 text-white'
            rows={5}
          />
        </div>
        <details className='rounded-md bg-slate-800/40 p-4'>
          <summary className='cursor-pointer text-sky-300'>🧬 Summarize This Herb</summary>
          <p className='mt-2'>{summary}</p>
        </details>
      </motion.div>
      {h.affiliateLink && h.affiliateLink.startsWith('http') && (
        <a
          href={h.affiliateLink}
          target='_blank'
          rel='noopener noreferrer'
          className='fixed bottom-4 right-4 z-20 rounded-full bg-gradient-to-r from-violet-600 to-sky-600 px-4 py-3 text-white shadow-lg hover:shadow-xl'
        >
          Buy Online
        </a>
      )}
    </>
  )
}

export default function HerbDetail() {
  return (
    <ErrorBoundary>
      <HerbDetailInner />
    </ErrorBoundary>
  )
}
