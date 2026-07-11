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
import {
  buildMechanismTaxonomy,
  normalizeMechanisms,
  deriveVisibility,
  cleanUserFacingText,
  uniqueList,
  clean,
  bool,
} from './derive.mjs'

// Fields the workbook build emits for compounds only (absent on herb records).
const COMPOUND_ONLY_FIELDS = [
  'allow_restricted_reference_export',
  'regulatory_federal',
  'last_regulatory_check',
  'regulatory_changelog',
]

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

function mapEntity(entity, taxonomy) {
  const d = entity.data || {}
  const lg = entity.legacy || {}
  const type = entity.entity_type
  const rec = baseRecord()
  rec.slug = entity.slug
  rec.name = entity.canonical_name
  // Summary/description are cleaned through the same leak filter + fallback the
  // workbook build uses, so suppressed pipeline text matches the live site.
  const textFallback = `${type === 'herb' ? 'Botanical' : 'Compound'} profile with evidence, safety, and practical fit.`
  const rawText = entity.description || cleanString(d.summary)
  rec.summary = cleanUserFacingText(rawText, textFallback)
  rec.description = cleanUserFacingText(cleanString(lg.description) || rawText, textFallback)

  // Effects.
  rec.primary_effects = uniqueList(d.primary_effects)
  rec.effects = uniqueList(d.primary_effects)

  // Mechanisms: raw = union of mechanism_summary + canonical_pathways, then
  // normalized against the canonical mechanism taxonomy (mirrors the workbook
  // build's normalizeMechanisms).
  const rawMechanisms = uniqueList([d.mechanism_summary, d.canonical_pathways])
  const mech = normalizeMechanisms([d.mechanism_summary, d.canonical_pathways], taxonomy)
  rec.mechanisms = rawMechanisms
  rec.raw_mechanisms = mech.raw_mechanisms
  rec.canonical_mechanisms = mech.canonical_mechanisms
  rec.mechanism_categories = mech.mechanism_categories
  rec.mechanism_classes = mech.mechanism_classes
  rec.mechanism_target_systems = mech.mechanism_target_systems
  rec.mechanism_normalization_status = mech.mechanism_normalization_status
  rec.unmapped_mechanisms = mech.unmapped_mechanisms

  rec.evidence_grade = clean(d.evidence_grade)
  rec.evidence_tier = clean(d.evidence_tier)
  rec.evidence_design_match = clean(lg.evidence_design_match)
  rec.evidence_risk_of_bias = clean(lg.evidence_risk_of_bias)
  rec.evidence_consistency = clean(lg.evidence_consistency)
  rec.evidence_rationale = clean(lg.evidence_rationale)
  rec.trial_design_insight = clean(lg.trial_design_insight)

  rec.contraindications = uniqueList(d.contraindications)
  rec.interactions = uniqueList(lg.interactions)
  rec.side_effects = uniqueList(lg.side_effects)
  rec.dosage = clean(d.dosage)
  rec.typical_dosage = clean(d.dosage)
  rec.forms = uniqueList(lg.forms || lg.available_forms)
  rec.available_forms = uniqueList(lg.available_forms || lg.forms)
  rec.conditions = uniqueList(lg.conditions || lg.best_for)
  rec.tags = uniqueList(d.tags)
  rec.keywords = uniqueList(d.keywords)
  rec.buying_criteria = uniqueList(lg.buying_criteria)

  rec.governance_status = clean(d.governance_status)
  rec.legal_status = clean(d.legal_status)
  rec.runtime_export_decision = clean(d.runtime_export_decision)
  rec.profile_status = clean(lg.profile_status)
  rec.controlled_substance = bool(d.controlled_substance)

  // Regulatory (mostly compound-only; sparse in the workbook).
  rec.regulatory_status = clean(lg.regulatory_status)
  rec.regulatory_federal = clean(lg.regulatory_federal)
  rec.last_regulatory_check = clean(lg.last_regulatory_check)
  rec.regulatory_changelog = clean(lg.regulatory_changelog)
  rec.allow_restricted_reference_export = bool(lg.allow_restricted_reference_export)

  // Affiliate.
  rec.affiliate_ready = bool(d.affiliate_ready ?? lg.affiliate_ready)
  rec.affiliate_label = clean(lg.affiliate_label) || 'Check sourcing options'

  rec.doNotMonetize = bool(lg.doNotMonetize)
  rec.doNotPromote = bool(lg.doNotPromote)
  rec.last_updated = FIXED_TS
  rec.last_reviewed = clean(lg.last_reviewed)
  rec.meta_title = clean(lg.meta_title) || entity.canonical_name
  rec.meta_description = clean(lg.meta_description) || (entity.description || '').slice(0, 160)

  // Visibility + indexability via the shared scoreIndexability policy.
  const indexBase = {
    slug: rec.slug,
    name: rec.name,
    summary: rec.summary,
    description: rec.description,
    runtime_export_decision: rec.runtime_export_decision,
    profile_status: rec.profile_status,
    summary_quality: clean(lg.summary_quality),
    evidence_tier: rec.evidence_tier,
    evidence_grade: rec.evidence_grade,
    robots: clean(lg.robots || d.seo_indexing_recommendation),
    visibility_tier: clean(lg.visibility_tier),
    sitemap_included: clean(d.public_search_visibility),
    primary_effects: rec.primary_effects,
    effects: rec.effects,
    mechanisms: rec.mechanisms,
    // The workbook build only feeds runtime_safety (not safety_notes) into the
    // indexability scorer's safety-context check — match that exactly.
    safety: clean(lg.runtime_safety),
    contraindications: rec.contraindications,
    interactions: rec.interactions,
    side_effects: rec.side_effects,
  }
  const visibility = deriveVisibility(indexBase, type)
  rec.visibility_tier = visibility.visibility_tier
  rec.robots = visibility.robots
  rec.sitemap_included = visibility.sitemap_included
  rec.indexability_status = visibility.indexability_status
  rec.indexability_score = visibility.indexability_score
  rec.indexability_reasons = visibility.indexability_reasons

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
  const taxonomy = buildMechanismTaxonomy(entities.filter((e) => e.entity_type === 'mechanism'))
  const herbs = []
  const compounds = []
  for (const entity of entities) {
    if (entity.entity_type !== 'herb' && entity.entity_type !== 'compound') continue
    if (applyGovernance && isRestricted(entity)) continue
    const rec = mapEntity(entity, taxonomy)
    if (entity.entity_type === 'herb') {
      for (const field of COMPOUND_ONLY_FIELDS) delete rec[field]
    }
    ;(entity.entity_type === 'herb' ? herbs : compounds).push(rec)
  }
  const bySlug = (a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0)
  herbs.sort(bySlug)
  compounds.sort(bySlug)
  return { herbs, compounds }
}
