// Canonical → site-data export adapter.
//
// Converts canonical herb/compound entities into the record shape the existing
// Next.js site consumes (public/data/herbs.json, compounds.json). Output is
// deterministic (sorted by slug, stable keys, no wall-clock timestamps) so the
// generated files only change when the underlying data changes.
//
// This adapter is intentionally additive: it writes to data/generated/site/ and
// does NOT overwrite public/data. The site keeps using the workbook-generated
// public/data until a comparison report proves parity (see compare-site-output).

import { loadEntities } from './store.mjs'
import { splitList, cleanString } from './normalize.mjs'

const FIXED_TS = '2026-06-01T00:00:00.000Z'

// The site herb/compound record key set (mirrors public/data/herbs.json). Keys
// the adapter cannot yet source from canonical are emitted with safe defaults so
// the shape stays drop-in compatible; the comparison report tracks coverage.
const ARRAY_DEFAULTS = [
  'effects', 'primary_effects', 'mechanisms', 'raw_mechanisms', 'canonical_mechanisms',
  'mechanism_categories', 'mechanism_classes', 'mechanism_target_systems', 'unmapped_mechanisms',
  'contraindications', 'interactions', 'side_effects', 'forms', 'available_forms',
  'conditions', 'tags', 'keywords', 'buying_criteria', 'indexability_reasons',
]
const STRING_DEFAULTS = [
  'summary', 'description', 'mechanism_normalization_status', 'evidence_grade', 'evidence_tier',
  'evidence_design_match', 'evidence_risk_of_bias', 'evidence_consistency', 'evidence_rationale',
  'trial_design_insight', 'dosage', 'typical_dosage', 'governance_status', 'legal_status',
  'regulatory_status', 'profile_status', 'runtime_export_decision', 'visibility_tier', 'robots',
  'indexability_status', 'meta_title', 'meta_description', 'last_updated', 'last_reviewed',
  'controlled_status', 'controlled_schedule', 'dea_status',
]

function baseRecord() {
  const rec = { slug: '', name: '' }
  for (const k of STRING_DEFAULTS) rec[k] = ''
  for (const k of ARRAY_DEFAULTS) rec[k] = []
  rec.affiliate_ready = false
  rec.featured = false
  rec.sitemap_included = true
  rec.indexability_score = 0
  rec.controlled_substance = false
  rec.doNotMonetize = false
  rec.doNotPromote = false
  return rec
}

function mapEntity(entity) {
  const d = entity.data || {}
  const rec = baseRecord()
  rec.slug = entity.slug
  rec.name = entity.canonical_name
  rec.summary = entity.description || cleanString(d.summary)
  rec.description = cleanString(entity.legacy?.description) || entity.description || ''
  rec.effects = splitList(d.primary_effects)
  rec.primary_effects = splitList(d.primary_effects)
  rec.mechanisms = splitList(d.mechanism_summary)
  rec.canonical_mechanisms = splitList(d.canonical_pathways)
  rec.evidence_grade = cleanString(d.evidence_grade).toLowerCase()
  rec.evidence_tier = cleanString(d.evidence_tier)
  rec.contraindications = splitList(d.contraindications)
  rec.dosage = cleanString(d.dosage)
  rec.typical_dosage = cleanString(d.dosage)
  rec.tags = splitList(d.tags)
  rec.keywords = splitList(d.keywords)
  rec.conditions = splitList(d.topic_ecosystems)
  rec.governance_status = cleanString(d.governance_status)
  rec.legal_status = cleanString(d.legal_status)
  rec.runtime_export_decision = cleanString(d.runtime_export_decision)
  rec.profile_status = cleanString(entity.legacy?.profile_status)
  rec.controlled_substance = /true|yes|1/i.test(cleanString(d.controlled_substance))
  rec.last_updated = FIXED_TS
  rec.last_reviewed = cleanString(entity.legacy?.last_reviewed)
  rec.meta_title = entity.canonical_name
  rec.meta_description = (entity.description || '').slice(0, 160)
  return rec
}

// Governance: mirror the current runtime's "restricted substance" drop. The
// authoritative term list still lives in build-runtime-from-workbook.mjs; this
// is a conservative mirror used only to bring the adapter's counts in line for
// the comparison report. Entities flagged hidden_until_grounded are still
// emitted (matching current behavior — visibility is a robots/sitemap concern).
const RESTRICTED_TERMS = [
  '5-meo-dmt', '7-hydroxymitragynine', '7-oh-mitragynine', 'amanita muscaria', 'anabasine',
  'anatabine', 'dmt', 'hawaiian baby woodrose', 'harmaline', 'harmine', 'ibogaine', 'ketamine',
  'kratom', 'lobeline', 'lsa', 'mescaline', 'mitragynine', 'morning glory', 'nicotiana glauca',
  'nicotiana tabacum', 'noopept', 'psilocybin', 'salvinorin', 'sinicuichi', 'tetrahydroharmine',
  'thc', 'thcv',
]

function isRestricted(entity) {
  const haystack = `${entity.slug} ${entity.canonical_name} ${(entity.aliases || []).join(' ')}`.toLowerCase()
  if (RESTRICTED_TERMS.some((term) => haystack.includes(term))) return true
  // Only treat an explicit Schedule I / controlled-substance flag as restricting.
  // Note: legal_status prose often contains "not a controlled substance", so we
  // never substring-match "controlled" there — we use the boolean field.
  if (/true|yes|1/i.test(cleanString(entity.data?.controlled_substance))) return true
  if (/\bschedule\s*i\b/i.test(cleanString(entity.data?.legal_status))) return true
  return false
}

export function exportSiteRecords({ applyGovernance = true } = {}) {
  const entities = loadEntities()
  const herbs = []
  const compounds = []
  for (const entity of entities) {
    if (entity.entity_type !== 'herb' && entity.entity_type !== 'compound') continue
    if (applyGovernance && isRestricted(entity)) continue
    const rec = mapEntity(entity)
    ;(entity.entity_type === 'herb' ? herbs : compounds).push(rec)
  }
  const bySlug = (a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0)
  herbs.sort(bySlug)
  compounds.sort(bySlug)
  return { herbs, compounds }
}
