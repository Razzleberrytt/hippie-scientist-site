import type { Herb } from './herb'
import type { ConfidenceLevel } from './confidence'

export type BlendFilters = {
  experience?: 'beginner' | 'intermediate' | 'advanced'
  confidence?: 'all' | ConfidenceLevel
  excludeHerbs?: string[]
}

export type BlendResult = {
  primary: Herb | null
  supporting: Herb[]
  reasoning: string[]
  usedLowConfidenceData: boolean
}

export type BlendState = {
  goal: string
  primary: string
  supporting: string[]
  confidence?: ConfidenceLevel
}
