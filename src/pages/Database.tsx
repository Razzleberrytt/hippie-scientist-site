import { useDeferredValue, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Fuse from 'fuse.js'
import SEO from '../components/SEO'
import StarfieldBackground from '../components/StarfieldBackground'
import DatabaseHerbCard from '../components/DatabaseHerbCard'
import ErrorBoundary from '../components/ErrorBoundary'
import Chip from '../components/ui/Chip'
import type { Herb } from '../types'
import herbsData from '../data/herbs/herbs.normalized.json'

const formatLabel = (value: string) =>
  value
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const INTENSITY_ORDER = [
  'micro',
  'very mild',
  'mild',
  'mild–moderate',
  'moderate',
  'moderate–strong',
  'strong',
  'very strong',
].map(s => s.toLowerCase())

const SORTS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'az', label: 'A → Z' },
  { id: 'za', label: 'Z → A' },
  { id: 'strong', label: 'Intensity: Strong → Mild' },
  { id: 'mild', label: 'Intensity: Mild → Strong' },
]

const nameOf = (herb: Herb) => String(herb.common || herb.scientific || '').toLowerCase()

const intensityRank = (herb: Herb) => {
  const value = String(herb.intensity || '').toLowerCase()
  if (value.includes('strong')) return 3
  if (value.includes('moderate')) return 2
  if (value.includes('mild')) return 1
  return 0
}

type FilterKey = 'categories' | 'intensities' | 'regions' | 'compounds'

type FilterState = Record<FilterKey, string[]>

const normalize = (value: string) => value.trim().toLowerCase()

