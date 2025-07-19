import React from 'react'
import type { Herb } from '../types'

async function fetchHerbs(url: string): Promise<Herb[]> {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.status}`)
    }
    const text = await res.text()
    return JSON.parse(text.replace(/NaN/g, 'null')) as Herb[]
  } catch (err) {
    console.error('Error fetching herb data from', url, err)
    throw err
  }
}

export function useHerbs(): Herb[] | undefined {
  const [herbs, setHerbs] = React.useState<Herb[] | undefined>(undefined)

  React.useEffect(() => {
    let active = true
    async function load() {
      try {
        const base = import.meta.env.BASE_URL || '/'
        const data = await fetchHerbs(`${base}data/Full200.json`)
        if (active) setHerbs(data)
      } catch (err) {
        console.error('Failed to load Full200.json', err)
        try {
          const data = await fetchHerbs('/data/Full79.json')
          if (active) setHerbs(data)
        } catch (err2) {
          console.error('Failed to load fallback herb data', err2)
          if (active) setHerbs([])
        }
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  return herbs
}
