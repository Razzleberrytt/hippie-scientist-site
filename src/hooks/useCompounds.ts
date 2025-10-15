import React from 'react'
import { compounds, Compound } from '../data/compounds/compounds'
import { herbs } from '../data/herbs/herbsfull'
import { recordDevMessage } from '../utils/devMessages'

export function useCompounds(): Compound[] {
  const [list] = React.useState<Compound[]>(compounds)

  React.useEffect(() => {
    list.forEach(c => {
      const refs = c.foundInHerbs ?? c.sourceHerbs
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
  }, [list])

  return list
}
