import React from 'react'
import herbData from '../data/herbData'

export interface Compound {
  name: string
  type: string
  description: string
  foundIn: string[]
  psychoactivity: string
  mechanismOfAction: string
  [key: string]: any
}

const compounds: Compound[] = herbData.filter((e: any) => 'foundIn' in e) as Compound[]
const herbs = herbData.filter((e: any) => 'slug' in e) as any[]

export function useCompounds(): Compound[] {
  const [list] = React.useState<Compound[]>(compounds)

  React.useEffect(() => {
    list.forEach(c => {
      const refs = (c as any).foundInHerbs ?? c.foundIn ?? []
      refs.forEach((h: string) => {
        if (!herbs.find(x => (x as any).id === h || (x as any).slug === h)) {
          console.warn(`Compound ${c.name} references missing herb: ${h}`)
        }
      })
    })

    herbs.forEach(h => {
      ;(h as any).activeConstituents?.forEach((cn: any) => {
        if (!list.find(c => c.name.toLowerCase() === cn.name.toLowerCase())) {
          console.warn(`Herb ${h.name} lists unknown compound: ${cn.name}`)
        }
      })
    })
  }, [list])

  return list
}
