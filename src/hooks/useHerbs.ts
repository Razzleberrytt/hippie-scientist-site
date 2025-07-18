import React from 'react'
import type { Herb } from '../types'
import herbsData from '../data/herbs'

export function useHerbs(): Herb[] {
  const [herbs] = React.useState<Herb[]>(herbsData)
  return herbs
}
