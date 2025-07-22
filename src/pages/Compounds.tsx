import React, { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { compounds, CompoundEntry } from '../data/compounds'
import CompoundCard from '../components/CompoundCard'

export default function CompoundsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const types = useMemo(
    () => Array.from(new Set(compounds.map(c => c.type))).sort(),
    []
  )

  const filtered = useMemo(() => {
    return compounds.filter(c => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.foundIn.some(h => h.toLowerCase().includes(q))
      const matchesType = !typeFilter || c.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [search, typeFilter])

  return (
    <>
      <Helmet>
        <title>Psychoactive Compounds Index - The Hippie Scientist</title>
      </Helmet>
      <div className='min-h-screen px-4 pb-12 pt-20'>
        <div className='mx-auto max-w-5xl text-center'>
          <h1 className='text-gradient mb-2 text-4xl font-bold'>Psychoactive Compounds Index</h1>
          <p className='mb-6 text-sand'>Explore the active ingredients behind each herb’s effects</p>
          <div className='mb-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
            <input
              type='text'
              placeholder='Search compounds or herbs...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='w-full rounded-md bg-space-dark/70 px-3 py-2 text-white backdrop-blur-md focus:outline-none sm:w-72'
            />
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className='w-full rounded-md bg-space-dark/70 px-3 py-2 text-white backdrop-blur-md focus:outline-none sm:w-52'
            >
              <option value=''>All Types</option>
              {types.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {filtered.map(c => (
              <CompoundCard key={c.name} compound={c as CompoundEntry} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
