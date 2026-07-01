#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import {
  getSheet,
  getSheetNames,
  readWorkbook,
  sheetToRows,
} from './workbook-parser.mjs'
import { assertWorkbookExists, resolveWorkbookPath } from '../workbook-source.mjs'
import { HERB_RUNTIME_FIELDS } from '../../config/runtime-herb-fields.mjs'
import { COMPOUND_RUNTIME_FIELDS } from '../../config/runtime-compound-fields.mjs'
import { scoreIndexability } from './indexability-policy.mjs'
import { validateEvidenceEnginePayload } from './evidence-engine-validation.mjs'
import { getEvidenceEngineGoalConfigs, normalizeEvidenceProblemKey } from './evidence-engine-goals.mjs'
import { deriveInteractionData, validate as validateInteractionData } from './build-interaction-data.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')
const sourceDateEpoch = process.env.SOURCE_DATE_EPOCH
  ? Number.parseInt(process.env.SOURCE_DATE_EPOCH, 10)
  : Number.NaN
const deterministicUpdatedAt = Number.isFinite(sourceDateEpoch)
  ? new Date(sourceDateEpoch * 1000).toISOString()
  : '2026-06-01T00:00:00.000Z'

const SHEETS = {
  herbs: ['Herb Master V3', 'Herb Monographs', 'Site Export Herbs'],
  compounds: ['Compound Master V3', 'Site Export Compounds'],
  entityMaster: ['Entity_Master', 'Sheet7'],
  map: ['Herb Compound Map V3', 'Entity_Relationships', 'Sheet11'],
  claims: ['Study Registry', 'Evidence_Register', 'Sheet8'],
  canonicalMechanisms: ['Canonical_Mechanisms', 'Canonical Mechanisms', 'Taxonomy_Rules', 'Sheet12'],
}

const GRAPH_SHEETS = {
  topics: ['Topic Ecosystems'],
  pathways: ['Pathway Ecosystems'],
  supernodes: ['Authority Supernodes'],
  relationships: ['Relationship Edges'],
  comparisons: ['Comparison Candidates'],
  stacks: ['Stack Synergy'],
  sparseRecovery: ['Sparse Recovery'],
  nodes: ['KG Nodes'],
}

const INDEX_FIELDS = [
  'slug', 'name', 'summary', 'primary_effects', 'effects', 'evidence_grade',
  'evidence_tier', 'profile_status', 'runtime_export_decision',
  'affiliate_ready', 'visibility_tier', 'robots', 'sitemap_included',
  'indexability_status', 'indexability_score', 'indexability_reasons',
]

function clean(v) {
  if (v === null || v === undefined) return ''
  return String(v).replace(/\s+/g, ' ').trim()
}

function lower(v) { return clean(v).toLowerCase() }

const RESTRICTED_RUNTIME_TERMS = [
  '5-meo-dmt',
  '5 meo dmt',
  '7-hydroxymitragynine',
  '7 hydroxymitragynine',
  '7-oh-mitragynine',
  '7 oh mitragynine',
  '7-oh',
  'amanita muscaria',
  'anabasine',
  'anatabine',
  'dmt',
  'hawaiian baby woodrose',
  'harmaline',
  'harmine',
  'ibogaine',
  'ketamine',
  'kratom',
  'lobeline',
  'lsa',
  'mescaline',
  'mitragynine',
  'morning glory',
  'nicotiana glauca',
  'nicotiana tabacum',
  'noopept',
  'psilocybin',
  'salvinorin',
  'sinicuichi',
  'tetrahydroharmine',
  'thc',
  'thcv',
]

const RESTRICTED_STATUS_PATTERNS = [
  /schedule\s*i\b/i,
  /schedule\s*1\b/i,
  /dea\s*watch\s*list/i,
  /dea\s*watchlist/i,
  /controlled\s*substance/i,
]

