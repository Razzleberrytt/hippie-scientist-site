// src/types/interactions.ts
// Mirrors the shape emitted by scripts/data/build-interaction-data.mjs
// into public/data/interaction_edges.json and entity_risk_tags.json.

import type { SafetyCertainty, SafetyRiskClass } from '../lib/safety-governance'

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

export interface InteractionProvenance {
  source_ids: string[]
  reviewed_at?: string
  note?: string
}

export interface InteractionEdge {
  partner_slug: string
  partner_name: string
  risk_mechanism: RiskMechanism
  severity: InteractionSeverity
  weight: number
  claim_language: string
  notes: string
  /** Separate from severity: how certain the interaction claim itself is. */
  certainty?: SafetyCertainty
  /** Risk class drives review/suppression policy without changing certainty. */
  risk_class?: SafetyRiskClass
  provenance?: InteractionProvenance
  unsupervised_use_inappropriate?: boolean
}

export interface RiskTag {
  risk_mechanism: RiskMechanism
  pair_behavior: 'additive' | 'single_only'
  matched_text: string
  confidence: 'high' | 'inferred'
  certainty?: SafetyCertainty
  provenance?: InteractionProvenance
}

export type InteractionEdgesBySlug = Record<string, InteractionEdge[]>
export type RiskTagsBySlug = Record<string, RiskTag[]>
export type SlugEntityType = 'herb' | 'compound'
export type SlugEntityTypeMap = Record<string, SlugEntityType>
