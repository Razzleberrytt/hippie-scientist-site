import React, { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { compounds, Compound } from '../data/compoundsIndex'
import CompoundCard from '../components/CompoundCard'

export default function CompoundsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [classFilter, setClassFilter] = useState('')

  const types = useMemo(
    () => Array.from(new Set(compounds.map(c => c.type))).sort(),
    []
  )
  const classes = useMemo(
    () => Array.from(new Set(compounds.map(c => c.effectClass))).sort(),
    []
  )

  const filtered = useMemo(() => {
    return compounds.filter(c => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.sourceHerbs.some(h => h.toLowerCase().includes(q))
      const matchesType = !typeFilter || c.type === typeFilter
      const matchesClass = !classFilter || c.effectClass === classFilter
      return matchesSearch && matchesType && matchesClass
    })
  }, [search, typeFilter, classFilter])

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
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className='w-full rounded-md bg-space-dark/70 px-3 py-2 text-white backdrop-blur-md focus:outline-none sm:w-56'
            >
              <option value=''>All Classes</option>
              {classes.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {filtered.map(c => (
              <CompoundCard key={c.name} compound={c} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
