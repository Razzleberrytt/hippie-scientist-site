import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { herbs } from '../data/herbs'
import TagBadge from '../components/TagBadge'
import { safeRenderHerb } from '../utils/safeRenderHerb'
import { safeHerbField } from '../utils/safeHerbField'
import { decodeTag, tagVariant } from '../utils/format'
import { slugify } from '../utils/slugify'
import { useLocalStorage } from '../hooks/useLocalStorage'
import TabContainer from '../components/TabContainer'

export default function HerbDetailView() {
  const { id } = useParams<{ id: string }>()
  const herbRaw = herbs.find(h => h.id === id)
  const herb = safeRenderHerb(herbRaw || {})
  const h = {
    ...herb,
    name: safeHerbField(herb.name, 'Unnamed Herb'),
    description: safeHerbField(herb.description, ''),
    category: safeHerbField(herb.category, 'Other'),
    tags: Array.isArray(herb.tags) ? herb.tags : [],
    effects: Array.isArray(herb.effects) ? herb.effects : [],
    slug: (herb as any).slug || slugify(safeHerbField(herb.name, '')),
  }
  const [notes, setNotes] = useLocalStorage(`notes-${id}`, '')
  const [copied, setCopied] = React.useState(false)

  if (!herbRaw?.name || !herbRaw?.description) {
    console.warn('Incomplete herb data', id, herbRaw)
  }

  if (!herbRaw) {
    return (
      <div className='p-6 text-center'>
        <p>Herb not found.</p>
        <Link to='/database' className='text-comet underline'>
          Back to database
        </Link>
      </div>
    )
  }

  const shareUrl = `https://thehippiescientist.net/#/herb/${h.id}`
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
        const eff = Array.isArray(h.effects) ? h.effects.join(', ') : h.effects || ''
        return eff ? (
          <div>
            <span className='font-semibold text-lime-300'>Effects:</span> {eff}
          </div>
        ) : null
      })()}
      {h.region && (
        <div>
          <span className='font-semibold text-lime-300'>Region:</span> {h.region}
        </div>
      )}
      {(h as any).history && (
        <div>
          <span className='font-semibold text-lime-300'>History:</span> {(h as any).history}
        </div>
      )}
      {h.tags?.length > 0 && (
        <div className='flex flex-wrap gap-2 pt-2'>
          {h.tags?.map(tag => (
            <TagBadge key={tag} label={decodeTag(tag)} variant={tagVariant(tag)} />
          ))}
        </div>
      )}
    </div>
  )

  const chemistry = (
    <div className='space-y-2'>
      {h.activeConstituents?.length > 0 && (
        <div>
          <span className='font-semibold text-lime-300'>Compounds:</span>{' '}
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
      {h.mechanismOfAction && (
        <div>
          <span className='font-semibold text-lime-300'>Mechanism:</span> {h.mechanismOfAction}
        </div>
      )}
      {h.toxicityLD50 && (
        <div>
          <span className='font-semibold text-lime-300'>LD50:</span> {h.toxicityLD50}
        </div>
      )}
    </div>
  )

  const usage = (
    <div className='space-y-2'>
      {h.preparation && (
        <div>
          <span className='font-semibold text-lime-300'>Prep:</span> {h.preparation}
        </div>
      )}
      {h.intensity && (
        <div>
          <span className='font-semibold text-lime-300'>Intensity:</span> {h.intensity}
        </div>
      )}
      {h.dosage && (
        <div>
          <span className='font-semibold text-lime-300'>Dosage:</span> {h.dosage}
        </div>
      )}
      {h.affiliateLink && h.affiliateLink.startsWith('http') ? (
        <a
          href={h.affiliateLink}
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

  const effectsSummary = Array.isArray(h.effects) ? h.effects.join(', ') : h.effects || ''
  const summary = `${h.name} is classified as ${h.category}. Known effects include ${effectsSummary}.`

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
