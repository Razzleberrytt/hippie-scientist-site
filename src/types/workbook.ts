export interface WorkbookRow {
  [key: string]: string | number | boolean | null | undefined
}

export interface HerbWorkbookRow extends WorkbookRow {
  slug?: string
  name?: string
  scientific_name?: string
  common_names?: string
  summary?: string
  description?: string
  primary_effects?: string
  mechanisms?: string
  safety_level?: string
  typical_dosage?: string
  dosage_notes?: string
  affiliate_url?: string
  doNotMonetize?: string | boolean
  doNotPromote?: string | boolean
  governance_status?: string
  legal_status?: string
  controlled_status?: string
  controlled_schedule?: string
  dea_status?: string
  dea_watchlist_status?: string
  regulatory_status?: string
}

export interface CompoundWorkbookRow extends WorkbookRow {
  slug?: string
  name?: string
  displayName?: string
  primary_effect?: string
  primary_effects?: string
  mechanism_summary?: string
  safety_notes?: string
  evidence_grade?: string
  evidenceTier?: string
  summary_quality?: string
  profile_status?: string
  scispace_primary_fact_v2?: string
  scispace_key_facts_v2?: string
  fact_score_v2?: number | string
  tier_level?: string
  tier3_priority_v1?: string | number | boolean
  doNotMonetize?: string | boolean
  doNotPromote?: string | boolean
  governance_status?: string
  legal_status?: string
  controlled_status?: string
  controlled_schedule?: string
  dea_status?: string
  dea_watchlist_status?: string
  regulatory_status?: string
}

export interface ClaimWorkbookRow extends WorkbookRow {
  slug?: string
  entity_type?: 'herb' | 'compound'
  claim?: string
  effect?: string
  evidence_level?: string
  evidence_tier?: string
  study_design?: string
  pubmed_id?: string
  citation_title?: string
  citation_author?: string
  citation_year?: number | string
  citation_journal?: string
}

export interface EvidenceSourceWorkbookRow extends WorkbookRow {
  id?: string
  title?: string
  url?: string
  note?: string
  year?: number | string
}

export interface WorkbookSheet<T extends WorkbookRow = WorkbookRow> {
  name: string
  rows: T[]
}
