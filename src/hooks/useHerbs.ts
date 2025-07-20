import React from 'react'
import type { Herb } from '../types'
import herbsData from '../data/herbs'
import { validateHerb } from '../utils/validateHerb'

interface Result {
  herbs: Herb[]
  loading: boolean
}

export function useHerbs(): Result {
  const [herbs, setHerbs] = React.useState<Herb[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true
    fetch('/validated-master-herbs.json')
      .then(res => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: Herb[]) => {
        if (!mounted) return
        const parsed = Array.isArray(data) ? data : []
        const validated = parsed
          .map(validateHerb)
          .filter((h): h is Herb => h !== null)
        validated.sort((a, b) => a.name.localeCompare(b.name))
        setHerbs(validated)
      })
      .catch(err => {
        console.error('Failed loading herbs', err)
        const validated = herbsData
          .map(validateHerb)
          .filter((h): h is Herb => h !== null)
        validated.sort((a, b) => a.name.localeCompare(b.name))
        setHerbs(validated)
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

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

  return { herbs, loading }
}
