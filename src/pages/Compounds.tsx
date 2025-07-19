import React from 'react'
import { Helmet } from 'react-helmet-async'
import { herbs } from '../data/herbs'

interface Compound {
  name: string
  type: string
  effect: string
  sources: string[]
}

export default function Compounds() {
  const compounds = React.useMemo(() => {
    const map = new Map<string, Compound>()
    herbs.forEach(h => {
      h.activeConstituents?.forEach(c => {
        const key = c.name
        if (!map.has(key)) {
          map.set(key, { name: c.name, type: c.type, effect: c.effect, sources: [h.name] })
        } else {
          map.get(key)!.sources.push(h.name)
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
      <div className='min-h-screen px-4 pt-20'>
        <div className='mx-auto max-w-4xl text-center'>
          <h1 className='text-gradient mb-6 text-5xl font-bold'>Psychoactive Compounds</h1>
          <p className='mb-8 text-gray-300'>
            Prototype view of active constituents found in the herb database.
          </p>
          <div className='space-y-4'>
            {compounds.map(c => (
              <div key={c.name} className='glass-card p-4 text-left'>
                <h2 className='text-xl font-bold text-white'>{c.name}</h2>
                <p className='text-sm text-moss'>
                  Type: {c.type} — {c.effect}
                </p>
                <p className='text-xs text-sand'>Sources: {c.sources.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
