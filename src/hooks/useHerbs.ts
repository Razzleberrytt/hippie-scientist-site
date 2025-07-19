import React from 'react'
import type { Herb } from '../types'
import herbsData from '../data/herbs'

export function useHerbs(): Herb[] {
  const [herbs] = React.useState<Herb[]>(herbsData)

  React.useEffect(() => {
    if (!import.meta.env.DEV) return

    herbsData.forEach(h => {
      const missing: string[] = []
      if (!h.affiliateLink) missing.push('affiliateLink')
      if (!h.activeConstituents?.length) missing.push('activeConstituents')
      if (!h.mechanismOfAction) missing.push('mechanismOfAction')
      if (missing.length) {
        console.warn(`${h.name} missing: ${missing.join(', ')}`)
      }
    })
  }, [])

  return herbs
}
