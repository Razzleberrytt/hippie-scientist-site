import { useState, useEffect } from 'react'
import type { Herb } from '../types'

export function useHerbs() {
  const [herbs, setHerbs] = useState<Herb[]>([])

  useEffect(() => {
    import('../data/herbs.json').then(m => {
      setHerbs(m.default as Herb[])
    })
  }, [])

  return herbs
}
