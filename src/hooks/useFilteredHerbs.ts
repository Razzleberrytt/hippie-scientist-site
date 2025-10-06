import React from 'react'
import Fuse from 'fuse.js'
import type { Herb } from '../types'
import { canonicalTag } from '../utils/tagUtils'
import { herbName, splitField } from '../utils/herb'

interface Options {
  favorites?: string[]
}

export function metaCategory(cat: string): string {
  const c = cat.toLowerCase()
  if (/(empathogen|euphoriant)/.test(c)) return 'Empathogen'
  if (/(psychedelic|visionary)/.test(c)) return 'Psychedelic'
  if (/dissociative|sedative/.test(c)) return 'Dissociative'
  if (/oneirogen|dream/.test(c)) return 'Oneirogen'
  return 'Other'
}

export function useFilteredHerbs(herbs: Herb[], options: Options = {}) {
  const { favorites = [] } = options
  const [query, setQuery] = React.useState('')
  const [tags, setTags] = React.useState<string[]>([])
  const [matchAll, setMatchAll] = React.useState(true)
  const [favoritesOnly, setFavoritesOnly] = React.useState(false)
  const [categories, setCategories] = React.useState<string[]>([])
  const [sort, setSort] = React.useState('name')

  const blendScore = React.useCallback((h: Herb) => {
    const inDesc = h.description?.toLowerCase().includes('blend') || false
    const inPrep = h.preparation?.toLowerCase().includes('blend') || false
    const inTags = splitField(h.tags).some(t => t.toLowerCase().includes('blend'))
    return [inDesc, inPrep, inTags].filter(Boolean).length
  }, [])

  const fuse = React.useMemo(
    () =>
      new Fuse(herbs, {
        keys: [
          { name: 'common', weight: 0.8 },
          { name: 'nameNorm', weight: 0.7 },
          { name: 'scientific', weight: 0.7 },
          { name: 'scientificname', weight: 0.6 },
          { name: 'compounds', weight: 0.5 },
          { name: 'tags', weight: 0.4 },
        ],
        threshold: 0.35,
        includeMatches: true,
        isCaseSensitive: false,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [herbs]
  )

  const filtered = React.useMemo(() => {
    let res = herbs
    const q = query.trim()
    if (q) {
      res = fuse.search(q).map(r => r.item)
    }
    if (tags.length) {
      res = res.filter(h => {
        const herbTags = splitField(h.tags)
        return matchAll
          ? tags.every(t =>
              herbTags.some(ht => canonicalTag(ht) === canonicalTag(t))
            )
          : tags.some(t =>
              herbTags.some(ht => canonicalTag(ht) === canonicalTag(t))
            )
      })
    }
    if (categories.length) {
      res = res.filter(h => categories.includes(metaCategory(h.category)))
    }
    if (favoritesOnly) {
      res = res.filter(h => favorites.includes(h.id))
    }
    if (sort === 'name') {
      res = [...res].sort((a, b) => herbName(a).localeCompare(herbName(b)))
    } else if (sort === 'category') {
      res = [...res].sort((a, b) => a.category.localeCompare(b.category))
    } else if (sort === 'intensity') {
      res = [...res].sort((a, b) => (a.intensity || '').localeCompare(b.intensity || ''))
    } else if (sort === 'blend') {
      res = [...res].sort((a, b) => blendScore(b) - blendScore(a))
    }
    return res
  }, [herbs, query, tags, categories, favoritesOnly, favorites, sort, fuse, matchAll])

  return {
    filtered,
    query,
    setQuery,
    tags,
    setTags,
    matchAll,
    setMatchAll,
    categories,
    setCategories,
    favoritesOnly,
    setFavoritesOnly,
    sort,
    setSort,
    fuse,
  }
}
