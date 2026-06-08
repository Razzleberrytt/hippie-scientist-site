import type { Herb, Compound, Claim, ComparisonPage, ConditionPage } from '../types/content'
import type { EvidenceSummary } from '../types/evidence'
import type { WorkbookRow } from '../types/workbook'
import type { RuntimeDataset } from '../types/generated'

export function isHerb(value: unknown): value is Herb {
  if (value === null || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  return typeof obj.slug === 'string' && (typeof obj.common === 'string' || typeof obj.scientific === 'string' || typeof obj.name === 'string')
}

export function isCompound(value: unknown): value is Compound {
  if (value === null || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  return typeof obj.name === 'string' && (obj.slug === undefined || typeof obj.slug === 'string') && !isHerb(value)
}

export function isClaim(value: unknown): value is Claim {
  if (value === null || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  return typeof obj.slug === 'string' && typeof obj.claim === 'string'
}

export function isEvidenceSummary(value: unknown): value is EvidenceSummary {
  if (value === null || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  return typeof obj.evidenceWeight === 'number' && Array.isArray(obj.provenanceSignals) && typeof obj.summary === 'string'
}

export function isComparisonPage(value: unknown): value is ComparisonPage {
  if (value === null || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  return typeof obj.slug === 'string' && typeof obj.title === 'string' && typeof obj.summary === 'string' && obj.a !== undefined && obj.b !== undefined
}

export function isConditionPage(value: unknown): value is ConditionPage {
  if (value === null || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  return typeof obj.slug === 'string' && typeof obj.title === 'string' && typeof obj.description === 'string' && !isComparisonPage(value)
}

export function isWorkbookRow(value: unknown): value is WorkbookRow {
  if (value === null || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  return Object.values(obj).every(val => val === null || val === undefined || ['string', 'number', 'boolean'].includes(typeof val))
}

export function isGeneratedDataset(value: unknown): value is RuntimeDataset {
  if (value === null || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>
  return Array.isArray(obj.herbs) && Array.isArray(obj.compounds) && Array.isArray(obj.claims)
}
