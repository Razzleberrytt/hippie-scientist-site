import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { herbs } from '../data/herbs'
import { slugify } from '../utils/slugify'

function buildMap() {
  const map: Record<string, string[]> = {}
  herbs.forEach(h => {
    (h.tags || []).forEach(t => {
      if (t.startsWith('🧪')) {
        const name = t.replace('🧪', '').trim()
        map[name] = map[name] || []
        map[name].push(h.id)
      }
    })
  })
  return map
}
const compoundMap = buildMap()

export default function Compounds() {
  const entries = Object.entries(compoundMap)
  return (
    <main className='mx-auto max-w-4xl px-4 py-20 space-y-6'>
      <Helmet>
        <title>Compounds - The Hippie Scientist</title>
      </Helmet>
      <h1 className='text-gradient mb-6 text-4xl font-bold'>Compounds</h1>
      <p className='text-opal'>Psychoactive compounds and their source herbs.</p>
      {entries.map(([compound, ids]) => (
        <div key={compound} id={slugify(compound)} className='space-y-1'>
          <h2 className='text-2xl font-semibold text-lime-300'>{compound}</h2>
          <ul className='ml-4 list-disc'>
            {ids.map(id => {
              const herb = herbs.find(h => h.id === id)
              return (
                <li key={id}>
                  <Link className='text-comet underline' to={`/herbs/${id}`}>{herb?.name || id}</Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </main>
  )
}
