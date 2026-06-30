// src/types/interactions.ts
// Mirrors the shape emitted by scripts/data/build-interaction-data.mjs
// into public/data/interaction_edges.json and entity_risk_tags.json.

export type InteractionSeverity = 'severe' | 'moderate' | 'caution'
export type RiskMechanism =
  | 'serotonergic'
  | 'anticoagulant'
  | 'cns_sedation'
  | 'blood_glucose'
  | 'blood_pressure'
  | 'hepatic'
  | 'immunosuppressant'
  | 'renal'
  | 'pregnancy'
  | 'allergy'
  | 'thyroid'

export interface InteractionEdge {
  partner_slug: string
  partner_name: string
  risk_mechanism: RiskMechanism
  severity: InteractionSeverity
  weight: number
  claim_language: string
  notes: string
}

export interface RiskTag {
  risk_mechanism: RiskMechanism
  pair_behavior: 'additive' | 'single_only'
  matched_text: string
  confidence: 'high' | 'inferred'
}

export type InteractionEdgesBySlug = Record<string, InteractionEdge[]>
export type RiskTagsBySlug = Record<string, RiskTag[]>
export type SlugEntityType = 'herb' | 'compound'
export type SlugEntityTypeMap = Record<string, SlugEntityType>