export default function Database() {
  const herbs = herbsData as Herb[]
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    intensities: [],
    regions: [],
    compounds: [],
  })
  const [sortBy, setSortBy] = useState('relevance')
  const deferredQuery = useDeferredValue(query)

  const topHerbs = useMemo(() => herbs.slice(0, 4), [herbs])

  const categoryOptions = useMemo(() => {
    const set = new Set(
      herbs
        .map(herb => (herb.category || '').trim())
        .filter((value): value is string => Boolean(value))
    )
    return Array.from(set)
      .sort((a, b) => formatLabel(a).localeCompare(formatLabel(b)))
      .map(value => ({ value, label: formatLabel(value) }))
  }, [herbs])

  const intensityOptions = useMemo(() => {
    const set = new Set(
      herbs
        .map(herb => (herb.intensity || '').trim())
        .filter((value): value is string => Boolean(value))
    )

    return Array.from(set)
      .sort((a, b) => {
        const ai = INTENSITY_ORDER.indexOf(a.toLowerCase())
        const bi = INTENSITY_ORDER.indexOf(b.toLowerCase())
        if (ai === -1 && bi === -1) return formatLabel(a).localeCompare(formatLabel(b))
        if (ai === -1) return 1
        if (bi === -1) return -1
        return ai - bi
      })
      .map(value => ({ value, label: formatLabel(value) }))
  }, [herbs])

  const regionOptions = useMemo(() => {
    const set = new Set<string>()
    herbs.forEach(herb => {
      ;(herb.regiontags || []).forEach(region => {
        const trimmed = region.trim()
        if (trimmed) set.add(trimmed)
      })
    })
    return Array.from(set)
      .sort((a, b) => formatLabel(a).localeCompare(formatLabel(b)))
      .map(value => ({ value, label: formatLabel(value) }))
  }, [herbs])

  const compoundOptions = useMemo(() => {
    const set = new Set<string>()
    herbs.forEach(herb => {
      ;(herb.compounds || []).forEach(compound => {
        const trimmed = compound.trim()
        if (trimmed) set.add(trimmed)
      })
    })
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b))
      .map(value => ({ value, label: value }))
  }, [herbs])

  const fuse = useMemo(
    () =>
      new Fuse(herbs, {
        keys: [
          { name: 'common', weight: 0.4 },
          { name: 'scientific', weight: 0.3 },
          { name: 'name', weight: 0.3 },
          { name: 'tags', weight: 0.2 },
          { name: 'compounds', weight: 0.2 },
          { name: 'effects', weight: 0.2 },
          { name: 'description', weight: 0.15 },
          { name: 'region', weight: 0.1 },
          { name: 'regiontags', weight: 0.1 },
        ],
        threshold: 0.33,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [herbs]
  )

  const toggleFilter = (key: FilterKey, value: string) => {
    setFilters(prev => {
      const nextValues = prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
      return { ...prev, [key]: nextValues }
    })
  }

  const clearAllFilters = () => {
    setQuery('')
    setFilters({ categories: [], intensities: [], regions: [], compounds: [] })
  }

  const filteredHerbs = useMemo(() => {
    const normalizedQuery = deferredQuery.trim()
    const categorySet = new Set(filters.categories.map(normalize))
    const intensitySet = new Set(filters.intensities.map(normalize))
    const regionSet = new Set(filters.regions.map(normalize))
    const compoundSet = new Set(filters.compounds.map(normalize))

    const baseResults = normalizedQuery
      ? fuse.search(normalizedQuery).map(result => result.item)
      : [...herbs].sort((a, b) =>
          String(a.common || a.scientific).localeCompare(String(b.common || b.scientific))
        )

    return baseResults.filter(herb => {
      const category = normalize(String(herb.category || ''))
      const intensity = normalize(String(herb.intensity || ''))
      const regions = (herb.regiontags || []).map(normalize)
      const compounds = (herb.compounds || []).map(normalize)

      if (categorySet.size && !categorySet.has(category)) return false
      if (intensitySet.size && !intensitySet.has(intensity)) return false
      if (regionSet.size && !regions.some(region => regionSet.has(region))) return false
      if (compoundSet.size && !compounds.some(compound => compoundSet.has(compound))) return false

      return true
    })
  }, [deferredQuery, filters, fuse, herbs])

  const sortedHerbs = useMemo(() => {
    const results = [...filteredHerbs]
    switch (sortBy) {
      case 'az':
        results.sort((a, b) => nameOf(a).localeCompare(nameOf(b)))
        break
      case 'za':
        results.sort((a, b) => nameOf(b).localeCompare(nameOf(a)))
        break
      case 'strong':
        results.sort((a, b) => {
          const delta = intensityRank(b) - intensityRank(a)
          return delta !== 0 ? delta : nameOf(a).localeCompare(nameOf(b))
        })
        break
      case 'mild':
        results.sort((a, b) => {
          const delta = intensityRank(a) - intensityRank(b)
          return delta !== 0 ? delta : nameOf(a).localeCompare(nameOf(b))
        })
        break
      default:
        break
    }
    return results
  }, [filteredHerbs, sortBy])

  const hasActiveFilters =
    Boolean(query.trim()) ||
    filters.categories.length > 0 ||
    filters.intensities.length > 0 ||
    filters.regions.length > 0 ||
    filters.compounds.length > 0

  const activeFilterChips = useMemo(() => {
    const chips: string[] = []
    if (query.trim()) {
      chips.push(`Search: "${query.trim()}"`)
    }
    filters.categories.forEach(value => chips.push(`Category: ${formatLabel(value)}`))
    filters.intensities.forEach(value => chips.push(`Intensity: ${formatLabel(value)}`))
    filters.regions.forEach(value => chips.push(`Region: ${formatLabel(value)}`))
    filters.compounds.forEach(value => chips.push(`Compound: ${value}`))
    return chips
  }, [filters, query])

  return (
    <ErrorBoundary>
      <div className='relative min-h-screen bg-space-dark/90 px-4 pt-20 text-sand'>
        <SEO
          title='Herb Database | The Hippie Scientist'
          description='Browse psychoactive herb profiles with scientific and cultural context.'
          canonical='https://thehippiescientist.net/database'
        />
        <StarfieldBackground />
        <div className='relative mx-auto max-w-6xl pb-12'>
          <header className='mb-8 text-center'>
            <h1 className='text-gradient mb-3 text-4xl font-bold md:text-5xl'>Herb Database</h1>
            <p className='mx-auto max-w-3xl text-base text-sand/80 md:text-lg'>
              Explore our collection of psychoactive herbs. Use the smart search and quick filter chips below to find herbs by
              category, intensity, compound, or region.
            </p>
          </header>

          {topHerbs.length > 0 && (
            <div className='mb-8 overflow-x-auto pb-2'>
              <div className='flex min-w-full gap-4'>
                {topHerbs.map(herb => {
                  const sci = (herb.scientific || herb.scientificname || '').trim()
                  return (
                    <div
                      key={herb.id}
                      className='min-w-[14rem] rounded-xl bg-black/40 p-4 text-left shadow-lg backdrop-blur-md transition hover:bg-black/50'
                    >
                      <p className='text-xs uppercase tracking-wide text-sand/60'>Featured</p>
                      <h2 className='mt-1 text-xl font-semibold text-lime-300'>{herb.common || herb.name}</h2>
                      {sci && <p className='text-sm italic text-sand/70'>{sci}</p>}
                      {herb.category && (
                        <p className='mt-2 text-sm text-sand/80'>Category: {formatLabel(herb.category)}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <section className='mb-6 space-y-4 rounded-2xl bg-black/30 p-5 backdrop-blur-md'>
            <div className='flex flex-col gap-3 md:flex-row md:items-center'>
              <label className='sr-only' htmlFor='herb-search-input'>Search herbs</label>
              <input
                id='herb-search-input'
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder='Search herbs, compounds, effects...'
                className='w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm text-sand placeholder-white/50 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400 md:flex-1'
              />
              <button
                type='button'
                onClick={clearAllFilters}
                disabled={!hasActiveFilters}
                className='inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-50 md:w-auto'
              >
                Clear All Filters
              </button>
            </div>

            {activeFilterChips.length > 0 && (
              <div className='flex flex-wrap gap-2 border-t border-white/5 pt-3'>
                {activeFilterChips.map(text => (
                  <Chip key={text}>{text}</Chip>
                ))}
              </div>
            )}

            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <FilterGroup
                title='Category'
                options={categoryOptions}
                selected={filters.categories}
                onToggle={value => toggleFilter('categories', value)}
              />
              <FilterGroup
                title='Intensity'
                options={intensityOptions}
                selected={filters.intensities}
                onToggle={value => toggleFilter('intensities', value)}
              />
              <FilterGroup
                title='Region'
                options={regionOptions}
                selected={filters.regions}
                onToggle={value => toggleFilter('regions', value)}
              />
              <FilterGroup
                title='Compound'
                options={compoundOptions}
                selected={filters.compounds}
                onToggle={value => toggleFilter('compounds', value)}
              />
            </div>

            <div className='flex flex-wrap items-center justify-between gap-3 text-sm text-sand/70'>
              <div className='opacity-75 text-sm'>
                {sortedHerbs.length} results{' '}
                <span className='text-xs text-sand/60'>({herbs.length} total)</span>
              </div>
              <label className='flex items-center gap-2 text-sm'>
                <span className='opacity-75'>Sort</span>
                <select
                  value={sortBy}
                  onChange={event => setSortBy(event.target.value)}
                  className='bg-white/10 border border-white/10 rounded-md px-2 py-1 text-sm'
                >
                  {SORTS.map(sort => (
                    <option key={sort.id} value={sort.id}>
                      {sort.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <motion.section
            layout
            className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <AnimatePresence initial={false} mode='popLayout'>
              {sortedHerbs.map(herb => (
                <motion.div
                  key={herb.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <DatabaseHerbCard herb={herb} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.section>

          {sortedHerbs.length === 0 && (
            <div className='col-span-full mt-10 text-center text-sand/60'>
              No herbs found. Try adjusting your filters.
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

type FilterGroupProps = {
  title: string
  options: { value: string; label: string }[]
  selected: string[]
  onToggle: (value: string) => void
}

function FilterGroup({ title, options, selected, onToggle }: FilterGroupProps) {
  return (
    <div className='rounded-xl border border-white/5 bg-black/20 p-3'>
      <h3 className='mb-2 text-xs font-semibold uppercase tracking-wide text-sand/60'>{title}</h3>
      <div className='flex max-h-32 flex-wrap gap-2 overflow-y-auto pr-1'>
        {options.map(option => {
          const isActive = selected.includes(option.value)
          return (
            <button
              key={option.value}
              onClick={() => onToggle(option.value)}
              className={`rounded-full px-3 py-1 text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 ${
                isActive
                  ? 'bg-lime-400/40 text-white shadow-inner'
                  : 'bg-white/10 text-sand/80 hover:bg-white/20'
              }`}
              type='button'
            >
              {option.label}
            </button>
          )
        })}
        {options.length === 0 && <p className='text-xs text-sand/60'>No options available.</p>}
      </div>
    </div>
  )
}
