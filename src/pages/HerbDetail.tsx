import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { herbs } from '../data/herbs'
import { decodeTag, tagVariant, safetyColorClass } from '../utils/format'
import TagBadge from '../components/TagBadge'
import { slugify } from '../utils/slugify'
import { useLocalStorage } from '../hooks/useLocalStorage'

function findSimilar(current: any) {
  const scores = herbs.map(h => {
    if (h.id === current.id) return { h, score: -1 }
    let score = 0
    const tags = new Set(h.tags)
    const effects = new Set(h.effects || [])
    current.tags.forEach((t: string) => {
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

export default function HerbDetail() {
  const { id } = useParams<{ id: string }>()
  const herb = herbs.find(h => h.id === id)
  const [notes, setNotes] = useLocalStorage(`notes-${id}`, '')
  const [showSimilar, setShowSimilar] = React.useState(false)
  if (!herb) {
    return (
      <div className='p-6 text-center'>
        <p>Herb not found.</p>
        <Link to='/database' className='text-comet underline'>
          Back to database
        </Link>
      </div>
    )
  }
  const similar = React.useMemo(() => findSimilar(herb), [herb])
  const summary = `${herb.name} is classified as ${herb.category}. Known effects include ${(herb.effects || []).join(', ')}.`
  return (
    <>
      <Helmet>
        <title>{herb.name} - The Hippie Scientist</title>
        {herb.description && (
          <meta name='description' content={herb.description} />
        )}
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='mx-auto max-w-3xl space-y-6 px-6 py-12'
      >
        <Link to='/database' className='text-comet underline'>
          ← Back
        </Link>
        <h1 className='text-gradient text-4xl font-bold'>{herb.name}</h1>
        {herb.scientificName && <p className='italic'>{herb.scientificName}</p>}
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
            const raw = (herb as any)[key]
            if (!raw) return null
            return (
              <div key={key}>
                <span className='font-semibold text-lime-300'>
                  {key.replace(/([A-Z])/g, ' $1')}:
                </span>{' '}
                {key === 'safetyRating' ? (
                  <span className={safetyColorClass(raw)}>{raw}</span>
                ) : (
                  raw
                )}
              </div>
            )
          })}
          {herb.activeConstituents?.length > 0 && (
            <div>
              <span className='font-semibold text-lime-300'>Active Compounds:</span>{' '}
              {herb.activeConstituents.map((c, i) => (
                <React.Fragment key={c.name}>
                  {i > 0 && ', '}
                  <Link className='text-sky-300 underline' to={`/compounds#${slugify(c.name)}`}>
                    {c.name}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          )}
          {herb.affiliateLink && herb.affiliateLink.startsWith('http') && (
            <a
              href={herb.affiliateLink}
              target='_blank'
              rel='noopener noreferrer'
              className='text-sky-300 underline'
            >
              Buy Online
            </a>
          )}
          <div className='flex flex-wrap gap-2 pt-2'>
            {herb.tags.map(tag => (
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
      {herb.affiliateLink && herb.affiliateLink.startsWith('http') && (
        <a
          href={herb.affiliateLink}
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
