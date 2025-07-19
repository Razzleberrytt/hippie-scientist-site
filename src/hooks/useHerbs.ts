import React from 'react'
import type { Herb } from '../types'

async function fetchHerbs(url: string): Promise<Herb[]> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  const text = await res.text()
  return JSON.parse(text.replace(/NaN/g, 'null')) as Herb[]
}

export function useHerbs(): Herb[] | undefined {
  const [herbs, setHerbs] = React.useState<Herb[] | undefined>(undefined)

  React.useEffect(() => {
    let active = true
    fetchHerbs('/data/Full200.json')
      .catch(err => {
        console.error('Failed to load Full200.json', err)
        return fetchHerbs('/data/Full79.json')
      })
      .then(data => {
        if (active) setHerbs(data)
      })
      .catch(err => {
        console.error('Failed to load fallback herb data', err)
        if (active) setHerbs([])
      })
    return () => {
      active = false
    }
  }, [])

  return herbs
}
