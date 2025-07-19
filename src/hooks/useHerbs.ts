import React from 'react'
import type { Herb } from '../types'
import herbsData from '../data/herbs'

export function useHerbs(): Herb[] {
  const [herbs] = React.useState<Herb[]>(herbsData)

  React.useEffect(() => {
    const incomplete = herbsData.filter(
      h => !h.affiliateLink || !h.activeConstituents?.length || !h.mechanismOfAction
    )
    if (incomplete.length) {
      console.groupCollapsed('Herb data missing fields')
      incomplete.forEach(h => {
        const missing: string[] = []
        if (!h.affiliateLink) missing.push('affiliateLink')
        if (!h.activeConstituents?.length) missing.push('activeConstituents')
        if (!h.mechanismOfAction) missing.push('mechanismOfAction')
        console.log(`${h.name}: ${missing.join(', ')}`)
      })
      console.groupEnd()
    }
  }, [])

  return herbs
}
