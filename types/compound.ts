import type { SourceReference } from './herb'

export type IndexableCompound = string | {
  slug: string
  name?: string
  common_name?: string
  category?: string
  title?: string
  description?: string
  sources?: SourceReference[]
  _enriched?: boolean | Record<string, unknown>
}

export interface CompoundRecord {
  slug: string
  name: string
  common_name?: string
  category?: string
  summary?: string
  description?: string
  effects?: string[]
  primary_effects?: string[]
  mechanisms?: string[]
  profile_status?: string
  evidence_tier?: string
  robots?: string
  sitemap_included?: boolean
  sources?: SourceReference[]
  _enriched?: boolean | Record<string, unknown>
  [key: string]: unknown
}
