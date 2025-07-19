import React from 'react'
import Fuse from 'fuse.js'
import type { Herb } from '../types'
import { extractAliases } from '../utils/herbAlias'
import { canonicalTag } from '../utils/tagUtils'

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
  const [tagMode, setTagMode] = React.useState<'AND' | 'OR'>('AND')
  const [favoritesOnly, setFavoritesOnly] = React.useState(false)
  const [categories, setCategories] = React.useState<string[]>([])
  const [sort, setSort] = React.useState('')

  const fuseData = React.useMemo(
    () =>
      herbs.map(h => ({
        ...h,
        aliases: extractAliases(h.name),
      })),
    [herbs]
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
        ],
        threshold: 0.4,
        includeMatches: true,
        isCaseSensitive: false,
        ignoreLocation: true,
      }),
    [fuseData]
  )

  const filtered = React.useMemo(() => {
    let res = herbs
    const q = query.trim()
    if (q) {
      res = fuse.search(q).map(r => r.item)
    }
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
  }, [herbs, query, tags, categories, favoritesOnly, favorites, sort, fuse])

  return {
    filtered,
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
