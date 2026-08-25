export const SPAM_UPDATE_PERIODS = {
  baseline: { startDate: '2026-08-04', endDate: '2026-08-12', label: 'Baseline' },
  corrupted: { startDate: '2026-08-13', endDate: '2026-08-17', label: 'AI reporting anomaly' },
  rollout: { startDate: '2026-08-18', endDate: '2026-08-21', label: 'Spam update rollout' },
  post: { startDate: '2026-08-22', endDate: '9999-12-31', label: 'Post-update observation' },
}

export const COHORT_LABELS = {
  A: 'Fully upgraded authority profiles',
  B: 'Enriched profiles',
  C: 'Weak/incomplete profiles',
  D: 'Comparison/editorial pages',
  E: 'Research/tools/methodology',
  F: 'Translated pages',
}

const PUBLISHABLE_STATUSES = new Set(['reviewed', 'approved', 'published'])

export function periodForDate(date) {
  const normalized = String(date || '').slice(0, 10)
  for (const [key, period] of Object.entries(SPAM_UPDATE_PERIODS)) {
    if (normalized >= period.startDate && normalized <= period.endDate) return key
  }
  return 'outside'
}

export function normalizePathname(page) {
  const value = String(page || '').trim()
  if (!value) return ''
  try {
    const pathname = /^https?:\/\//i.test(value) ? new URL(value).pathname : value.split(/[?#]/, 1)[0]
    if (!pathname) return '/'
    const withLeading = pathname.startsWith('/') ? pathname : `/${pathname}`
    return withLeading === '/' || withLeading.endsWith('/') ? withLeading : `${withLeading}/`
  } catch {
    return value
  }
}

export function profileIdentity(pathname) {
  const normalized = normalizePathname(pathname)
  const match = normalized.match(/^\/(herbs|compounds)\/([^/]+)\/$/)
  if (!match) return null
  return {
    entityType: match[1] === 'herbs' ? 'herb' : 'compound',
    slug: match[2].toLowerCase(),
  }
}

function enrichmentObject(row) {
  return row?.researchEnrichment && typeof row.researchEnrichment === 'object'
    ? row.researchEnrichment
    : row && typeof row === 'object'
      ? row
      : null
}

export function isPublishableEnrichment(row) {
  const enrichment = enrichmentObject(row)
  if (!enrichment) return false
  const status = String(enrichment.editorialStatus || '').trim().toLowerCase()
  if (!PUBLISHABLE_STATUSES.has(status)) return false
  return enrichment.editorialReadiness?.publishable !== false
}

function count(value) {
  return Array.isArray(value) ? value.length : 0
}

export function authorityProfileSignals(row) {
  const enrichment = enrichmentObject(row)
  if (!isPublishableEnrichment(enrichment)) {
    return { authority: false, score: 0, signals: {} }
  }

  const claimCount = count(enrichment.supportedUses) + count(enrichment.unsupportedOrUnclearUses)
  const safetyCount = count(enrichment.interactions) + count(enrichment.contraindications) + count(enrichment.adverseEffects)
  const mechanismCount = count(enrichment.mechanisms)
  const sourceCount = Math.max(count(enrichment.sourceRegistryIds), count(enrichment.sourceRefs))
  const hasEvidenceJudgment = Boolean(
    enrichment.evidenceSummary ||
    enrichment.pageEvidenceJudgment?.evidenceLabel ||
    enrichment.pageEvidenceJudgment?.grading?.confidenceIndex,
  )
  const hasNegativeOrUncertainEvidence =
    count(enrichment.unsupportedOrUnclearUses) > 0 ||
    count(enrichment.conflictNotes) > 0 ||
    count(enrichment.researchGaps) > 0

  const signals = {
    evidenceClaims: claimCount >= 2,
    safetySpecificity: safetyCount >= 1,
    mechanismSpecificity: mechanismCount >= 1,
    sourceDepth: sourceCount >= 4,
    evidenceJudgment: hasEvidenceJudgment,
    uncertaintyVisibility: hasNegativeOrUncertainEvidence,
  }
  const score = Object.values(signals).filter(Boolean).length

  // Authority is deliberately stricter than generic enrichment: deep sourcing
  // is mandatory, then the page must satisfy nearly all remaining value signals.
  return {
    authority: signals.sourceDepth && score >= 5,
    score,
    signals,
    sourceCount,
    claimCount,
    safetyCount,
    mechanismCount,
  }
}

export function classifyCohort(pathname, governedByKey = new Map()) {
  const normalized = normalizePathname(pathname)

  if (/^\/(?:es|pt|fr|de)\//.test(normalized)) return 'F'

  const profile = profileIdentity(normalized)
  if (profile) {
    const governed = governedByKey.get(`${profile.entityType}:${profile.slug}`)
    if (!isPublishableEnrichment(governed)) return 'C'
    return authorityProfileSignals(governed).authority ? 'A' : 'B'
  }

  if (/^\/(?:research|tools|methodology|evidence)(?:\/|$)/.test(normalized) || /^\/info\/methodology(?:\/|$)/.test(normalized)) {
    return 'E'
  }

  return 'D'
}

export function percentChange(current, baseline) {
  if (!Number.isFinite(baseline) || baseline === 0) return null
  return ((current - baseline) / baseline) * 100
}
