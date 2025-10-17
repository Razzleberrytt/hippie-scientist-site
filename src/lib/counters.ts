import { useEffect, useState } from 'react'
import posts from '../../public/blogdata/index.json'
import { getAllCompounds } from '@/lib/compounds'
import type { Herb } from '@/types'
import { loadHerbData } from '@/lib/herb-data'

type HerbEntry = {
  active_compounds?: unknown
  compounds?: unknown
} & Herb

type PostEntry = {
  draft?: boolean
  published?: boolean
}

export type Counters = {
  herbCount: number
  compoundCount: number
  articleCount: number
}

const decoratedCompounds = getAllCompounds()
const postsList = Array.isArray(posts) ? (posts as PostEntry[]) : []
const baseArticleCount = postsList.filter(post => !post?.draft && post?.published !== false).length

const baseCounters: Counters = {
  herbCount: 0,
  compoundCount: decoratedCompounds.length,
  articleCount: baseArticleCount,
}

let countersPromise: Promise<Counters> | null = null

function computeCounters(herbs: HerbEntry[]): Counters {
  const compoundSet = new Set<string>()

  for (const herb of herbs) {
    const list = Array.isArray(herb.active_compounds)
      ? herb.active_compounds
      : Array.isArray(herb.compounds)
        ? (herb.compounds as unknown[])
        : []

    for (const compound of list) {
      if (typeof compound === 'string' && compound.trim()) {
        compoundSet.add(compound.toLowerCase().trim())
      }
    }
  }

  decoratedCompounds.forEach(compound => {
    if (compound.common) compoundSet.add(compound.common.toLowerCase())
    if (compound.scientific) compoundSet.add(compound.scientific.toLowerCase())
    if (compound.name) compoundSet.add(String(compound.name).toLowerCase())
  })

  return {
    herbCount: herbs.length,
    compoundCount: decoratedCompounds.length || compoundSet.size,
    articleCount: baseArticleCount,
  }
}

export function getInitialCounters(): Counters {
  return { ...baseCounters }
}

export async function loadCounters(): Promise<Counters> {
  if (!countersPromise) {
    countersPromise = loadHerbData()
      .then(items => computeCounters(items as HerbEntry[]))
      .catch(error => {
        countersPromise = null
        throw error
      })
  }

  return countersPromise
}

export function useCounters() {
  const [counters, setCounters] = useState<Counters>(getInitialCounters())

  useEffect(() => {
    let alive = true
    loadCounters()
      .then(result => {
        if (!alive) return
        setCounters(result)
      })
      .catch(() => {
        if (!alive) return
        setCounters(getInitialCounters())
      })

    return () => {
      alive = false
    }
  }, [])

  return counters
}
