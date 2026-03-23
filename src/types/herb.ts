import type { ConfidenceLevel } from './confidence'

export type CanonicalHerb = {
  name: string
  class: string
  activeCompounds: string[]
  mechanism: string
  effects: string[]
  contraindications: string[]
  description?: string
  confidence?: ConfidenceLevel
}

export type Herb = {
  slug: string
  id?: string
  common?: string
  scientific?: string
  class?: string
  activeCompounds?: string[]
  mechanism?: string
  effects?: string[] | string
  contraindications?: string[] | string
  description?: string
  confidence?: ConfidenceLevel
  [key: string]: unknown
}
