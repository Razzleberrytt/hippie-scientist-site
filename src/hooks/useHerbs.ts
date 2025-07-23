import React from 'react'
import type { Herb } from '../types'
import herbData from '../data/herbData'

export function useHerbs(): Herb[] {
  const [herbList] = React.useState<Herb[]>(() => {
    const map = new Map<string, Herb>()
    herbData
      .filter((e: any) => 'slug' in e)
      .forEach((h: any) => {
        const entry: Herb = {
          id: h.id ?? h.slug,
          category: h.category ?? 'Unknown',
          ...h,
        }
        if (!map.has(entry.id)) map.set(entry.id, entry)
      })
    return Array.from(map.values())
  })

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
  }, [])

  return herbList
}
