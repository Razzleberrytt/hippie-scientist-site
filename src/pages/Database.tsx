// src/pages/Database.tsx

import React from 'react'
import SEO from '../components/SEO'
import { motion } from 'framer-motion'
import HerbList from '../components/HerbList'
import TagFilterBar from '../components/TagFilterBar'
import CategoryAnalytics from '../components/CategoryAnalytics'
import { decodeTag } from '../utils/format'
import { canonicalTag } from '../utils/tagUtils'
import StarfieldBackground from '../components/StarfieldBackground'
import { useHerbs } from '../hooks/useHerbs'
import { useHerbFavorites } from '../hooks/useHerbFavorites'
import SearchBar from '../components/SearchBar'
import { splitField, herbName } from '../utils/herb'
import { Download, LayoutGrid, List, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useFilteredHerbs } from '../hooks/useFilteredHerbs'
import { getLocal, setLocal } from '../utils/localStorage'
import ErrorBoundary from '../components/ErrorBoundary'

const formatLabel = (value: string) =>
  value
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

export default function Database() {
  const herbs = useHerbs()
  const { favorites } = useHerbFavorites()
  const buildTime = typeof __BUILD_TIME__ === 'string' ? __BUILD_TIME__ : new Date().toISOString()
  const {
    filtered,
    query,
    setQuery,
    tags: filteredTags,
    setTags: setFilteredTags,
    matchAll,
    setMatchAll,
    favoritesOnly,
    setFavoritesOnly,
    sort,
    setSort,
    fuse,
  } = useFilteredHerbs(herbs, { favorites })

  const [filtersOpen, setFiltersOpen] = React.useState(false)
  const [showBar, setShowBar] = React.useState(true)
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')

  const [categoryFilter, setCategoryFilter] = React.useState('')
  const [intensityFilter, setIntensityFilter] = React.useState('')
  const [legalStatusFilter, setLegalStatusFilter] = React.useState('')
  const [regionFilter, setRegionFilter] = React.useState('')

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ids = params.get('herbs')?.split(',') || []
    if (ids.length) {
      setTimeout(() => {
        ids.forEach(id => {
          const el = document.getElementById(`herb-${id}`)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
            el.classList.add('ring-2', 'ring-sky-300')
            setTimeout(() => el.classList.remove('ring-2', 'ring-sky-300'), 2000)
          }
        })
      }, 300)
    }
  }, [])

  React.useEffect(() => {
    const pos = getLocal<number>('dbScroll', 0)
    if (pos) window.scrollTo(0, pos)
    const handle = () => setLocal('dbScroll', window.scrollY)
    window.addEventListener('scroll', handle)
    return () => {
      setLocal('dbScroll', window.scrollY)
      window.removeEventListener('scroll', handle)
    }
  }, [])

  const allTags = React.useMemo(() => {
    const t = herbs.reduce<string[]>((acc, h) => acc.concat(splitField(h.tags)), [])
    return Array.from(new Set(t.map(canonicalTag)))
  }, [herbs])

  const summary = React.useMemo(() => {
    const affiliates = herbs.filter(
      h => typeof h.affiliatelink === 'string' && h.affiliatelink.startsWith('http')
    ).length
    const moaCount = herbs.filter(h => (h.mechanism || h.mechanismofaction || '').trim()).length
    return { total: herbs.length, affiliates, moaCount }
  }, [herbs])

  const toggleTag = React.useCallback(
    (tag: string) =>
      setFilteredTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])),
    [setFilteredTags]
  )

  React.useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const cur = window.scrollY
      setShowBar(cur < last || cur < 100)
      last = cur
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  React.useEffect(() => {
    const close = () => {
      if (window.scrollY > 150) setFiltersOpen(false)
    }
    window.addEventListener('scroll', close)
    window.addEventListener('touchmove', close)
    return () => {
      window.removeEventListener('scroll', close)
      window.removeEventListener('touchmove', close)
    }
  }, [])

  const relatedTags = React.useMemo(() => {
    if (filteredTags.length === 0) return [] as string[]
    const counts: Record<string, number> = {}
    herbs.forEach(h => {
      const herbTags = splitField(h.tags)
      if (filteredTags.every(t => herbTags.some(ht => canonicalTag(ht) === canonicalTag(t)))) {
        herbTags.forEach(t => {
          const canon = canonicalTag(t)
          if (!filteredTags.some(ft => canonicalTag(ft) === canon)) {
            counts[canon] = (counts[canon] || 0) + 1
          }
        })
      }
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([t]) => t)
  }, [filteredTags, herbs])

  const categories = React.useMemo(() => {
    const map = new Map<string, string>()
    herbs.forEach(h => {
      const value = (h.category || '').trim()
      if (!value) return
      const key = value.toLowerCase()
      if (!map.has(key)) {
        const label = (h.category_label || value).trim() || value
        map.set(key, formatLabel(label))
      }
    })
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [herbs])

  const intensities = React.useMemo(() => {
    const map = new Map<string, string>()
    herbs.forEach(h => {
      const value = (h.intensity || '').trim()
      if (!value) return
      const key = value.toLowerCase()
      if (!map.has(key)) {
        const label = (h.intensity_label || value).trim() || value
        map.set(key, formatLabel(label))
      }
    })
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [herbs])

  const legalStatuses = React.useMemo(() => {
    const map = new Map<string, string>()
    herbs.forEach(h => {
      const value = (h.legalstatus || '').trim()
      if (!value) return
      const key = value.toLowerCase()
      if (!map.has(key)) map.set(key, formatLabel(value))
    })
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [herbs])

  const regions = React.useMemo(() => {
    const map = new Map<string, string>()
    herbs.forEach(h => {
      splitField(h.region).forEach(regionValue => {
        const value = regionValue.trim()
        if (!value) return
        const key = value.toLowerCase()
        if (!map.has(key)) map.set(key, value)
      })
    })
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [herbs])

  const clearSelectFilters = React.useCallback(() => {
    setCategoryFilter('')
    setIntensityFilter('')
    setLegalStatusFilter('')
    setRegionFilter('')
  }, [])

  const displayHerbs = React.useMemo(() => {
    const bySelects = filtered.filter(h => {
      if (categoryFilter) {
        const cat = (h.category || '').toLowerCase()
        const catLabel = (h.category_label || '').toLowerCase()
        if (cat !== categoryFilter && catLabel !== categoryFilter) return false
      }
      if (intensityFilter) {
        const intensity = (h.intensity || '').toLowerCase()
        const intensityLabel = (h.intensity_label || '').toLowerCase()
        if (intensity !== intensityFilter && intensityLabel !== intensityFilter) return false
      }
      if (legalStatusFilter) {
        const legal = (h.legalstatus || '').toLowerCase()
        if (legal !== legalStatusFilter) return false
      }
      if (regionFilter) {
        const regionsLower = splitField(h.region).map(r => r.toLowerCase())
        if (!regionsLower.includes(regionFilter)) return false
      }
      return true
    })

    return [...bySelects].sort((a, b) => {
      const left = (herbName(a) || a.id).toLowerCase()
      const right = (herbName(b) || b.id).toLowerCase()
      return left.localeCompare(right)
    })
  }, [filtered, categoryFilter, intensityFilter, legalStatusFilter, regionFilter])

  const hasActiveSelectFilters = Boolean(
    categoryFilter || intensityFilter || legalStatusFilter || regionFilter
  )

  return (
    <ErrorBoundary>
      <>
        <SEO
          title='Herb Database | The Hippie Scientist'
          description='Browse psychoactive herb profiles with scientific and cultural context.'
          canonical='https://thehippiescientist.net/database'
        />
        <div className='relative min-h-screen px-4 pt-20'>
          <StarfieldBackground />
          <div className='relative mx-auto max-w-6xl'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className='mb-8 text-center'
            >
              <h1 className='text-gradient mb-6 text-5xl font-bold'>Herb Database</h1>
              <p className='mx-auto max-w-4xl text-xl text-sand'>
                Explore our collection of herbs. Click any entry to see detailed information.
              </p>
            </motion.div>

            <motion.div
              className='sticky top-2 z-20 mb-4 flex flex-wrap items-center gap-2'
              animate={{ y: showBar ? 0 : -60, opacity: showBar ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <SearchBar query={query} setQuery={setQuery} fuse={fuse} />
              <button
                type='button'
                onClick={() => setViewMode(v => (v === 'grid' ? 'list' : 'grid'))}
                className='rounded-md bg-space-dark/70 p-2 text-sand backdrop-blur-md hover:bg-white/10'
                aria-label='Toggle view'
              >
                {viewMode === 'grid' ? <List size={18} /> : <LayoutGrid size={18} />}
              </button>
              <button
                type='button'
                onClick={() => setFavoritesOnly(f => !f)}
                className='rounded-md bg-space-dark/70 px-3 py-2 text-sm text-yellow-300 backdrop-blur-md hover:bg-white/10'
              >
                {favoritesOnly ? 'All Herbs' : 'My Herbs'}
              </button>
              <button
                type='button'
                onClick={() => setMatchAll(m => !m)}
                className='hover-glow rounded-md bg-space-dark/70 px-3 py-2 text-sm text-sand backdrop-blur-md hover:bg-white/10'
              >
                {matchAll ? 'Match ALL' : 'Match ANY'}
              </button>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className='rounded-md bg-space-dark/70 px-3 py-2 text-sm text-sand backdrop-blur-md hover:bg-white/10'
              >
                <option value='name'>Alphabetical (A–Z)</option>
                <option value='category'>Category</option>
                <option value='intensity'>Psychoactive Intensity</option>
                <option value='blend'>Blend-Friendliness</option>
              </select>
              <Link
                to='/downloads'
                className='rounded-md bg-space-dark/70 p-2 text-sand backdrop-blur-md hover:bg-white/10'
                aria-label='Export data'
              >
                <Download size={18} />
              </Link>
              <button
                type='button'
                onClick={() => setFiltersOpen(o => !o)}
                className='rounded-md bg-space-dark/70 px-3 py-2 text-sm text-sand backdrop-blur-md hover:bg-white/10 sm:hidden'
              >
                {filtersOpen ? 'Hide Filters' : 'Show Filters'}
              </button>
            </motion.div>

            <div className={`mb-4 space-y-4 ${filtersOpen ? '' : 'hidden sm:block'}`}>
              <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-4'>
                <label className='flex flex-col text-sm text-sand'>
                  <span className='mb-1 font-semibold uppercase tracking-wide text-xs text-sand/70'>Category</span>
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className='rounded-md bg-space-dark/70 px-3 py-2 text-sm text-sand backdrop-blur-md hover:bg-white/10'
                  >
                    <option value=''>All</option>
                    {categories.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className='flex flex-col text-sm text-sand'>
                  <span className='mb-1 font-semibold uppercase tracking-wide text-xs text-sand/70'>Intensity</span>
                  <select
                    value={intensityFilter}
                    onChange={e => setIntensityFilter(e.target.value)}
                    className='rounded-md bg-space-dark/70 px-3 py-2 text-sm text-sand backdrop-blur-md hover:bg-white/10'
                  >
                    <option value=''>All</option>
                    {intensities.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className='flex flex-col text-sm text-sand'>
                  <span className='mb-1 font-semibold uppercase tracking-wide text-xs text-sand/70'>Legal Status</span>
                  <select
                    value={legalStatusFilter}
                    onChange={e => setLegalStatusFilter(e.target.value)}
                    className='rounded-md bg-space-dark/70 px-3 py-2 text-sm text-sand backdrop-blur-md hover:bg-white/10'
                  >
                    <option value=''>All</option>
                    {legalStatuses.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className='flex flex-col text-sm text-sand'>
                  <span className='mb-1 font-semibold uppercase tracking-wide text-xs text-sand/70'>Region</span>
                  <select
                    value={regionFilter}
                    onChange={e => setRegionFilter(e.target.value)}
                    className='rounded-md bg-space-dark/70 px-3 py-2 text-sm text-sand backdrop-blur-md hover:bg-white/10'
                  >
                    <option value=''>All</option>
                    {regions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {hasActiveSelectFilters && (
                <button
                  type='button'
                  onClick={clearSelectFilters}
                  className='flex items-center gap-1 text-sm text-sand/80 hover:text-sand'
                >
                  <RotateCcw size={14} /> Reset filters
                </button>
              )}
              <TagFilterBar allTags={allTags} activeTags={filteredTags} onToggleTag={toggleTag} />
            </div>

            {relatedTags.length > 0 && (
              <div className='mb-4 flex flex-wrap items-center gap-2'>
                <span className='text-sm text-moss'>Related tags:</span>
                {relatedTags.map(tag => (
                  <button
                    key={tag}
                    type='button'
                    onClick={() => setFilteredTags(t => Array.from(new Set([...t, tag])))}
                    className='tag-pill'
                  >
                    {decodeTag(tag)}
                  </button>
                ))}
              </div>
            )}

            <CategoryAnalytics />
            <HerbList herbs={displayHerbs} highlightQuery={query} view={viewMode} />
            <footer className='mt-4 text-center text-sm text-moss'>
              Total herbs: {summary.total} · Affiliate links: {summary.affiliates} · MOA documented:{' '}
              {summary.moaCount} · Updated: {new Date(buildTime).toLocaleDateString()}
            </footer>
          </div>
        </div>
      </>
    </ErrorBoundary>
  )
}
