import React from 'react'
import { Helmet } from 'react-helmet-async'
import { herbs } from '../data/herbs'
import baseCompounds, { CompoundInfo } from '../data/compoundData'
import { Link } from 'react-router-dom'
import { slugify } from '../utils/slugify'

interface Compound extends CompoundInfo {
  sources: { id: string; name: string }[]
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
        <title>Compounds - The Hippie Scientist</title>
      </Helmet>
      <div className='min-h-screen px-4 pt-20 pb-12'>
        <div className='mx-auto max-w-4xl text-center'>
          <h1 className='text-gradient mb-6 text-5xl font-bold'>Psychoactive Compounds</h1>
          <p className='mb-8 text-sand'>
            Prototype view of active constituents found in the herb database.
          </p>
          <div className='space-y-4'>
            {compounds.map(c => (
              <div key={c.name} className='glass-card p-4 text-left'>
                <h2 className='text-xl font-bold text-white'>{c.name}</h2>
                <p className='text-sm text-moss'>Type: {c.type}</p>
                {c.mechanism && (
                  <p className='text-xs text-sand'>MOA: {c.mechanism}</p>
                )}
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
