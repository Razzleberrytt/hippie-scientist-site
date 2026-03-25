import type { Herb } from '../../types'
import { loadHerbData, useHerbData } from '@/lib/herb-data'
import { decorateHerbs } from '../../lib/herbs'

let cachedHerbs: Herb[] | null = null
let herbsPromise: Promise<Herb[]> | null = null

async function resolveHerbs(): Promise<Herb[]> {
  if (cachedHerbs) return cachedHerbs
  if (!herbsPromise) {
    herbsPromise = loadHerbData()
      .then(items => {
        const decorated = decorateHerbs(items)
        cachedHerbs = decorated
        return decorated
      })
      .catch(error => {
        herbsPromise = null
        throw error
      })
  }

  return herbsPromise
}

/** @deprecated Use loadHerbData from '@/lib/herb-data' */
export async function loadHerbsFull(): Promise<Herb[]> {
  return resolveHerbs()
}

/** @deprecated Use useHerbData from '@/lib/herb-data' */
export function useHerbsFull(): Herb[] {
  return useHerbData()
}

/** @deprecated Use useHerbData from '@/lib/herb-data' */
export function getHerbsSnapshot(): Herb[] {
  return cachedHerbs ?? []
}