function slug(v) {
  return clean(v)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function splitList(v) {
  if (Array.isArray(v)) return v.flatMap(splitList)
  return clean(v).split(/[\n|;,]+/).map((s) => clean(s).replace(/^[-*•]\s*/, '')).filter(Boolean)
}

function uniqueList(v) {
  const seen = new Set()
  return splitList(v).filter((item) => {
    const key = lower(item)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function bool(v) {
  if (typeof v === 'boolean') return v
  const t = lower(v)
  return ['1', 'true', 'yes', 'y'].includes(t)
}

function normalizedSafetyText(value) {
  return clean(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function hasRestrictedRuntimeTerm(value) {
  const normalized = normalizedSafetyText(value)
  if (!normalized) return false
  return RESTRICTED_RUNTIME_TERMS.some((term) => {
    const normalizedTerm = normalizedSafetyText(term)
    return normalized === normalizedTerm || normalized.includes(normalizedTerm)
  })
}

function governanceFlags(row) {
  return {
    doNotMonetize: bool(first(row, ['doNotMonetize', 'do_not_monetize', 'do not monetize'])),
    doNotPromote: bool(first(row, ['doNotPromote', 'do_not_promote', 'do not promote'])),
    governance_status: clean(first(row, ['governance_status', 'governance status'])),
    legal_status: clean(first(row, ['legal_status', 'legal status'])),
    controlled_status: clean(first(row, ['controlled_status', 'controlled status'])),
    controlled_schedule: clean(first(row, ['controlled_schedule', 'controlled schedule', 'schedule'])),
    dea_status: clean(first(row, ['dea_status', 'dea status'])),
    dea_watchlist_status: clean(first(row, ['dea_watchlist_status', 'dea watchlist status', 'dea_watchlist', 'dea watchlist'])),
    regulatory_status: clean(first(row, ['regulatory_status', 'regulatory status'])),
  }
}

function isRestrictedRuntimeRecord(record) {
  if (!record) return false
  if (record.doNotMonetize || record.doNotPromote) return true
  const statuses = [
    record.governance_status,
    record.legal_status,
    record.controlled_status,
    record.controlled_schedule,
    record.dea_status,
    record.dea_watchlist_status,
    record.regulatory_status,
    record.safety_level,
  ].map(clean).join(' ')
  if (RESTRICTED_STATUS_PATTERNS.some((pattern) => pattern.test(statuses))) return true
  return [
    record.slug,
    record.name,
    record.scientific_name,
    record.summary,
    record.description,
    record.dosage,
    record.typical_dosage,
    record.safety,
    record.safety_level,
    record.affiliate_url,
    record.affiliate_query,
    record.amazon_affiliate_url,
    record.active_constituents,
    record.compound_profile,
  ].some(hasRestrictedRuntimeTerm)
}

function stripAffiliateForRestricted(record) {
  if (!isRestrictedRuntimeRecord(record)) return record
  return {
    ...record,
    affiliate_ready: false,
    affiliate_url: '',
    affiliate_query: '',
    amazon_affiliate_url: '',
    iherb_affiliate_url: '',
  }
}

function canExportRestrictedReference(record) {
  return bool(record?.allow_restricted_reference_export)
}

function num(v) {
  const n = Number(clean(v))
  return Number.isFinite(n) ? n : null
}

function compact(v) {
  return clean(v).replace(/\s+/g, ' ').trim()
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function writeJson(file, value) {
  const dir = path.dirname(file)
  try {
    ensureDir(dir)
  } catch (e) {
    // Ignore directory creation errors - try to write anyway
  }
  const content = `${JSON.stringify(value, null, 2)}
`
  try {
    fs.writeFileSync(file, content, 'utf8')
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Try creating directory with explicit shell command as fallback
      
      try {
        execSync(`mkdir -p "${dir}"`, { stdio: 'pipe' })
        // Try writing again
        fs.writeFileSync(file, content, 'utf8')
      } catch (fallbackErr) {
        throw err  // Throw original error if fallback fails
      }
    } else {
      throw err
    }
  }
}

function first(row, keys) {
  for (const key of keys) {
    const value = row?.[key]
    if (clean(value)) return value
  }
  return ''
}

function firstList(row, keys) {
  return uniqueList(first(row, keys))
}

function pick(obj, keys) {
  return Object.fromEntries(keys.filter((key) => key in obj).map((key) => [key, obj[key]]))
}

function stripRecord(record) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => {
    if (value === null || value === undefined) return false
    if (Array.isArray(value)) return value.length > 0
    return value !== ''
  }))
}

function arrayish(value) {
  if (Array.isArray(value)) return value
  if (value === null || value === undefined || value === '') return []
  return [value]
}

function normalizeAlias(value) {
  return lower(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function canonicalMechanismRow(row) {
  // For consolidated Taxonomy_Rules (Sheet12), only process canonical mechanism rows
  const sourceTable = clean(row.source_table)
  if (sourceTable && sourceTable !== 'Canonical_Mechanisms' && sourceTable !== 'Canonical Mechanisms') return null

  const label = clean(first(row, ['canonical_label', 'canonical label', 'display_name', 'display name', 'label', 'name', 'mechanism', 'label_or_name']))
  if (!label) return null
  const id = slug(first(row, ['canonical_mechanism_id', 'canonical mechanism id', 'canonical_slug', 'canonical slug', 'id', 'slug', 'key']) || label)
  const synonyms = uniqueList([
    label,
    first(row, ['synonyms', 'aliases', 'allowed_aliases', 'allowed aliases', 'example_terms', 'example terms', 'rule_or_value', 'alias_or_context']),
  ])
  return stripRecord({
    id,
    canonical_mechanism_id: id,
    canonical_label: label,
    label,
    category: clean(first(row, ['category', 'mechanism_category', 'mechanism category'])),
    mechanism_class: clean(first(row, ['mechanism_class', 'mechanism class', 'sub_category'])),
    target_system: clean(first(row, ['target_system', 'target system'])),
    directionality: clean(first(row, ['directionality'])),
    definition: compact(first(row, ['definition', 'description'])),
    synonyms,
    related_effects: uniqueList(first(row, ['related_effects', 'related effects'])),
    related_compare_groups: uniqueList(first(row, ['related_compare_groups', 'related compare groups'])),
    confidence_status: clean(first(row, ['confidence_status', 'confidence status', 'status_or_behavior'])),
    review_status: clean(first(row, ['review_status', 'review status'])),
    source_basis: compact(first(row, ['source_basis', 'source basis', 'source'])),
  })
}

function buildMechanismTaxonomy(rows) {
  const mechanisms = normalizeRows(rows, canonicalMechanismRow)
  const aliasToMechanism = new Map()
  for (const mechanism of mechanisms) {
    for (const alias of uniqueList([mechanism.canonical_label, mechanism.label, mechanism.synonyms || []])) {
      const key = normalizeAlias(alias)
      if (key && !aliasToMechanism.has(key)) aliasToMechanism.set(key, mechanism)
    }
  }
  return { mechanisms, aliasToMechanism }
}

function normalizeMechanisms(rawValues, taxonomy) {
  const raw = uniqueList(rawValues)
  const canonical = []
  const categories = []
  const classes = []
  const targetSystems = []
  const unmapped = []
  const seenCanonical = new Set()

  for (const term of raw) {
    const match = taxonomy.aliasToMechanism.get(normalizeAlias(term))
    if (!match) {
      unmapped.push(term)
      continue
    }
    const key = lower(match.canonical_label || match.label)
    if (!seenCanonical.has(key)) {
      seenCanonical.add(key)
      canonical.push(match.canonical_label || match.label)
    }
    categories.push(match.category)
    classes.push(match.mechanism_class)
    targetSystems.push(match.target_system)
  }

  const status = raw.length === 0
    ? 'no_raw_mechanisms'
    : unmapped.length === 0
      ? 'fully_mapped'
      : canonical.length > 0
        ? 'partially_mapped'
        : 'unmapped'

  return {
    raw_mechanisms: raw,
    canonical_mechanisms: uniqueList(canonical),
    mechanism_categories: uniqueList(categories),
    mechanism_classes: uniqueList(classes),
    mechanism_target_systems: uniqueList(targetSystems),
    mechanism_normalization_status: status,
    unmapped_mechanisms: uniqueList(unmapped),
  }
}

function visibility(base, type) {
  const visibilityTier = clean(base.visibility_tier || base.visibilityTier || '') || 'public'
  const robots = clean(base.robots || '') || (visibilityTier === 'hidden' ? 'noindex,nofollow' : 'index,follow')
  const explicitSitemapIncluded = clean(base.sitemap_included)
  const sitemapIncluded = explicitSitemapIncluded
    ? bool(explicitSitemapIncluded)
    : visibilityTier !== 'hidden'

  const hidden = visibilityTier === 'hidden'
  const policy = scoreIndexability({ ...base, type, robots, sitemap_included: sitemapIncluded })

  return {
    visibility_tier: visibilityTier,
    robots: hidden ? 'noindex,nofollow' : policy.robots,
    sitemap_included: hidden ? false : policy.sitemap_included,
    indexability_status: hidden ? 'BLOCKED' : policy.status,
    indexability_score: policy.score,
    indexability_reasons: hidden ? ['hidden_visibility_tier', ...policy.reasons] : policy.reasons,
  }
}

function affiliate(base) {
  return {
    ...base,
    affiliate_ready: bool(base.affiliate_ready),
    affiliate_url: clean(base.affiliate_url),
    affiliate_label: clean(base.affiliate_label) || 'Check sourcing options',
  }
}

function semantic(row, type) {
  return {
    semantic_tags: firstList(row, ['semantic_tags', 'semantic tags']),
    semantic_summary: compact(first(row, ['semantic_summary', 'semantic summary'])),
    canonical_entity_type: clean(first(row, ['canonical_entity_type', 'canonical entity type'])) || type,
  }
}

function read(workbook, candidates, optional = false) {
  const sheetName = candidates.find((candidate) => getSheet(workbook, candidate))
  if (!sheetName) {
    if (optional) return []
    throw new Error(`[data] missing required sheet: ${candidates.join(', ')}`)
  }

  return sheetToRows(getSheet(workbook, sheetName))
}

function profile(row, type, taxonomy) {
  const allowed = type === 'herb' ? HERB_RUNTIME_FIELDS : COMPOUND_RUNTIME_FIELDS
  const runtimeSafety = compact(first(row, ['runtime_safety', 'runtime safety']))
  const rawMechanisms = uniqueList([
    first(row, ['mechanisms', 'mechanism_of_action', 'mechanism of action', 'mechanism_summary']),
    first(row, ['mechanism', 'primary_mechanisms', 'primary mechanisms', 'canonical_pathways']),
  ])
  const normalizedMechanisms = normalizeMechanisms(rawMechanisms, taxonomy)

  const base = {
    type,
    slug: slug(first(row, ['slug', `${type}_slug`, `${type} slug`, 'name'])),
    name: clean(first(row, ['name', `${type}_name`, `${type} name`])),
    scientific_name: clean(first(row, ['scientific_name', 'scientific name', 'latin_name'])),
    summary: compact(first(row, ['summary', 'description', 'overview'])),
    summary_quality: clean(first(row, ['summary_quality', 'summary quality'])),
    description: compact(first(row, ['description', 'overview', 'summary'])),
    primary_effects: firstList(row, ['primary_effects', 'primary effects', 'effects', 'primary_effects_or_targets']),
    effects: firstList(row, ['effects', 'primary_effects', 'primary effects', 'primary_effects_or_targets']),
    mechanisms: rawMechanisms,
    ...normalizedMechanisms,
    evidence_grade: clean(first(row, ['evidence_grade', 'evidence grade'])),
    evidence_tier: clean(first(row, ['evidence_tier', 'evidence tier'])),
    evidence_design_match: clean(first(row, ['evidence_design_match', 'evidence design match'])),
    evidence_risk_of_bias: clean(first(row, ['evidence_risk_of_bias', 'evidence risk of bias'])),
    evidence_consistency: clean(first(row, ['evidence_consistency', 'evidence consistency'])),
    evidence_rationale: compact(first(row, ['evidence_rationale', 'evidence rationale'])),
    trial_design_insight: compact(first(row, ['trial_design_insight', 'trial design insight'])),
    profile_status: clean(first(row, ['profile_status', 'profile status', 'publish_status'])),
    runtime_export_decision: clean(first(row, ['runtime_export_decision', 'runtime export decision'])),
    visibility_tier: clean(first(row, ['visibility_tier', 'visibility tier'])),
    robots: clean(first(row, ['robots', 'seo_indexing_recommendation'])),
    sitemap_included: first(row, ['sitemap_included', 'sitemap included', 'public_search_visibility']),
    ...(runtimeSafety ? { safety: runtimeSafety } : {}),
    safety_level: clean(first(row, ['safety_level', 'safety level'])),
    contraindications: firstList(row, ['contraindications', 'avoid_if', 'avoid if', 'contraindications_or_flags']),
    interactions: firstList(row, ['interactions']),
    side_effects: firstList(row, ['side_effects', 'side effects']),
    dosage: clean(first(row, ['dosage', 'typical_dosage', 'typical dosage', 'dosage_or_preferred_form'])),
    typical_dosage: clean(first(row, ['typical_dosage', 'typical dosage', 'dosage', 'dosage_or_preferred_form'])),
    forms: firstList(row, ['forms', 'available_forms', 'available forms']),
    available_forms: firstList(row, ['available_forms', 'available forms', 'forms']),
    conditions: firstList(row, ['conditions', 'best_for', 'best for']),
    tags: firstList(row, ['tags']), keywords: firstList(row, ['keywords']),
    affiliate_ready: bool(first(row, ['affiliate_ready', 'affiliate ready'])),
    affiliate_url: clean(first(row, ['affiliate_url', 'affiliate url'])),
    affiliate_label: clean(first(row, ['affiliate_label', 'affiliate label'])) || 'Check sourcing options',
    affiliate_query: clean(first(row, ['affiliate_query', 'affiliate query'])),
    default_product_type: clean(first(row, ['default_product_type', 'default product type'])),
    buying_criteria: firstList(row, ['buying_criteria', 'buying criteria']),
    amazon_affiliate_url: clean(first(row, ['amazon_affiliate_url', 'amazon affiliate url'])),
    iherb_affiliate_url: clean(first(row, ['iherb_affiliate_url', 'iherb affiliate url'])),
    meta_title: clean(first(row, ['meta_title', 'meta title', 'seo_title', 'seo title'])),
    meta_description: clean(first(row, ['meta_description', 'meta description', 'seo_description', 'seo description'])),
    ...governanceFlags(row),
    allow_restricted_reference_export: bool(first(row, ['allow_restricted_reference_export', 'allow restricted reference export'])),
    regulatory_federal: compact(first(row, ['regulatory_federal', 'regulatory federal'])),
    regulatory_states_summary: compact(first(row, ['regulatory_states_summary', 'regulatory states summary'])),
    regulatory_states_table: compact(first(row, ['regulatory_states_table', 'regulatory states table'])),
    last_regulatory_check: clean(first(row, ['last_regulatory_check', 'last regulatory check'])),
    regulatory_changelog: compact(first(row, ['regulatory_changelog', 'regulatory changelog'])),
    regulatory_sources: firstList(row, ['regulatory_sources', 'regulatory sources']),
    last_updated: clean(first(row, ['last_updated', 'last updated', 'lastUpdated', 'date_updated', 'date updated'])),
    last_reviewed: clean(first(row, ['last_reviewed', 'last reviewed', 'lastReviewed', 'reviewed_date', 'reviewed date'])),
    featured: bool(first(row, ['featured'])),
    controlled_substance: bool(first(row, ['controlled_substance', 'controlled substance'])),
    ...semantic(row, type),
  }
  return pick(stripAffiliateForRestricted(affiliate({ ...base, ...visibility(base, type) })), allowed)
}

function dedupe(rows) {
  const seen = new Set()
  return rows.filter(Boolean).filter((r) => {
    if (!r.slug || seen.has(r.slug)) return false
    seen.add(r.slug)
    return true
  }).sort((a, b) => clean(a.name).localeCompare(clean(b.name)) || clean(a.slug).localeCompare(clean(b.slug)))
}

function rowId(row, fallbackFields = []) {
  const fields = Array.isArray(fallbackFields) ? fallbackFields : [fallbackFields]
  return slug(first(row, ['id', ...fields.filter(Boolean)]))
}

function mapRow(row) {
  // For Entity_Relationships (consolidated format), only process herb-compound map rows
  const sourceTable = clean(row.source_table)
  if (sourceTable && sourceTable !== 'Herb Compound Map V3') return null

  const herb = first(row, ['herb', 'herb name', 'herb_name', 'source_name'])
  const compound = first(row, ['compound', 'compound name', 'compound_name', 'target_name'])
  const hs = slug(first(row, ['herb_slug', 'herb slug', 'source_slug']) || herb)
  const cs = slug(first(row, ['compound_slug', 'compound slug', 'target_slug']) || compound)
  if (!hs || !cs) return null
  return stripRecord({ id: `${hs}-${cs}`, herb_slug: hs, compound_slug: cs, herb: clean(herb), compound: clean(compound), relationship: clean(first(row, ['relationship', 'relationship_type', 'role'])), notes: compact(first(row, ['notes', 'summary', 'rationale', 'context_or_amount'])) })
}

function filterRestrictedMapRows(rows, herbs, compounds) {
  const restrictedHerbSlugs = new Set(herbs.filter(isRestrictedRuntimeRecord).map((record) => record.slug))
  const restrictedCompoundSlugs = new Set(compounds.filter(isRestrictedRuntimeRecord).map((record) => record.slug))
  return rows.filter((row) => {
    if (restrictedHerbSlugs.has(row.herb_slug) || restrictedCompoundSlugs.has(row.compound_slug)) return false
    return ![
      row.herb_slug,
      row.compound_slug,
      row.herb,
      row.compound,
      row.notes,
    ].some(hasRestrictedRuntimeTerm)
  })
}

function claimRow(row) {
  const title = clean(first(row, ['title', 'study title', 'claim', 'summary', 'supported_claim_language', 'effect_or_condition']))
  const pmid = clean(first(row, ['pmid', 'PMID']))
  const id = rowId(row, ['claim_id', 'claim id', 'record_id']) || slug(pmid || title)
  if (!id && !title && !pmid) return null
  return stripRecord({ id: id || pmid, title, claim: compact(first(row, ['claim', 'finding', 'summary', 'conclusion', 'supported_claim_language'])), pmid, doi: clean(first(row, ['doi', 'DOI'])), source_url: clean(first(row, ['source_url', 'url', 'link', 'url_or_source'])), evidence_tier: clean(first(row, ['evidence_tier', 'study_type', 'evidence_type'])), profile_slug: slug(first(row, ['profile_slug', 'slug', 'herb_slug', 'compound_slug', 'entity_slug'])) })
}

function published(v) {
  if (v === null || v === undefined || clean(v) === '') return false
  return bool(v)
}

function outcomeProblemLabelRow(row) {
  const key = normalizeEvidenceProblemKey(first(row, ['problem_key', 'problem key', 'problem_slug', 'problem slug', 'key', 'slug']))
  if (!key) return null
  return stripRecord({
    key,
    title: clean(first(row, ['title', 'label', 'problem_title', 'problem title'])),
    description: compact(first(row, ['description', 'problem_description', 'problem description'])),
  })
}

function toProblemLabels(rows, fallbackLabels) {
  const labels = normalizeRows(rows, outcomeProblemLabelRow)
  if (!labels.length) return fallbackLabels

  const mapped = Object.fromEntries(
    labels.map((item) => [item.key, { title: item.title || item.key, description: item.description || '' }])
  )
  return Object.keys(mapped).length > 0 ? mapped : fallbackLabels
}

function evidenceClaimRow(row, config) {
  const claimId = slug(first(row, ['claim_id', 'claim id', 'id']))
  const ingredientName = clean(first(row, ['ingredient_name', 'ingredient name', 'name']))
  const ingredientSlug = slug(first(row, ['ingredient_slug', 'ingredient slug', 'slug']) || ingredientName)
  if (!claimId && !ingredientSlug && !ingredientName) return null

  return stripRecord({
    claim_id: claimId,
    ingredient_slug: ingredientSlug,
    ingredient_name: ingredientName,
    [config.problemField]: normalizeEvidenceProblemKey(first(row, [...arrayish(config.problemAliases)])),
    claim_statement: compact(first(row, ['claim_statement', 'claim statement', 'claim'])),
    confidence_tier: lower(first(row, ['confidence_tier', 'confidence tier'])),
    evidence_summary: compact(first(row, ['evidence_summary', 'evidence summary'])),
    limitations: compact(first(row, ['limitations', 'limitation'])),
    design_type: clean(first(row, ['design_type', 'design type'])),
    sample_size: num(first(row, ['sample_size', 'sample size'])),
    duration: clean(first(row, ['duration'])),
    blinding: clean(first(row, ['blinding'])),
    control: clean(first(row, ['control'])),
    design_insight: compact(first(row, ['design_insight', 'design insight'])),
    best_fit: compact(first(row, ['best_fit', 'best fit'])),
    not_best_fit: compact(first(row, ['not_best_fit', 'not best fit'])),
    decision_group: clean(first(row, ['decision_group', 'decision group', 'group'])) || config.defaultDecisionGroup,
    display_order: num(first(row, ['display_order', 'display order', 'order'])) ?? 999,
    published: published(first(row, ['published', 'publish'])),
  })
}

function evidenceSourceRow(row) {
  const sourceId = slug(first(row, ['source_id', 'source id', 'id']) || first(row, ['pmid', 'doi', 'url', 'title']))
  const claimId = slug(first(row, ['claim_id', 'claim id']))
  if (!sourceId) return null
  return stripRecord({
    source_id: sourceId,
    claim_id: claimId,
    citation_label: clean(first(row, ['citation_label', 'citation label', 'citation'])),
    source_type: lower(first(row, ['source_type', 'source type', 'type'])),
    title: compact(first(row, ['title', 'study_title', 'study title'])),
    year: num(first(row, ['year', 'publication_year', 'publication year'])),
    url: clean(first(row, ['url', 'source_url', 'source url', 'link'])),
    pmid: clean(first(row, ['pmid', 'PMID'])),
    doi: clean(first(row, ['doi', 'DOI'])),
    evidence_type: lower(first(row, ['evidence_type', 'evidence type', 'study_type', 'study type'])),
    human_relevance: lower(first(row, ['human_relevance', 'human relevance'])),
    quality_notes: compact(first(row, ['quality_notes', 'quality notes', 'notes'])),
    published: published(first(row, ['published', 'publish'])),
  })
}

function evidenceSafetyRow(row) {
  const safetyId = slug(first(row, ['safety_id', 'safety id', 'id']) || first(row, ['ingredient_slug', 'ingredient slug', 'name']))
  const ingredientSlug = slug(first(row, ['ingredient_slug', 'ingredient slug', 'slug']))
  if (!safetyId && !ingredientSlug) return null
  return stripRecord({
    safety_id: safetyId,
    ingredient_slug: ingredientSlug,
    risk_type: lower(first(row, ['risk_type', 'risk type', 'type', 'risk'])),
    severity: lower(first(row, ['severity', 'safety_level', 'safety level', 'level'])),
    warning: compact(first(row, ['warning', 'safety_warning', 'safety warning', 'safety_summary', 'safety summary', 'summary'])),
    decision_effect: compact(first(row, ['decision_effect', 'decision effect', 'decision', 'recommendation', 'monitoring', 'monitoring_notes', 'monitoring notes'])),
    published: published(first(row, ['published', 'publish'])),
  })
}

function buildEvidenceEngine(config, problemRows, claimRows, sourceRows, safetyRows) {
  const fallbackProblemLabels = config.problemLabels || {}
  const problemLabels = toProblemLabels(problemRows || [], fallbackProblemLabels)
  const claims = normalizeRows(claimRows, (row) => evidenceClaimRow(row, config))
    .filter((row) => row.published)
    .sort((a, b) => (a.display_order || 999) - (b.display_order || 999) || clean(a.ingredient_name).localeCompare(clean(b.ingredient_name)))
  const sources = normalizeRows(sourceRows, evidenceSourceRow).filter((row) => row.published)
  const safetyNotes = normalizeRows(safetyRows, evidenceSafetyRow).filter((row) => row.published)

  // Build sourcesByClaim mapping: claim_id -> array of sources for that claim
  const sourcesByClaim = {}
  for (const source of sources) {
    if (source.claim_id) {
      if (!sourcesByClaim[source.claim_id]) {
        sourcesByClaim[source.claim_id] = []
      }
      sourcesByClaim[source.claim_id].push(source)
    }
  }

  const payload = {
    generatedAt: deterministicUpdatedAt,
    goal: config.goal,
    problemField: config.problemField,
    problemLabels,
    claims,
    safetyNotes,
    sourcesByClaim,
  }

  validateEvidenceEnginePayload(payload, config)
  return payload
}

function graphRow(row, kind) {
  const source = slug(first(row, ['source', 'source slug', 'from', 'profile a', 'anchor', 'profile']))
  const target = slug(first(row, ['target', 'target slug', 'to', 'profile b', 'companion', 'candidate']))
  const name = clean(first(row, ['name', kind, 'title', 'topic', 'pathway', 'supernode', 'label']))
  const id = slug(first(row, ['id', 'slug']) || (source && target ? `${source}-${kind}-${target}` : name))
  if (!id && !name && (!source || !target)) return null
  return stripRecord({
    id, slug: slug(first(row, ['slug']) || name || id), name, kind,
    source, target,
    type: clean(first(row, ['type', 'relationship', 'relationship type', `${kind} type`])) || kind,
    weight: num(first(row, ['weight', 'score', 'strength', 'graph score'])),
    summary: compact(first(row, ['summary', 'semantic summary', 'authority summary', 'ecosystem summary'])),
    retrieval_summary: compact(first(row, ['retrieval summary', 'semantic summary', 'summary'])),
    rationale: compact(first(row, ['rationale', 'reason', 'why'])),
    evidence_context: compact(first(row, ['evidence context', 'evidence_context', 'evidence framing'])),
    anchors: firstList(row, ['anchors', 'profiles', 'members']).map(slug),
    herbs: firstList(row, ['herbs', 'related herbs', 'top herbs']).map(slug),
    compounds: firstList(row, ['compounds', 'related compounds', 'top compounds']).map(slug),
    topics: firstList(row, ['topics', 'topic themes', 'topic overlap']),
    pathways: firstList(row, ['pathways', 'pathway themes', 'pathway overlap']),
    mechanisms: firstList(row, ['mechanisms', 'mechanism themes', 'mechanism overlap']),
    recommendations: firstList(row, ['recommendations', 'candidates', 'related', 'relationship targets']).map(slug),
  })
}

function normalizeRows(rows, fn) {
  const seen = new Set()
  return rows.map(fn).filter(Boolean).filter((r) => {
    const key = clean(r.id || r.slug || r.key || r.claim_id || r.source_id || r.safety_id || (r.source && r.target ? `${r.source}-${r.target}` : ''))
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  }).sort((a, b) => clean(a.id || a.slug || a.key || a.claim_id || a.source_id || a.safety_id || a.name).localeCompare(clean(b.id || b.slug || b.key || b.claim_id || b.source_id || b.safety_id || b.name)))
}

function details(dir, rows) {
  let retries = 10
  while (retries > 0) {
    try {
      fs.rmSync(dir, { recursive: true, force: true })
      break
    } catch (e) {
      if ((e.code === 'EBUSY' || e.code === 'EPERM') && retries > 1) {
        retries--
        // Synchronous sleep/wait for 200ms
        const start = Date.now()
        while (Date.now() - start < 200) {}
      } else if (e.code === 'ENOENT' || e.code === 'EPERM') {
        // Directory already gone or permission denied - just continue
        break
      } else {
        throw e
      }
    }
  }
  ensureDir(dir)
  for (const row of rows) writeJson(path.join(dir, `${row.slug}.json`), row)
}

function args() {
  const out = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : (process.argv.find((a) => a.startsWith('--out='))?.slice(6) || 'public/data')
  return path.resolve(repoRoot, out || 'public/data')
}

function mechanismReport(herbs, compounds, canonicalMechanisms) {
  const records = [...herbs, ...compounds]
  const unmapped = new Map()
  for (const record of records) {
    for (const term of record.unmapped_mechanisms || []) {
      unmapped.set(term, (unmapped.get(term) || 0) + 1)
    }
  }
  return {
    reportVersion: 1,
    canonicalMechanisms: canonicalMechanisms.length,
    records: records.length,
    fullyMappedRecords: records.filter((r) => r.mechanism_normalization_status === 'fully_mapped').length,
    partiallyMappedRecords: records.filter((r) => r.mechanism_normalization_status === 'partially_mapped').length,
    unmappedRecords: records.filter((r) => r.mechanism_normalization_status === 'unmapped').length,
    noRawMechanismRecords: records.filter((r) => r.mechanism_normalization_status === 'no_raw_mechanisms').length,
    unmappedMechanisms: [...unmapped.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([term, count]) => ({ term, count })),
  }
}

async function main() {
  const outDir = args()
  const workbookPath = resolveWorkbookPath(repoRoot)
  assertWorkbookExists(workbookPath)

  // Workbook loading is intentionally routed through the parser adapter.
  // Do not route browser uploads, request bodies, runtime input, or remote
  // URLs through this parsing boundary.
  const wb = await readWorkbook(workbookPath)

  const hasEntityMaster = !!(getSheet(wb, 'Entity_Master') || getSheet(wb, 'Sheet7'))
  const hasOldHerbSheet = !!(getSheet(wb, 'Herb Master V3') || getSheet(wb, 'Herb Monographs') || getSheet(wb, 'Site Export Herbs'))
  if (!hasEntityMaster && !hasOldHerbSheet) {
    throw new Error('[data] missing required sheet: Entity_Master (Sheet7) or Herb Master V3')
  }

  ensureDir(outDir)

  const taxonomy = buildMechanismTaxonomy(read(wb, SHEETS.canonicalMechanisms, true))

  let herbRows, compoundRows
  if (hasEntityMaster) {
    const entityRows = read(wb, SHEETS.entityMaster)
    herbRows = entityRows.filter((r) => !clean(r.entity_type) || clean(r.entity_type).toLowerCase() === 'herb')
    compoundRows = entityRows.filter((r) => clean(r.entity_type).toLowerCase() === 'compound')
    const interactionData = deriveInteractionData(entityRows)
    validateInteractionData(interactionData)
    fs.writeFileSync(path.join(outDir, 'interaction_edges.json'), JSON.stringify(interactionData.edgesBySlug), 'utf8')
    fs.writeFileSync(path.join(outDir, 'entity_risk_tags.json'), JSON.stringify(interactionData.tagsBySlug), 'utf8')
    console.log(`[data] wrote interaction_edges.json (${interactionData.edges.length} edges) + entity_risk_tags.json (${interactionData.tags.length} tags)`)
  } else {
    herbRows = read(wb, SHEETS.herbs)
    compoundRows = read(wb, SHEETS.compounds)
  }

  const allHerbs = dedupe(herbRows.map((r) => profile(r, 'herb', taxonomy)))
  const allCompounds = dedupe(compoundRows.map((r) => profile(r, 'compound', taxonomy)))
  const herbs = allHerbs.filter((record) => !isRestrictedRuntimeRecord(record) || canExportRestrictedReference(record))
  const compounds = allCompounds.filter((record) => !isRestrictedRuntimeRecord(record) || canExportRestrictedReference(record))
  const claims = normalizeRows(read(wb, SHEETS.claims), claimRow)
  const herbCompoundMap = filterRestrictedMapRows(normalizeRows(read(wb, SHEETS.map), mapRow), allHerbs, allCompounds)
  const graph = Object.fromEntries(Object.entries(GRAPH_SHEETS).map(([kind, names]) => [kind, normalizeRows(read(wb, names, true), (r) => graphRow(r, kind))]))
  const evidenceEngines = Object.fromEntries(
    getEvidenceEngineGoalConfigs().map((config) => [
      config.goal,
      buildEvidenceEngine(
        config,
        config.problemSheetCandidates ? read(wb, config.problemSheetCandidates, true) : null,
        read(wb, config.claimSheetCandidates, true),
        read(wb, config.sourceSheetCandidates, true),
        read(wb, config.safetySheetCandidates, true)
      ),
    ])
  )
  const normalizationReport = mechanismReport(herbs, compounds, taxonomy.mechanisms)

  writeJson(path.join(outDir, 'herbs.json'), herbs)
  writeJson(path.join(outDir, 'compounds.json'), compounds)
  writeJson(path.join(outDir, 'featured-herbs.json'), herbs.filter(h => h.featured))
  writeJson(path.join(outDir, 'featured-compounds.json'), compounds.filter(c => c.featured))
  writeJson(path.join(outDir, 'claims.json'), claims)
  writeJson(path.join(outDir, 'herb-compound-map.json'), herbCompoundMap)
  writeJson(path.join(outDir, 'herb-index.json'), herbs.map((r) => pick(r, INDEX_FIELDS)))
  writeJson(path.join(outDir, 'compound-index.json'), compounds.map((r) => pick(r, INDEX_FIELDS)))
  writeJson(path.join(outDir, 'canonical-mechanisms.json'), taxonomy.mechanisms)
  writeJson(path.join(outDir, 'mechanism-normalization-report.json'), normalizationReport)
  writeJson(path.join(outDir, 'topics.json'), graph.topics || [])
  writeJson(path.join(outDir, 'pathways.json'), graph.pathways || [])
  writeJson(path.join(outDir, 'supernodes.json'), graph.supernodes || [])
  writeJson(path.join(outDir, 'relationships.json'), graph.relationships || [])
  writeJson(path.join(outDir, 'comparison-candidates.json'), graph.comparisons || [])
  writeJson(path.join(outDir, 'stack-synergy.json'), graph.stacks || [])
  writeJson(path.join(outDir, 'sparse-recovery.json'), graph.sparseRecovery || [])
  writeJson(path.join(outDir, 'knowledge-graph.json'), graph)
  for (const [goal, payload] of Object.entries(evidenceEngines)) {
    writeJson(path.join(outDir, 'evidence-engine', `${goal}.json`), payload)
  }
  writeJson(path.join(outDir, 'agent-patches.json'), [])
  //   details(path.join(outDir, 'herb-detail'), herbs)
  //   details(path.join(outDir, 'compound-detail'), compounds)
  const evidenceEngineCounts = Object.fromEntries(
    Object.entries(evidenceEngines).flatMap(([goal, payload]) => [
      [`${goal}EvidenceClaims`, payload.claims.length],
      [`${goal}SafetyNotes`, payload.safetyNotes.length],
    ])
  )
  writeJson(path.join(outDir, 'build-report.json'), { buildReportVersion: 1, workbook: path.basename(workbookPath), counts: { herbs: herbs.length, compounds: compounds.length, claims: claims.length, herbCompoundMap: herbCompoundMap.length, canonicalMechanisms: taxonomy.mechanisms.length, topics: (graph.topics || []).length, pathways: (graph.pathways || []).length, supernodes: (graph.supernodes || []).length, ...evidenceEngineCounts } })
  // Canonical build manifest. Emitted from the SAME herb/compound arrays as build-report.json
  // so the two manifests can never drift (enforced by validate-data-governance.mjs).
  writeJson(path.join(outDir, '_meta', 'build-info.json'), {
    generatedAt: new Date().toISOString(),
    source: { workbookPath, workbook: path.basename(workbookPath) },
    output: path.relative(repoRoot, outDir),
    counts: {
      herbs: herbs.length,
      compounds: compounds.length,
      herbsSummary: herbs.length,
      compoundsSummary: compounds.length,
      herbDetails: herbs.length,
      compoundDetails: compounds.length,
    },
  })
  console.log(`[data] wrote ${herbs.length} herbs, ${compounds.length} compounds, ${claims.length} claims`)
  for (const [goal, payload] of Object.entries(evidenceEngines)) {
    console.log(`[data] ${goal} evidence engine: ${payload.claims.length} claims, ${payload.safetyNotes.length} safety notes`)
  }
  console.log(`[data] canonical mechanisms: ${taxonomy.mechanisms.length}; unmapped mechanism terms: ${normalizationReport.unmappedMechanisms.length}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
