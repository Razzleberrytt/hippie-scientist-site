import React, { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { compounds, type CompoundEntry } from '../data/compounds/compounds'
import { herbs } from '../data/herbs/herbsfull'
import CompoundCard from '../components/CompoundCard'
import CompoundTagFilter, { Option } from '../components/CompoundTagFilter'
import { metaCategory } from '../hooks/useFilteredHerbs'
import { AnimatePresence, motion } from 'framer-motion'

export default function CompoundsPage() {
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState<string[]>([])

  const herbMap = useMemo(() => {
    const m = new Map<string, { slug?: string; category: string }>()
    herbs.forEach(h => {
      m.set(h.name.toLowerCase(), { slug: h.slug, category: h.category })
    })
    return m
  }, [])

  const enriched = useMemo(() => {
    return compounds.map(c => {
      const herbsFound = c.foundIn.map(name => {
        const info = herbMap.get(name.toLowerCase())
        return { name, slug: info?.slug, category: info?.category }
      })
      const effSet = new Set(
        herbsFound
          .map(h => (h.category ? metaCategory(h.category) : undefined))
          .filter(Boolean)
      ) as Set<string>
      return {
        ...c,
        herbsFound,
        effectClass: Array.from(effSet).join(', '),
      }
    })
  }, [herbMap])

  const classOptions: Option[] = useMemo(
    () =>
      Array.from(new Set(enriched.map(c => c.type)))
        .sort()
        .map(c => ({ label: c, value: c })),
    [enriched]
  )

  const filtered = useMemo(() => {
    return enriched.filter(c => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.herbsFound.some(h => h.name.toLowerCase().includes(q))
      const matchesClass =
        classFilter.length === 0 || classFilter.includes(c.type)
      return matchesSearch && matchesClass
    })
  }, [search, classFilter, enriched])

  return (
    <>
      <Helmet>
        <title>Psychoactive Compounds Index - The Hippie Scientist</title>
      </Helmet>
      <div className='min-h-screen px-4 pb-12 pt-20'>
        <div className='mx-auto max-w-5xl text-center'>
          <h1 className='text-gradient mb-2 text-4xl font-bold'>Psychoactive Compounds Index</h1>
          <p className='mb-6 text-sand'>Explore the active ingredients behind each herb’s effects</p>
          <div className='mb-4 flex flex-col items-center gap-4'>
            <input
              type='text'
              placeholder='Search compounds or herbs...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='w-full rounded-md bg-space-dark/70 px-3 py-2 text-white backdrop-blur-md focus:outline-none sm:w-72'
            />
            <CompoundTagFilter options={classOptions} onChange={setClassFilter} />
          </div>
          <motion.div layout className='grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3'>
            <AnimatePresence>
              {filtered.map(c => (
                <motion.div
                  key={c.name}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <CompoundCard compound={c} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  )
}
