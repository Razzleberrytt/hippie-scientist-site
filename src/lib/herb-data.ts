import { useEffect, useState } from 'react'
import type { Herb } from '@/types'

let herbsPromise: Promise<Herb[]> | null = null

export async function loadHerbData(): Promise<Herb[]> {
  if (!herbsPromise) {
    herbsPromise = import('@/data/herbs/herbs.normalized.json')
      .then(module => module.default as Herb[])
      .catch(error => {
        herbsPromise = null
        throw error
      })
  }

  return herbsPromise
}

export function useHerbData() {
  const [herbs, setHerbs] = useState<Herb[]>([])

  useEffect(() => {
    let alive = true
    loadHerbData()
      .then(items => {
        if (!alive) return
        setHerbs(items)
      })
      .catch(() => {
        if (!alive) return
        setHerbs([])
      })

    return () => {
      alive = false
    }
  }, [])

  return herbs
}
