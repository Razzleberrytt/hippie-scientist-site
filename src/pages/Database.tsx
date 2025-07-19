// src/pages/Database.tsx

import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import HerbList from '../components/HerbList'
import TagFilterBar from '../components/TagFilterBar'
import CategoryAnalytics from '../components/CategoryAnalytics'
import TagDistribution from '../components/TagDistribution'
import CategoryFilter from '../components/CategoryFilter'
import { decodeTag } from '../utils/format'
import { canonicalTag } from '../utils/tagUtils'
import StarfieldBackground from '../components/StarfieldBackground'
import { useHerbs } from '../hooks/useHerbs'
import { useHerbFavorites } from '../hooks/useHerbFavorites'
import SearchBar from '../components/SearchBar'
import { Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useFilteredHerbs } from '../hooks/useFilteredHerbs'
import { getLocal, setLocal } from '../utils/localStorage'

export default function Database() {
  const herbs = useHerbs()
  const { favorites } = useHerbFavorites()
  const {
    filtered,
    query,
    setQuery,
    tags: filteredTags,
    setTags: setFilteredTags,
    matchAll,
    setMatchAll,
    categories: filteredCategories,
    setCategories: setFilteredCategories,
    favoritesOnly,
    setFavoritesOnly,
    fuse,
  } = useFilteredHerbs(herbs, { favorites })

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
    const t = herbs.reduce<string[]>((acc, h) => acc.concat(h.tags), [])
    return Array.from(new Set(t.map(canonicalTag)))
  }, [herbs])

  const summary = React.useMemo(() => {
    const affiliates = herbs.filter(
      h => h.affiliateLink && h.affiliateLink.startsWith('http')
    ).length
    const moaCount = herbs.filter(h => h.mechanismOfAction && h.mechanismOfAction.trim()).length
    return { total: herbs.length, affiliates, moaCount }
  }, [herbs])

  const tagCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    herbs.forEach(h => {
      h.tags.forEach(t => {
        const canon = canonicalTag(t)
        counts[canon] = (counts[canon] || 0) + 1
      })
    })
    return counts
  }, [herbs])

  const [filtersOpen, setFiltersOpen] = React.useState(false)
  const [showBar, setShowBar] = React.useState(true)

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
      if (filteredTags.every(t => h.tags.some(ht => canonicalTag(ht) === canonicalTag(t)))) {
        h.tags.forEach(t => {
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

  return (
    <>
      <Helmet>
        <title>Database - The Hippie Scientist</title>
        <meta
          name='description'
          content='Browse herbal entries and expand each to learn more about their effects and usage.'
        />
      </Helmet>

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
            <CategoryFilter selected={filteredCategories} onChange={setFilteredCategories} />
            <TagFilterBar tags={allTags} counts={tagCounts} onChange={setFilteredTags} />
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
          <TagDistribution
            counts={tagCounts}
            selected={filteredTags}
            onClick={tag =>
              setFilteredTags(t => Array.from(new Set([...t, tag])))
            }
          />
          <HerbList herbs={filtered} highlightQuery={query} />
          <footer className='mt-4 text-center text-sm text-moss'>
            Total herbs: {summary.total} · Affiliate links: {summary.affiliates} · MOA documented:{' '}
            {summary.moaCount} · Updated: {new Date(__BUILD_TIME__).toLocaleDateString()}
          </footer>
        </div>
      </div>
    </>
  )
}
