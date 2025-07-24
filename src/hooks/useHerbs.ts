import React from 'react'
import type { Herb } from '../types'
import { herbs as fallback } from '../data/herbs/herbsfull'

export function useHerbs(): {
  herbs: Herb[]
  loading: boolean
  error: string | null
} {
  // Start with an empty list so consuming components never receive `undefined`
  const [herbList, setHerbList] = React.useState<Herb[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await fetch('/database.json')
        if (!res.ok) throw new Error(`status ${res.status}`)
        const data: unknown = await res.json()
        if (!Array.isArray(data)) throw new Error('invalid format')
        const map = new Map<string, Herb>()
        data
          .filter((h: any) => h && typeof h.name === 'string')
          .forEach((h: Herb) => {
            if (h.id && !map.has(h.id)) map.set(h.id, h)
          })
        if (active) setHerbList(Array.from(map.values()))
      } catch (err) {
        console.error('Failed to fetch database', err)
        if (active) {
          setError((err as Error).message)
          // Fallback to the bundled data so the app still works offline
          const map = new Map<string, Herb>()
          fallback.forEach(h => {
            if (!map.has(h.id)) map.set(h.id, h)
          })
          setHerbList(Array.from(map.values()))
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
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
