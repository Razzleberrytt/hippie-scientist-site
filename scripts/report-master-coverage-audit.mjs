#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const HERBS_PATH = path.join(ROOT, 'public', 'data', 'herbs.json')
const COMPOUNDS_PATH = path.join(ROOT, 'public', 'data', 'compounds.json')
const OUTPUT_JSON = path.join(ROOT, 'ops', 'reports', 'coverage-audit.json')
const OUTPUT_MD = path.join(ROOT, 'ops', 'reports', 'coverage-audit.md')

const NULL_LIKE_VALUES = new Set(['', 'n/a', 'na', 'none', 'null', 'undefined', 'unknown', 'tbd', 'pending', '-', '--'])
const PLACEHOLDER_PATTERNS = [
  /\binsufficient\s+data\b/i,
  /\bnot\s+(?:established|available|known|specified)\b/i,
  /\bplaceholder\b/i,
  /\bcoming\s+soon\b/i,
  /^\s*\[object\s+object\]\s*$/i,
]

const TIERS = {
  herb: {
    tierA: ['name', 'slug', 'description', 'effects', 'sources', 'activeCompounds'],
    tierB: ['mechanism', 'therapeuticUses', 'contraindications', 'interactions', 'safetyNotes', 'legalStatus'],
    tierC: ['dosage', 'preparation', 'duration', 'region', 'sideEffects', 'traditionalUse', 'class', 'lastUpdated', 'latin', 'intensity'],
  },
  compound: {
    tierA: ['name', 'slug', 'description', 'effects', 'sources', 'herbs'],
    tierB: ['category', 'therapeuticUses', 'contraindications', 'interactions', 'legalStatus'],
    tierC: ['dosage', 'preparation', 'duration', 'region', 'sideEffects', 'lastUpdated', 'activeCompounds'],
  },
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function slugify(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function hasMeaningfulValue(value) {
  if (Array.isArray(value)) return value.some(hasMeaningfulValue)
  if (value && typeof value === 'object') return Object.values(value).some(hasMeaningfulValue)
  if (value == null) return false
  const text = String(value).trim()
  if (!text) return false
  const normalized = text.toLowerCase()
  if (NULL_LIKE_VALUES.has(normalized)) return false
  if (PLACEHOLDER_PATTERNS.some(pattern => pattern.test(text))) return false
  return true
}

function hasNullLikeOrPlaceholder(value) {
  if (Array.isArray(value)) {
    if (value.length === 0) return true
    return value.some(item => hasNullLikeOrPlaceholder(item))
  }

  if (value && typeof value === 'object') {
    const values = Object.values(value)
    if (values.length === 0) return true
    return values.some(item => hasNullLikeOrPlaceholder(item))
  }

  if (value == null) return true
  const text = String(value).trim()
  if (!text) return true
  const normalized = text.toLowerCase()
  if (NULL_LIKE_VALUES.has(normalized)) return true
  return PLACEHOLDER_PATTERNS.some(pattern => pattern.test(text))
}

function buildSlugSet(records) {
  const slugs = new Set()
  for (const record of records) {
    const explicit = slugify(record?.slug)
    const derived = slugify(record?.name)
    if (explicit) slugs.add(explicit)
    if (derived) slugs.add(derived)
  }
  return slugs
}

function getRelatedItems(record, type) {
  if (type === 'herb') return Array.isArray(record?.activeCompounds) ? record.activeCompounds : []
  return Array.isArray(record?.herbs) ? record.herbs : []
}

function toRelatedSlug(value) {
  if (typeof value === 'string') return slugify(value)
  if (value && typeof value === 'object') return slugify(value.slug || value.name || value.id)
  return ''
}

function auditDataset(records, type, relatedSlugSet) {
  const fieldPresence = new Map()
  const fieldMissingCounts = new Map()
  const fieldNullLikeCounts = new Map()
  const sourceMissing = []
  const missingRelatedEntityLinks = []
  const duplicateSlugs = new Map()
  const invalidSlugs = []
  const missingSlugField = []

  const slugCounts = new Map()
  const fieldsUnion = new Set()

  for (const record of records) {
    for (const field of Object.keys(record || {})) fieldsUnion.add(field)
  }

  for (const field of fieldsUnion) {
    fieldPresence.set(field, 0)
    fieldMissingCounts.set(field, 0)
    fieldNullLikeCounts.set(field, 0)
  }

  for (const record of records) {
    const slugRaw = record?.slug
    const fallbackSlug = slugify(record?.name)
    const slug = slugify(slugRaw || fallbackSlug)

    if (slug) slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1)
    if (!slugRaw) missingSlugField.push(record?.name || '(unnamed)')
    if (slugRaw && slug !== slugRaw) invalidSlugs.push({ name: record?.name || null, slug: slugRaw, normalized: slug })

    for (const field of fieldsUnion) {
      const hasField = Object.prototype.hasOwnProperty.call(record, field)
      if (hasField) fieldPresence.set(field, (fieldPresence.get(field) || 0) + 1)

      const value = record?.[field]
      const meaningful = hasMeaningfulValue(value)

      if (!hasField || !meaningful) fieldMissingCounts.set(field, (fieldMissingCounts.get(field) || 0) + 1)
      if (hasNullLikeOrPlaceholder(value)) fieldNullLikeCounts.set(field, (fieldNullLikeCounts.get(field) || 0) + 1)
    }

    if (!hasMeaningfulValue(record?.sources)) {
      sourceMissing.push(record?.name || slug || '(unnamed)')
    }

    const relatedItems = getRelatedItems(record, type)
    if (relatedItems.length > 0) {
      const unresolved = relatedItems
        .map(toRelatedSlug)
        .filter(Boolean)
        .filter(candidate => !relatedSlugSet.has(candidate))

      if (unresolved.length > 0) {
        missingRelatedEntityLinks.push({
          name: record?.name || slug || '(unnamed)',
          slug,
          missingLinks: [...new Set(unresolved)].sort(),
        })
      }
    }
  }

  for (const [slug, count] of slugCounts.entries()) {
    if (count > 1) duplicateSlugs.set(slug, count)
  }

  const fieldStats = [...fieldsUnion]
    .sort((a, b) => a.localeCompare(b))
    .map(field => ({
      field,
      presentCount: fieldPresence.get(field) || 0,
      missingCount: fieldMissingCounts.get(field) || 0,
      nullLikeOrPlaceholderCount: fieldNullLikeCounts.get(field) || 0,
    }))

  return {
    totalRecords: records.length,
    fields: fieldStats,
    missingSourcesCount: sourceMissing.length,
    missingSourcesSample: sourceMissing.slice(0, 20),
    missingRelatedEntityLinksCount: missingRelatedEntityLinks.length,
    missingRelatedEntityLinksSample: missingRelatedEntityLinks.slice(0, 20),
    slugAudit: {
      missingSlugFieldCount: missingSlugField.length,
      invalidSlugCount: invalidSlugs.length,
      invalidSlugSample: invalidSlugs.slice(0, 20),
      duplicateSlugCount: duplicateSlugs.size,
      duplicateSlugs: [...duplicateSlugs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([slug, count]) => ({ slug, count })),
    },
  }
}

function buildTierGapSummary(fieldStats, tiers) {
  const byField = new Map(fieldStats.map(item => [item.field, item]))
  const summarize = fields =>
    fields.map(field => {
      const stat = byField.get(field)
      return {
        field,
        missingCount: stat?.missingCount ?? null,
        nullLikeOrPlaceholderCount: stat?.nullLikeOrPlaceholderCount ?? null,
      }
    })

  return {
    tierA: summarize(tiers.tierA),
    tierB: summarize(tiers.tierB),
    tierC: summarize(tiers.tierC),
  }
}

function topGaps(label, fieldStats, limit) {
  return fieldStats
    .slice()
    .sort((a, b) => b.missingCount - a.missingCount || b.nullLikeOrPlaceholderCount - a.nullLikeOrPlaceholderCount || a.field.localeCompare(b.field))
    .slice(0, limit)
    .map(item => ({ entityType: label, ...item }))
}

function run() {
  const herbs = readJson(HERBS_PATH)
  const compounds = readJson(COMPOUNDS_PATH)

  if (!Array.isArray(herbs) || !Array.isArray(compounds)) {
    throw new Error('Expected public/data/herbs.json and public/data/compounds.json to be arrays')
  }

  const herbSlugSet = buildSlugSet(herbs)
  const compoundSlugSet = buildSlugSet(compounds)

  const herbAudit = auditDataset(herbs, 'herb', compoundSlugSet)
  const compoundAudit = auditDataset(compounds, 'compound', herbSlugSet)

  const herbTierGaps = buildTierGapSummary(herbAudit.fields, TIERS.herb)
  const compoundTierGaps = buildTierGapSummary(compoundAudit.fields, TIERS.compound)

  const topGapsCombined = [...topGaps('herb', herbAudit.fields, 12), ...topGaps('compound', compoundAudit.fields, 12)]
    .sort((a, b) => b.missingCount - a.missingCount || b.nullLikeOrPlaceholderCount - a.nullLikeOrPlaceholderCount)
    .slice(0, 10)

  const priorityBacklog = {
    firstFixRecommendations: [
      'Backfill explicit slug fields and enforce slug uniqueness checks for both herbs and compounds.',
      'Enforce required source presence for every record; block records with missing or placeholder source arrays.',
      'Repair cross-link integrity: herb.activeCompounds should resolve to canonical compounds and compound.herbs should resolve to canonical herbs.',
      'Prioritize Tier A narrative and safety baseline completion (description, effects, contraindications/interactions where applicable).',
      'Normalize placeholder values (unknown/tbd/n/a/none) into true missing states before enrichment passes.',
    ],
    worseShapeAssessment: {
      worseEntityType:
        herbAudit.slugAudit.missingSlugFieldCount + herbAudit.missingSourcesCount + herbAudit.missingRelatedEntityLinksCount >
        compoundAudit.slugAudit.missingSlugFieldCount + compoundAudit.missingSourcesCount + compoundAudit.missingRelatedEntityLinksCount
          ? 'herb'
          : 'compound',
      scoringBasis: {
        herb: {
          missingSlugFieldCount: herbAudit.slugAudit.missingSlugFieldCount,
          missingSourcesCount: herbAudit.missingSourcesCount,
          missingRelatedEntityLinksCount: herbAudit.missingRelatedEntityLinksCount,
        },
        compound: {
          missingSlugFieldCount: compoundAudit.slugAudit.missingSlugFieldCount,
          missingSourcesCount: compoundAudit.missingSourcesCount,
          missingRelatedEntityLinksCount: compoundAudit.missingRelatedEntityLinksCount,
        },
      },
    },
    immediateValidationRules: [
      'Require non-empty Tier A fields: name, slug, description, effects, sources, and required relation field (herb.activeCompounds or compound.herbs).',
      'Reject null-like placeholders in Tier A fields (unknown, tbd, n/a, none, null, undefined, placeholder, coming soon).',
      'Require canonical slug formatting and uniqueness across each entity collection.',
      'Require all related-entity links to resolve to existing entity slugs.',
    ],
  }

  const report = {
    generatedAt: new Date().toISOString(),
    dataSnapshot: {
      herbsPath: path.relative(ROOT, HERBS_PATH),
      compoundsPath: path.relative(ROOT, COMPOUNDS_PATH),
      herbCount: herbs.length,
      compoundCount: compounds.length,
    },
    tiers: TIERS,
    herbs: {
      ...herbAudit,
      tierGapSummary: herbTierGaps,
    },
    compounds: {
      ...compoundAudit,
      tierGapSummary: compoundTierGaps,
    },
    top10MostImportantGaps: topGapsCombined,
    prioritizedBacklog: priorityBacklog,
  }

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true })
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(report, null, 2) + '\n', 'utf8')

  const mdLines = [
    '# Master Coverage Audit',
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    `- Herbs audited: **${report.dataSnapshot.herbCount}**`,
    `- Compounds audited: **${report.dataSnapshot.compoundCount}**`,
    `- Herb records missing sources: **${report.herbs.missingSourcesCount}**`,
    `- Compound records missing sources: **${report.compounds.missingSourcesCount}**`,
    `- Herb records with missing related links: **${report.herbs.missingRelatedEntityLinksCount}**`,
    `- Compound records with missing related links: **${report.compounds.missingRelatedEntityLinksCount}**`,
    `- Worse-shape dataset (scoring basis in JSON): **${report.prioritizedBacklog.worseShapeAssessment.worseEntityType}**`,
    '',
    '## Top 10 gaps',
    '',
    '| Rank | Type | Field | Missing | Null-like / placeholder |',
    '| --- | --- | --- | ---: | ---: |',
    ...report.top10MostImportantGaps.map((item, index) => `| ${index + 1} | ${item.entityType} | ${item.field} | ${item.missingCount} | ${item.nullLikeOrPlaceholderCount} |`),
    '',
    '## Priority backlog (first fixes)',
    '',
    ...report.prioritizedBacklog.firstFixRecommendations.map(item => `- ${item}`),
    '',
    '## Immediate validation rules',
    '',
    ...report.prioritizedBacklog.immediateValidationRules.map(item => `- ${item}`),
    '',
    'See `ops/reports/coverage-audit.json` for complete machine-readable detail.',
    '',
  ]

  fs.writeFileSync(OUTPUT_MD, mdLines.join('\n'), 'utf8')

  console.log(`[coverage-audit] herbs=${herbs.length} compounds=${compounds.length}`)
  console.log(`[coverage-audit] wrote ${path.relative(ROOT, OUTPUT_JSON)}`)
  console.log(`[coverage-audit] wrote ${path.relative(ROOT, OUTPUT_MD)}`)
}

run()
