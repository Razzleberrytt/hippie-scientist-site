import type { ConfidenceLevel } from './confidence'

export type CanonicalCompound = {
  name: string
  category: string
  mechanism: string
  effects: string[]
  safety: string[]
  herbs: string[]
  confidence?: ConfidenceLevel
}

export type Compound = {
  name: string
  category?: string
  mechanism?: string
  effects?: string[]
  safety?: string[]
  interactionTags?: string[]
  interactionNotes?: string[]
  herbs?: string[]
  confidence?: ConfidenceLevel
  type?: string
  foundIn?: string[]
  [key: string]: unknown
}
