import React from 'react'
import Fuse from 'fuse.js'
import type { Herb } from '../types'
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
  const [favoritesOnly, setFavoritesOnly] = React.useState(false)
  const [categories, setCategories] = React.useState<string[]>([])
  const [sort, setSort] = React.useState('')

  const fuse = React.useMemo(
    () =>
      new Fuse(herbs, {
        keys: ['name', 'scientificName', 'effects', 'description', 'tags'],
        threshold: 0.4,
        includeMatches: true,
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
      res = res.filter(h =>
        tags.every(t => h.tags.some(ht => canonicalTag(ht) === canonicalTag(t)))
      )
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
    categories,
    setCategories,
    favoritesOnly,
    setFavoritesOnly,
    sort,
    setSort,
    fuse,
  }
}
