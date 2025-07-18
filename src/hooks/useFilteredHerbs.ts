import React from 'react'
import Fuse from 'fuse.js'
import type { Herb } from '../types'

interface Options {
  favorites?: string[]
}

export function useFilteredHerbs(herbs: Herb[], options: Options = {}) {
  const { favorites = [] } = options
  const [query, setQuery] = React.useState('')
  const [tags, setTags] = React.useState<string[]>([])
  const [favoritesOnly, setFavoritesOnly] = React.useState(false)
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
      res = res.filter(h => tags.every(t => h.tags.includes(t)))
    }
    if (favoritesOnly) {
      res = res.filter(h => favorites.includes(h.id))
    }
    if (sort === 'name') {
      res = [...res].sort((a, b) => a.name.localeCompare(b.name))
    }
    return res
  }, [herbs, query, tags, favoritesOnly, favorites, sort, fuse])

  return {
    filtered,
    query,
    setQuery,
    tags,
    setTags,
    favoritesOnly,
    setFavoritesOnly,
    sort,
    setSort,
    fuse,
  }
}
