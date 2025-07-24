import React from 'react'
import type { Herb } from '../types'
import { herbs as fallback } from '../data/herbs/herbsfull'

export function useHerbs(): {
  herbs: Herb[]
  loading: boolean
  error: string | null
} {
  const [herbList, setHerbList] = React.useState<Herb[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/database.json')
        if (!res.ok) throw new Error(`status ${res.status}`)
        const data = await res.json()
        if (!Array.isArray(data)) throw new Error('invalid format')
        const map = new Map<string, Herb>()
        data
          .filter((h: any) => h && typeof h.name === 'string')
          .forEach((h: Herb) => {
            if (h.id && !map.has(h.id)) map.set(h.id, h)
          })
        setHerbList(Array.from(map.values()))
      } catch (err) {
        console.error('Failed to fetch database', err)
        setError((err as Error).message)
        const map = new Map<string, Herb>()
        fallback.forEach(h => {
          if (!map.has(h.id)) map.set(h.id, h)
        })
        setHerbList(Array.from(map.values()))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  React.useEffect(() => {
    if (!import.meta.env.DEV) return

    herbList.forEach(h => {
      const missing: string[] = []
      if (!h.affiliateLink) missing.push('affiliateLink')
      if (!h.activeConstituents?.length) missing.push('activeConstituents')
      if (!h.mechanismOfAction) missing.push('mechanismOfAction')
      if (missing.length) {
        console.warn(`${h.name} missing: ${missing.join(', ')}`)
      }
    })
  }, [herbList])

  return { herbs: herbList, loading, error }
}
