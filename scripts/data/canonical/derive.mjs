// Derived-field computation for the site export adapter.
//
// These helpers reproduce the mechanism-normalization and indexability/visibility
// derivations that scripts/data/build-runtime-from-workbook.mjs applies, so the
// canonical export can populate the same derived fields. The string helpers are
// exact copies of the workbook build's (clean/splitList/uniqueList/normalizeAlias)
// to guarantee identical tokenization, and the indexability step reuses the same
// scoreIndexability policy module.

import { scoreIndexability } from '../indexability-policy.mjs'

// ---- string helpers (mirrors build-runtime-from-workbook.mjs) ----

export function clean(v) {
  if (v === null || v === undefined) return ''
  return String(v).replace(/\s+/g, ' ').trim()
}
export function lower(v) { return clean(v).toLowerCase() }
export function bool(v) {
  if (typeof v === 'boolean') return v
  return ['1', 'true', 'yes', 'y'].includes(lower(v))
}
export function splitList(v) {
  if (Array.isArray(v)) return v.flatMap(splitList)
  return clean(v).split(/[\n|;,]+/).map((s) => clean(s).replace(/^[-*•]\s*/, '')).filter(Boolean)
}
export function uniqueList(v) {
  const seen = new Set()
  return splitList(v).filter((item) => {
    const key = lower(item)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}
export function normalizeAlias(value) {
  return lower(value)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// ---- user-facing text hygiene (mirrors build-runtime-from-workbook.mjs) ----

const USER_FACING_LEAK_PATTERNS = [
  /is linked here to/i,
  /lean herb row|lean monograph row/i,
  /high.speed phytochemical/i,
  /internal cross-linking supports/i,
  /\bis tracked for\b/i,
  /it is best framed (as|around|for)/i,
  /decision-ready summary/i,
  /evidence level:/i,
  /scispace evidence pass|evidence pass/i,
  /enriched in bulk|bulk mode/i,
]

export function isLeakedUserFacingText(value) {
  const text = clean(value)
  return Boolean(text && USER_FACING_LEAK_PATTERNS.some((pattern) => pattern.test(text)))
}

export function cleanUserFacingText(value, fallback) {
  const text = clean(value)
  if (!text || isLeakedUserFacingText(text)) return fallback
  return text
}

// ---- mechanism taxonomy + normalization ----

// Build an alias→mechanism map from canonical `mechanism` entities. Each entity
// carries data.{category, mechanism_class, target_system, synonyms}.
export function buildMechanismTaxonomy(mechanismEntities) {
  const aliasToMechanism = new Map()
  for (const entity of mechanismEntities) {
    const mechanism = {
      canonical_label: entity.canonical_name,
      label: entity.canonical_name,
      category: entity.data?.category || '',
      mechanism_class: entity.data?.mechanism_class || '',
      target_system: entity.data?.target_system || '',
      synonyms: entity.data?.synonyms || [],
    }
    for (const alias of uniqueList([mechanism.canonical_label, mechanism.label, mechanism.synonyms])) {
      const key = normalizeAlias(alias)
      if (key && !aliasToMechanism.has(key)) aliasToMechanism.set(key, mechanism)
    }
  }
  return { aliasToMechanism }
}

// Reproduces normalizeMechanisms() from the workbook build.
export function normalizeMechanisms(rawValues, taxonomy) {
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

// ---- visibility / indexability (mirrors build-runtime visibility()) ----

export function deriveVisibility(base, type) {
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
