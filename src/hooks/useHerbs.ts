import { useEffect, useMemo } from 'react'
import type { Herb } from '../types'
import { useHerbsFull } from '../data/herbs/herbsfull'
import { herbName } from '../utils/herb'
import { recordDevMessage } from '../utils/devMessages'

export function useHerbs(): Herb[] {
  const herbs = useHerbsFull()

  const herbList = useMemo(() => {
    const map = new Map<string, Herb>()
    herbs.forEach(h => {
      const key = h.id || h.slug
      if (!key) return
      if (!map.has(key)) map.set(key, h)
    })
    return Array.from(map.values())
  }, [herbs])

  useEffect(() => {
    if (!import.meta.env.DEV) return

    herbList.forEach(h => {
      const missing: string[] = []
      if (!h.description) missing.push('description')
      if (!h.mechanism) missing.push('mechanism')
      if (!(Array.isArray(h.compounds) && h.compounds.length)) missing.push('compounds')
      if (missing.length) {
        recordDevMessage('warning', `${herbName(h)} missing: ${missing.join(', ')}`)
      }
    })
  }, [herbList])

  return herbList
}
