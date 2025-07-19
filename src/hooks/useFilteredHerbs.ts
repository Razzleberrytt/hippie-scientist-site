import React from 'react'
import { useLocalStorage } from './useLocalStorage'
import Fuse from 'fuse.js'
import type { Herb } from '../types'
import { extractAliases, extraAliases } from '../utils/herbAlias'
import { canonicalTag, aliasFor } from '../utils/tagUtils'

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

export function useFilteredHerbs(herbs: Herb[] | undefined, options: Options = {}) {
  const { favorites = [] } = options
  const safeHerbs = herbs ?? []
  const [query, setQuery] = React.useState('')
  const [tags, setTags] = React.useState<string[]>([])
  const [tagMode, setTagMode] = React.useState<'AND' | 'OR'>('AND')
  const [favoritesOnly, setFavoritesOnly] = React.useState(false)
  const [categories, setCategories] = useLocalStorage<string[]>('dbCategories', [])
  const [sort, setSort] = React.useState('')

  const fuseData = React.useMemo(
    () =>
      safeHerbs.map(h => ({
        ...h,
        aliases: [
          ...extractAliases(h.name),
          ...(extraAliases[h.id] || extraAliases[h.name.toLowerCase()] || []),
        ],
        tagAliases: h.tags.map(t => aliasFor(canonicalTag(t))).filter(Boolean) as string[],
      })),
    [safeHerbs]
  )

  const fuse = React.useMemo(
    () =>
      new Fuse(fuseData, {
        keys: [
          'name',
          'aliases',
          'scientificName',
          'activeConstituents.name',
          'effects',
          'description',
          'tags',
          'tagAliases',
        ],
        threshold: 0.4,
        includeMatches: true,
        isCaseSensitive: false,
        ignoreLocation: true,
      }),
    [fuseData]
  )

  const [matchMap, setMatchMap] = React.useState<Record<string, Fuse.FuseResultMatch[]>>({})

  const filtered = React.useMemo(() => {
    let results: { item: Herb; matches?: Fuse.FuseResultMatch[] }[] = []
    const q = query.trim()
    if (q) {
      results = fuse.search(q)
    } else {
      results = safeHerbs.map(item => ({ item }))
    }
    const map: Record<string, Fuse.FuseResultMatch[]> = {}
    results.forEach(r => {
      if (r.matches) map[r.item.id] = r.matches
    })
    setMatchMap(map)
    let res = results.map(r => r.item)
    if (tags.length) {
      res = res.filter(h => {
        const matches = tags.map(t => h.tags.some(ht => canonicalTag(ht) === canonicalTag(t)))
        return tagMode === 'AND' ? matches.every(Boolean) : matches.some(Boolean)
      })
    }
    if (categories.length) {
      res = res.filter(h => categories.includes(metaCategory(h.category)))
    }
    if (favoritesOnly) {
      res = res.filter(h => favorites.includes(h.id))
    }
    if (sort === 'name') {
      res = [...res].sort((a, b) => a.name.localeCompare(b.name))
    }
    return res
  }, [safeHerbs, query, tags, categories, favoritesOnly, favorites, sort, fuse])

  return {
    filtered,
    matches: matchMap,
    query,
    setQuery,
    tags,
    setTags,
    tagMode,
    setTagMode,
    categories,
    setCategories,
    favoritesOnly,
    setFavoritesOnly,
    sort,
    setSort,
    fuse,
  }
}
