import React from 'react'
import type { Herb } from '../types'
import herbsData from '../data/herbs'

export function useHerbs(): Herb[] {
  const [herbs] = React.useState<Herb[]>(herbsData)

  React.useEffect(() => {
    const missing = herbsData.filter(
      h =>
        !h.affiliateLink ||
        !h.activeConstituents?.length ||
        !h.mechanismOfAction
    )
    if (missing.length) {
      console.groupCollapsed('Herb data missing fields')
      missing.forEach(h => {
        console.log(h.id ?? h.name, {
          affiliateLink: h.affiliateLink ?? 'N/A',
          activeConstituents: h.activeConstituents?.length
            ? 'ok'
            : 'N/A',
          mechanismOfAction: h.mechanismOfAction ?? 'N/A',
        })
      })
      console.groupEnd()
    }
  }, [])

  return herbs
}
