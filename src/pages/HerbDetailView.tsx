import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { herbs } from '../data/herbs/herbsfull'
import TagBadge from '../components/TagBadge'
import { decodeTag, tagVariant } from '../utils/format'
import { slugify } from '../utils/slugify'
import { useLocalStorage } from '../hooks/useLocalStorage'
import TabContainer from '../components/TabContainer'

export default function HerbDetailView() {
  const { id } = useParams<{ id: string }>()
  const herb = herbs.find(h => h.id === id)
  const [notes, setNotes] = useLocalStorage(`notes-${id}`, '')
  const [copied, setCopied] = React.useState(false)

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

  const shareUrl = `https://thehippiescientist.net/#/herb/${herb.id}`
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const clearNotes = () => setNotes('')

  const overview = (
    <div className='space-y-2'>
      {(() => {
        const eff = Array.isArray(herb.effects) ? herb.effects.join(', ') : herb.effects || ''
        return eff ? (
          <div>
            <span className='font-semibold text-lime-600 dark:text-lime-300'>Effects:</span> {eff}
          </div>
        ) : null
      })()}
      {herb.region && (
        <div>
            <span className='font-semibold text-lime-600 dark:text-lime-300'>Region:</span> {herb.region}
        </div>
      )}
      {(herb as any).history && (
        <div>
            <span className='font-semibold text-lime-600 dark:text-lime-300'>History:</span> {(herb as any).history}
        </div>
      )}
      {Array.isArray(herb.tags) && herb.tags.length > 0 && (
        <div className='flex flex-wrap gap-2 pt-2'>
          {herb.tags.map(tag => (
            <TagBadge key={tag} label={decodeTag(tag)} variant={tagVariant(tag)} />
          ))}
        </div>
      )}
    </div>
  )

  const chemistry = (
    <div className='space-y-2'>
      {Array.isArray(herb.activeConstituents) && herb.activeConstituents.length > 0 && (
        <div>
            <span className='font-semibold text-lime-600 dark:text-lime-300'>Compounds:</span>{' '}
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
      {herb.mechanismOfAction && (
        <div>
            <span className='font-semibold text-lime-600 dark:text-lime-300'>Mechanism:</span> {herb.mechanismOfAction}
        </div>
      )}
      {herb.toxicityLD50 && (
        <div>
            <span className='font-semibold text-lime-600 dark:text-lime-300'>LD50:</span> {herb.toxicityLD50}
        </div>
      )}
    </div>
  )

  const usage = (
    <div className='space-y-2'>
      {herb.preparation && (
        <div>
            <span className='font-semibold text-lime-600 dark:text-lime-300'>Prep:</span> {herb.preparation}
        </div>
      )}
      {herb.intensity && (
        <div>
            <span className='font-semibold text-lime-600 dark:text-lime-300'>Intensity:</span> {herb.intensity}
        </div>
      )}
      {herb.dosage && (
        <div>
            <span className='font-semibold text-lime-600 dark:text-lime-300'>Dosage:</span> {herb.dosage}
        </div>
      )}
      {herb.affiliateLink && herb.affiliateLink.startsWith('http') ? (
        <a
          href={herb.affiliateLink}
          target='_blank'
          rel='noopener noreferrer'
          className='text-sky-300 underline'
        >
          Buy Online
        </a>
      ) : (
        <span className='text-sm text-sand/60'>No affiliate link available.</span>
      )}
      <div>
        <h3 className='text-xl font-bold text-sky-300'>Usage Log</h3>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className='mt-2 w-full rounded-md bg-black/20 p-2 text-white'
          rows={5}
        />
        <div className='flex items-center gap-4 pt-2'>
          {notes && <span className='text-sm text-sand/80'>Saved</span>}
          {notes && (
            <button type='button' onClick={clearNotes} className='text-sky-300 underline'>
              Clear Notes
            </button>
          )}
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview', label: 'Overview', content: overview },
    { id: 'chemistry', label: 'Chemistry', content: chemistry },
    { id: 'usage', label: 'Usage', content: usage },
  ]

  const effectsSummary = Array.isArray(herb.effects) ? herb.effects.join(', ') : herb.effects || ''
  const summary = `${herb.name} is classified as ${herb.category}. Known effects include ${effectsSummary}.`

  return (
    <>
      <Helmet>
        <title>{herb.name} - The Hippie Scientist</title>
        {herb.description && <meta name='description' content={herb.description} />}
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='mx-auto max-w-3xl space-y-6 px-6 py-12'
      >
        <Link to='/database' className='text-comet underline'>
          ← Back
        </Link>
        <h1 className='text-gradient flex items-center gap-2 text-4xl font-bold'>
          <span>{herb.name}</span>
        </h1>
        {herb.scientificName && (
          <p className='italic text-gray-600'>{herb.scientificName}</p>
        )}
        <button
          type='button'
          onClick={copyLink}
          className='rounded-md bg-black/30 px-3 py-2 text-sm text-sand backdrop-blur-md hover:bg-white/10'
        >
          {copied ? '✅ Copied!' : 'Share \uD83D\uDD17'}
        </button>
        <TabContainer tabs={tabs} />
        <details className='rounded-md bg-slate-800/40 p-4'>
          <summary className='cursor-pointer text-sky-300'>🧬 Summarize This Herb</summary>
          <p className='mt-2'>{summary}</p>
        </details>
      </motion.div>
    </>
  )
}
