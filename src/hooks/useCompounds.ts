import { useEffect, useState } from 'react'
import { compounds, Compound } from '../data/compounds/compounds'
import { useHerbsFull } from '../data/herbs/herbsfull'
import { recordDevMessage } from '../utils/devMessages'
import { calculateCompoundConfidence } from '@/utils/calculateConfidence'

export function useCompounds(): Compound[] {
  const [list] = useState<Compound[]>(
    compounds.map(compound => ({
      ...compound,
      confidence: calculateCompoundConfidence({
        mechanism: compound.mechanismOfAction,
        effects: compound.description,
        compounds: compound.foundIn,
      }),
    }))
  )
  const herbs = useHerbsFull()

  useEffect(() => {
    list.forEach(c => {
      const refs = c.foundInHerbs ?? c.sourceHerbs ?? []
      refs.forEach(h => {
        if (!herbs.find(x => x.id === h)) {
          recordDevMessage('warning', `Compound ${c.name} references missing herb: ${h}`)
        }
      })
    })

    herbs.forEach(h => {
      h.activeConstituents?.forEach(cn => {
        if (!list.find(c => c.name.toLowerCase() === cn.name.toLowerCase())) {
          recordDevMessage('warning', `Herb ${h.name} lists unknown compound: ${cn.name}`)
        }
      })
    })
  }, [herbs, list])

  return list
}
