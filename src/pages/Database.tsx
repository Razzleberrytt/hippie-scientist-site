import { useDeferredValue, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Fuse from 'fuse.js'
import SEO from '../components/SEO'
import ErrorBoundary from '../components/ErrorBoundary'
import HerbCard from '../components/HerbCard'
import Toolbar from '../components/ui/Toolbar'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
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
      <SEO
        title='Herb Database | The Hippie Scientist'
        description='Browse psychoactive herb profiles with scientific and cultural context.'
        canonical='https://thehippiescientist.net/database'
      />
      <main className='container space-y-6 py-8'>
        <header className='space-y-2'>
          <p className='text-xs uppercase tracking-[0.3em] text-sub'>Explorer</p>
          <h1 className='h1-grad text-3xl font-semibold md:text-4xl'>Herb Database</h1>
          <p className='max-w-2xl text-sub'>Explore, filter, and compare psychoactive herbs with rich descriptions and context.</p>
        </header>

        <motion.div
          initial='hidden'
          animate='visible'
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { staggerChildren: 0.05, delayChildren: 0.05 },
            },
          }}
        >
          <Toolbar>
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className='flex min-w-[220px] flex-1 items-center gap-2'>
              <label className='sr-only' htmlFor='herb-search-input'>Search herbs</label>
              <input
                id='herb-search-input'
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder='Search herbs, compounds, effects...'
                className='w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm text-text placeholder:text-sub/70 focus:border-brand-lime/60 focus:outline-none focus:ring-2 focus:ring-brand-lime/20'
              />
              {query && (
                <button
                  type='button'
                  onClick={() => setQuery('')}
                  className='text-xs text-sub transition hover:text-text'
                >
                  Clear
                </button>
              )}
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className='flex items-center gap-3'>
              <label className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sub'>
                Sort
                <select
                  value={sortBy}
                  onChange={event => setSortBy(event.target.value)}
                  className='rounded-md border border-border bg-panel px-2 py-1 text-sm text-text focus:border-brand-lime/60 focus:outline-none focus:ring-1 focus:ring-brand-lime/30'
                >
                  {SORTS.map(sort => (
                    <option key={sort.id} value={sort.id}>
                      {sort.label}
                    </option>
                  ))}
                </select>
              </label>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
              <Button
                type='button'
                onClick={clearAllFilters}
                disabled={!hasActiveFilters}
                className='disabled:opacity-50'
              >
                Clear all
              </Button>
            </motion.div>
          </Toolbar>
        </motion.div>

        {activeFilterChips.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {activeFilterChips.map(text => (
              <Badge key={text}>{text}</Badge>
            ))}
          </div>
        )}

        <section className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
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
        </section>

        <div className='flex flex-wrap items-center justify-between gap-3 text-sm text-sub'>
          <span>
            {sortedHerbs.length} results <span className='text-xs text-sub/70'>({herbs.length} total)</span>
          </span>
        </div>

        <motion.section
          layout
          className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <AnimatePresence initial={false} mode='popLayout'>
            {sortedHerbs.map((herb, index) => (
              <motion.div
                key={herb.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <HerbCard herb={herb} index={index} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.section>

        {sortedHerbs.length === 0 && (
          <Card className='p-6 text-center text-sub'>No herbs found. Try adjusting your filters.</Card>
        )}
      </main>
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
    <Card className='flex flex-col gap-3 p-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-xs font-semibold uppercase tracking-wide text-sub'>{title}</h3>
        <span className='text-xs text-sub/70'>{selected.length}</span>
      </div>
      <div className='flex max-h-32 flex-wrap gap-2 overflow-y-auto pr-1'>
        {options.map(option => {
          const isActive = selected.includes(option.value)
          return (
            <button
              key={option.value}
              onClick={() => onToggle(option.value)}
              className={`rounded-full px-3 py-1 text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime/40 ${
                isActive
                  ? 'border border-brand-lime/40 bg-brand-lime/20 text-text'
                  : 'border border-white/10 bg-white/5 text-sub hover:border-white/20 hover:bg-white/10'
              }`}
              type='button'
            >
              {option.label}
            </button>
          )
        })}
        {options.length === 0 && <p className='text-xs text-sub/70'>No options available.</p>}
      </div>
    </Card>
  )
}
