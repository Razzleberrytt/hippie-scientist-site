import { list, text, unique } from '@/lib/display-utils'

export type MonetizationReadiness = {
  ready: boolean
  level: 'high' | 'moderate' | 'review' | 'hold'
  reasons: string[]
  cautions: string[]
}

export type AffiliateSourcingContext = {
  affiliateReady: boolean
  affiliateUrl: string
  affiliateLabel: string
}

function normalize(value: unknown) {
  return text(value).toLowerCase()
}

function booleanish(value: unknown) {
  if (typeof value === 'boolean') return value
  const normalized = normalize(value)
  return ['1', 'true', 'yes', 'y'].includes(normalized)
}

function evidenceLevel(record: any) {
  return normalize(record?.evidence_tier || record?.evidenceTier || record?.summary_quality || record?.profile_status)
}

function cautionSignals(record: any) {
  return unique([
    ...list(record?.avoid_if),
    ...list(record?.avoidIf),
    ...list(record?.contraindications),
    ...list(record?.interactions),
    ...list(record?.warnings),
    text(record?.safetyNotes),
    text(record?.safety?.notes),
  ].filter(Boolean))
}

function sourcingSignals(record: any) {
  return unique([
    ...list(record?.formulations),
    ...list(record?.delivery_forms),
    ...list(record?.preparation_methods),
    ...list(record?.extract_types),
    text(record?.standardization_notes),
    text(record?.bioavailability_notes),
  ].filter(Boolean))
}

export function getMonetizationReadiness(record: any): MonetizationReadiness {
  const evidence = evidenceLevel(record)
  const cautions = cautionSignals(record)
  const sourcing = sourcingSignals(record)
  const reasons: string[] = []

  if (/strong|clinical|human|high/.test(evidence)) reasons.push('stronger evidence context')
  if (/moderate|human/.test(evidence)) reasons.push('moderate evidence context')
  if (sourcing.length > 0) reasons.push('formulation or sourcing context available')
  if (/complete|ready|strong/.test(normalize(record?.profile_status || record?.summary_quality))) reasons.push('profile maturity signal available')

  if (/avoid|contraindication|pregnancy|liver|kidney|interaction|warning/.test(cautions.join(' ').toLowerCase())) {
    return {
      ready: false,
      level: 'hold',
      reasons,
      cautions: cautions.slice(0, 5),
    }
  }

  if (reasons.length >= 3) {
    return {
      ready: true,
      level: 'high',
      reasons: reasons.slice(0, 5),
      cautions: cautions.slice(0, 5),
    }
  }

  if (reasons.length >= 2) {
    return {
      ready: true,
      level: 'moderate',
      reasons: reasons.slice(0, 5),
      cautions: cautions.slice(0, 5),
    }
  }

  return {
    ready: false,
    level: 'review',
    reasons,
    cautions: cautions.slice(0, 5),
  }
}

export function buildSourcingNotes(record: any) {
  const sourcing = sourcingSignals(record)

  if (sourcing.length > 0) return sourcing.slice(0, 6)

  return [
    'Look for transparent labeling and ingredient clarity',
    'Prefer standardization details when relevant',
    'Avoid products relying on exaggerated benefit claims',
  ]
}

export function getAffiliateSourcingContext(record: any): AffiliateSourcingContext {
  return {
    affiliateReady: booleanish(record?.affiliate_ready || record?.affiliateReady),
    affiliateUrl: text(record?.affiliate_url || record?.affiliateUrl),
    affiliateLabel: text(record?.affiliate_label || record?.affiliateLabel) || 'Check sourcing options',
  }
}
