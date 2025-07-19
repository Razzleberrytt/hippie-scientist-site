import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2 } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { useHerbs } from '../hooks/useHerbs'
import { decodeTag, tagVariant, safetyColorClass } from '../utils/format'
import TagBadge from '../components/TagBadge'
import CompoundTooltip from '../components/CompoundTooltip'
import { slugify } from '../utils/slugify'
import { useLocalStorage } from '../hooks/useLocalStorage'

function findSimilar(current: any, herbs: any[]) {
  const scores = herbs.map(h => {
    if (h.id === current.id) return { h, score: -1 }
    let score = 0
    const tags = new Set(h.tags)
    const effects = new Set(h.effects || [])
    current.tags.forEach((t: string) => { if (tags.has(t)) score += 2 })
    ;(current.effects || []).forEach((e: string) => { if (effects.has(e)) score += 1 })
    if (current.mechanismOfAction && h.mechanismOfAction && current.mechanismOfAction === h.mechanismOfAction) score += 2
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
  const herbs = useHerbs()
  const herb = herbs?.find(h => h.id === id)
  const [notes, setNotes] = useLocalStorage(`notes-${id}`, '')
  const [showSimilar, setShowSimilar] = React.useState(false)
  const [showAllCompounds, setShowAllCompounds] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  const share = () => {
    const url = `${window.location.origin}/herb/${herb?.id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  if (!herb) {
    return (
      <div className='p-6 text-center'>
        <p>Herb not found.</p>
        <Link to='/database' className='text-comet underline'>Back to database</Link>
      </div>
    )
  }
  const similar = React.useMemo(() => (herbs ? findSimilar(herb, herbs) : []), [herb, herbs])
  const summary = `${herb.name} is classified as ${herb.category}. Known effects include ${(herb.effects || []).join(', ')}.`
  return (
    <>
      <Helmet>
        <title>{herb.name} - The Hippie Scientist</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='glass-card mx-auto max-w-3xl space-y-6 overflow-y-auto px-6 py-8'
      >
        <div className='flex items-center justify-between'>
          <Link
            to='/database'
            onClick={() => localStorage.setItem('focusHerb', herb.id)}
            className='text-comet underline'
          >
            ← Back
          </Link>
          <div className='relative flex items-center gap-2'>
            <button
              type='button'
              aria-label='Copy link'
              onClick={share}
              className='rounded-md p-1 text-sand hover:bg-white/20'
            >
              <Share2 size={18} />
            </button>
            <AnimatePresence>
              {copied && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className='absolute right-0 top-full mt-1 rounded bg-black/80 px-2 py-1 text-xs text-white'
                >
                  Copied!
                </motion.div>
              )}
            </AnimatePresence>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(herb.name)}%20%23herbs`}
              target='_blank'
              rel='noopener noreferrer'
              className='text-sky-300 underline'
            >
              Tweet
            </a>
          </div>
        </div>
        <h1 className='text-gradient text-4xl font-bold'>{herb.name}</h1>
        {herb.scientificName && <p className='italic'>{herb.scientificName}</p>}
        <div className='space-y-2'>
          {[
            'description','mechanismOfAction','therapeuticUses','sideEffects','contraindications','drugInteractions','preparation','dosage','pharmacokinetics','onset','duration','intensity','region','legalStatus','safetyRating','toxicity','toxicityLD50'
          ].map(key => {
            const raw = (herb as any)[key]
            if (!raw) return null
            return (
              <div key={key}>
                <span className='font-semibold text-lime-300'>{key.replace(/([A-Z])/g,' $1')}:</span>{' '}
                {key==='safetyRating'? <span className={safetyColorClass(raw)}>{raw}</span> : raw}
              </div>
            )
          })}
          {herb.activeConstituents?.length > 0 && (
            <div>
              <span className='font-semibold text-lime-300'>Active Compounds:</span>{' '}
              {(showAllCompounds ? herb.activeConstituents : herb.activeConstituents.slice(0, 5)).map((c, i) => (
                <React.Fragment key={c.name}>
                  {i > 0 && ', '}
                  <CompoundTooltip name={c.name}>
                    <Link className='text-sky-300 underline' to={`/compounds?compound=${slugify(c.name)}`}>{c.name}</Link>
                  </CompoundTooltip>
                </React.Fragment>
              ))}
              {herb.activeConstituents.length > 5 && !showAllCompounds && (
                <button
                  type='button'
                  onClick={() => setShowAllCompounds(true)}
                  className='ml-2 underline'
                >
                  +{herb.activeConstituents.length - 5} more
                </button>
              )}
            </div>
          )}
        <div className='flex flex-wrap gap-2 pt-2'>
          {herb.tags.map(tag => (
            <TagBadge key={tag} label={decodeTag(tag)} variant={tagVariant(tag)} />
          ))}
        </div>
        {herb.affiliateLink && (
          <div className='mt-4 space-y-1'>
            <a
              href={herb.affiliateLink}
              target='_blank'
              rel='noopener noreferrer'
              className='hover-glow block min-h-[44px] rounded-md bg-gradient-to-r from-green-700 to-lime-600 px-4 py-2 text-center text-white'
            >
              🌐 Buy Online
            </a>
            <p className='text-xs text-sand'>
              As an Amazon Associate, I earn from qualifying purchases. Some links on this page may be affiliate links.
            </p>
          </div>
        )}
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
            <ul className='list-disc list-inside'>
              {similar.map(h => (
                <li key={h.id}>
                  <Link className='text-comet underline' to={`/herbs/${h.id}`}>{h.name}</Link>
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
        <div className='space-y-2'>
          <h2 className='text-2xl font-bold text-sky-300'>Community Notes</h2>
          <div className='rounded-md bg-black/20 p-2 text-sm text-sand'>
            <strong>Alice</strong>: Great for relaxation! <span className='float-right text-xs'>2024-05-01</span>
          </div>
          <div className='rounded-md bg-black/20 p-2 text-sm text-sand'>
            <strong>Bob</strong>: Helped with sleep. <span className='float-right text-xs'>2024-05-02</span>
          </div>
          <form
            onSubmit={e => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const data = (form.elements.namedItem('note') as HTMLInputElement).value
              console.log('Submitted note:', data)
              form.reset()
            }}
            className='space-y-2'
          >
            <textarea
              name='note'
              rows={3}
              className='w-full rounded-md bg-black/20 p-2 text-white'
              placeholder='Share your experience...'
            />
            <button
              type='submit'
              className='rounded bg-psychedelic-purple px-3 py-1 text-white hover:opacity-90'
            >
              Submit Note
            </button>
          </form>
        </div>
        <details className='bg-slate-800/40 p-4 rounded-md'>
          <summary className='cursor-pointer text-sky-300'>🧬 Summarize This Herb</summary>
          <p className='mt-2'>{summary}</p>
        </details>
      </motion.div>
    </>
  )
}
