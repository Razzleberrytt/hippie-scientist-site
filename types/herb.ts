export type SourceReference = string | {
  title?: string
  url?: string
  note?: string
  pmid?: string | number
}

export interface IndexableHerb {
  slug: string
  name: string
  common_name?: string
  category?: string
  title?: string
  description?: string
  sources?: SourceReference[]
  _enriched?: boolean | Record<string, unknown>
}

export interface HerbRecord extends IndexableHerb {
  summary?: string
  effects?: string[]
  primary_effects?: string[]
  mechanisms?: string[]
  profile_status?: string
  evidence_tier?: string
  robots?: string
  sitemap_included?: boolean
  [key: string]: unknown
}
