import React from 'react'
import type { Herb } from '../types'
import { herbs } from '../../herbsfull'

export function useHerbs(): Herb[] {
  const [herbList] = React.useState<Herb[]>(herbs)

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
