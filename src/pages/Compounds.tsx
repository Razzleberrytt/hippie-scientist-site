import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { herbs } from '../data/herbs'
import baseCompounds, { CompoundInfo } from '../data/compoundData'
import { FlaskConical, Leaf, Gem, Droplet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { slugify } from '../utils/slugify'

interface Compound extends CompoundInfo {
  sources: { id: string; name: string }[]
}

function typeIcon(type: string) {
  const t = type.toLowerCase()
  if (t.includes('alkaloid')) return <FlaskConical className='mr-1 inline h-4 w-4' />
  if (t.includes('terpene')) return <Leaf className='mr-1 inline h-4 w-4' />
  if (t.includes('glycoside')) return <Gem className='mr-1 inline h-4 w-4' />
  if (t.includes('phenolic') || t.includes('coumarin'))
    return <Droplet className='mr-1 inline h-4 w-4' />
  return null
}

export default function Compounds() {
  const compounds = React.useMemo(() => {
    const map = new Map<string, Compound>()
    baseCompounds.forEach(c => {
      map.set(c.name, { ...c, sources: [] })
    })
    herbs.forEach(h => {
      h.activeConstituents?.forEach(c => {
        const key = c.name
        if (!map.has(key)) {
          map.set(key, {
            name: c.name,
            type: c.type,
            mechanism: '',
            affiliateLink: undefined,
            sources: [{ id: h.id, name: h.name }],
          })
        } else {
          const entry = map.get(key)!
          if (!entry.sources.find(s => s.id === h.id)) {
            entry.sources.push({ id: h.id, name: h.name })
          }
        }
      })
    })
    return Array.from(map.values())
  }, [])

  return (
    <>
      <Helmet>
        <title>Psychoactive Compounds - The Hippie Scientist</title>
        <meta
          name='description'
          content='Browse active constituents found in herbs and learn their mechanisms.'
        />
      </Helmet>
      <div className='min-h-screen px-4 pb-12 pt-20'>
        <div className='mx-auto max-w-4xl text-center'>
          <h1 className='text-gradient mb-6 text-5xl font-bold'>Psychoactive Compounds</h1>
          <p className='mb-8 text-sand'>
            Prototype view of active constituents found in the herb database.
          </p>
          <div className='space-y-4'>
            {compounds.map(c => (
              <motion.div
                key={c.name}
                whileHover={{ scale: 1.03 }}
                className='glass-card hover-glow rounded-xl p-3 text-left sm:p-6'
              >
                <h2 className='max-w-xs truncate text-xl font-bold text-white'>{c.name}</h2>
                <p className='text-sm text-moss'>
                  {typeIcon(c.type)}
                  {c.type}
                </p>
                {c.mechanism && <p className='text-xs text-sand'>MOA: {c.mechanism}</p>}
                {c.notes && <p className='text-xs italic text-sand'>{c.notes}</p>}
                <p className='text-xs text-sand'>
                  Herbs:
                  {c.sources.map((s, i) => (
                    <React.Fragment key={s.id}>
                      {i > 0 && ', '}
                      <Link to={`/herbs/${s.id}`} className='underline'>
                        {s.name}
                      </Link>
                    </React.Fragment>
                  ))}
                </p>
                {c.sources.length > 0 && (
                  <Link
                    to={`/database?herbs=${c.sources.map(s => s.id).join(',')}`}
                    className='tag-pill mt-2 inline-block'
                  >
                    Found in: {c.sources.map(s => s.name).join(', ')}
                  </Link>
                )}
                {c.affiliateLink && (
                  <a
                    href={c.affiliateLink}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='mt-1 inline-block text-sm text-sky-300 underline'
                  >
                    Buy Online
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
