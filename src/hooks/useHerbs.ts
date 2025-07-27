import React from 'react'
import type { Herb } from '../types'
// Load the full herb dataset once for use across pages
import { herbs } from '../data/herbs/herbsfull'

export function useHerbs(): Herb[] {
  const [herbList] = React.useState<Herb[]>(() => {
    const map = new Map<string, Herb>()
    herbs.forEach(h => {
      if (!map.has(h.id)) map.set(h.id, h)
    })
    return Array.from(map.values())
  })

  React.useEffect(() => {
    if (!import.meta.env.DEV) return

    herbs.forEach(h => {
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
