import { useState, useEffect } from 'react'
import type { Herb } from '../types'

export function useHerbs() {
  const [herbs, setHerbs] = useState<Herb[]>([])

  useEffect(() => {
    import('../../Full79.json?raw').then(m => {
      const cleaned = (m.default as string).replace(/NaN/g, 'null')
      setHerbs(JSON.parse(cleaned) as Herb[])
    })
  }, [])

  return herbs
}
