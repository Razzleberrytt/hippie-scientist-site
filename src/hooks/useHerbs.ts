import React from 'react'
import type { Herb } from '../types'
import { herbs } from '../data/herbs/herbsfull'
import { herbName } from '../utils/herb'
import { recordDevMessage } from '../utils/devMessages'

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
