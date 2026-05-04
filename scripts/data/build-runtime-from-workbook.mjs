#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { resolveWorkbookPath } from '../workbook-source.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const SHEETS = {
  herbs: 'Herb Master V3',
  compounds: 'Compound Master V3',
  herbCompoundMap: 'Herb Compound Map V3',
  stackGenerator: 'Stack Generator V1',
  compoundCardPayload: 'Compound Card Payload',
  compoundDetailPayload: 'Compound Detail Payload',
  seoPagePayload: 'SEO Page Payload',
  ctaGatePayload: 'CTA Gate Payload',
  routeBuildManifest: 'Route Build Manifest',
}

const OPTIONAL_PAYLOADS = [
  {
    sheet: SHEETS.compoundCardPayload,
    fileName: 'compound-card-payload.json',
    requiredHeaders: ['slug'],
  },
  {
    sheet: SHEETS.compoundDetailPayload,
    fileName: 'compound-detail-payload.json',
    requiredHeaders: ['slug'],
  },
  {
    sheet: SHEETS.seoPagePayload,
    fileName: 'seo-page-payload.json',
    requiredHeaders: ['slug', 'publish_ready'],
  },
  {
    sheet: SHEETS.ctaGatePayload,
    fileName: 'cta-gate-payload.json',
    requiredHeaders: ['slug', 'show_cta'],
  },
  {
    sheet: SHEETS.routeBuildManifest,
    fileName: 'route-build-manifest.json',
    requiredHeaders: ['slug'],
  },
]

const STACK_VARIANTS = new Set(['starter', 'advanced', 'aggressive'])
const STACK_ROLES = new Set(['anchor', 'amplifier', 'support', 'optional'])
const STARTER_EXCLUDED_SAFETY_FLAGS = new Set([
  'pregnancy',
  'uncontrolled-blood-pressure',
  'heart-rhythm',
  'sedative-interaction',
  'anticoagulant-interaction',
  'renal-impairment',
  'liver-injury-concern',
])

function clean(v) {
  if (!v) return ''
  return String(v).trim()
}

function slug(v) {
  return clean(v)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function titleCase(v) {
  return clean(v)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function splitList(v) {
  return clean(v)
    .split(/[|;,]/)
    .map(item => clean(item))
    .filter(Boolean)
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function toNumber(v) {
  const n = Number(clean(v))
  return Number.isFinite(n) ? n : 0
}

function evidenceScore(v) {
  const text = clean(v).toLowerCase()
  if (/^(high|strong|a|tier\s*1|1)$/.test(text)) return 4
  if (/^(moderate|b|tier\s*2|2)$/.test(text)) return 3
  if (/^(limited|low|c|tier\s*3|3)$/.test(text)) return 2
  return 1
}

function isEligible(v) {
  return ['yes', 'true', '1', 'y', 'eligible'].includes(clean(v).toLowerCase())
}

function read(workbook, name) {
  const sheet = workbook.Sheets[name]
  if (!sheet) {
    console.warn(`[data] Missing sheet: ${name}`)
    return []
  }
  return XLSX.utils.sheet_to_json(sheet, { defval: '' })
}

function readOptional(workbook, name) {
  const sheet = workbook.Sheets[name]
  if (!sheet) return []
  return XLSX.utils.sheet_to_json(sheet, { defval: '' })
}

function readOptionalPayload(workbook, config) {
  const sheet = workbook.Sheets[config.sheet]
  if (!sheet) {
    console.warn(`[data] Optional payload sheet missing: ${config.sheet}; writing empty ${config.fileName}`)
    return []
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
  const headers = new Set(Object.keys(rows[0] || {}).map(header => clean(header).toLowerCase()))
  const missingHeaders = config.requiredHeaders.filter(header => !headers.has(header.toLowerCase()))

  if (missingHeaders.length > 0) {
    console.warn(`[data] Optional payload sheet ${config.sheet} missing headers: ${missingHeaders.join(', ')}; writing empty ${config.fileName}`)
    return []
  }

  return rows
    .map(row => normalizePayloadRow(row))
    .filter(row => row.slug || row.route || row.path)
}

function normalizePayloadRow(row) {
  const normalized = {}
  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = slug(key).replace(/-/g, '_')
    if (!normalizedKey) continue
    normalized[normalizedKey] = typeof value === 'string' ? clean(value) : value
  }

  const rowSlug = slug(
    normalized.slug ||
      normalized.compound_slug ||
      normalized.page_slug ||
      normalized.route_slug ||
      normalized.name ||
      normalized.title,
  )

  return {
    ...normalized,
    slug: rowSlug,
  }
}

function dedupe(rows) {
  const seen = new Set()
  return rows.filter(r => {
    if (!r.slug || seen.has(r.slug)) return false
    seen.add(r.slug)
    return true
  })
}

function write(outDir, name, data) {
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, name), JSON.stringify(data, null, 2))
}

function normalizeStackRow(r) {
  const variant = clean(r.stack_variant || r.variant).toLowerCase() || 'starter'
  const role = clean(r.role_override || r.role).toLowerCase()

  return {
    goal_slug: slug(r.goal_slug || r.goal),
    effect_slug: slug(r.effect_slug || r.effect),
    mechanism_slug: slug(r.mechanism_slug || r.mechanism),
    compound_slug: slug(r.compound_slug || r.compound),
    stack_variant: STACK_VARIANTS.has(variant) ? variant : 'starter',
    eligible: clean(r.eligible).toLowerCase(),
    role_override: STACK_ROLES.has(role) ? role : '',
    dosage: clean(r.dosage),
    timing: clean(r.timing),
    evidence_tier: clean(r.evidence_tier || r.evidence),
    safety_flags: splitList(r.safety_flags).map(slug),
    avoid_if: splitList(r.avoid_if),
    caution_notes: splitList(r.caution_notes),
    time_to_effect: clean(r.time_to_effect),
    duration: clean(r.duration),
    affiliate_priority: toNumber(r.affiliate_priority),
    stack_priority: toNumber(r.stack_priority),
    source_fields: splitList(r.source_fields),
    notes: clean(r.notes),
  }
}

function scoreStackRow(row) {
  const safetyPenalty = row.safety_flags.length * 10
  return evidenceScore(row.evidence_tier) * 100 + row.stack_priority * 10 + row.affiliate_priority - safetyPenalty
}

function assignRole(row, index) {
  if (row.role_override) return row.role_override
  if (index === 0) return 'anchor'
  if (index === 1) return 'amplifier'
  if (index <= 3) return 'support'
  return 'optional'
}

function maxCompoundsForVariant(variant) {
  if (variant === 'aggressive') return 6
  if (variant === 'advanced') return 5
  return 3
}

function shouldKeepRowForVariant(row) {
  if (!row.goal_slug || !row.compound_slug || !isEligible(row.eligible)) return false
  if (row.stack_variant !== 'starter') return true
  return !row.safety_flags.some(flag => STARTER_EXCLUDED_SAFETY_FLAGS.has(flag))
}

function buildStackSlug(goalSlug, variant) {
  return variant === 'starter' ? goalSlug : `${goalSlug}-${variant}`
}

function buildStackTitle(goalSlug, variant) {
  const goalTitle = titleCase(goalSlug)
  const variantTitle = titleCase(variant)
  return variant === 'starter'
    ? `${goalTitle} Support Stack`
    : `${goalTitle} ${variantTitle} Stack`
}

function buildStackSummary(goalSlug, variant) {
  if (variant === 'aggressive') return `A higher-intensity ${titleCase(goalSlug).toLowerCase()} stack generated from workbook eligibility, evidence, and safety fields.`
  if (variant === 'advanced') return `A broader ${titleCase(goalSlug).toLowerCase()} stack generated from workbook eligibility, evidence, and safety fields.`
  return `A conservative ${titleCase(goalSlug).toLowerCase()} stack generated from workbook eligibility, evidence, and safety fields.`
}

function buildGeneratedStacks(stackRows, compoundMap) {
  const grouped = new Map()

  stackRows.filter(shouldKeepRowForVariant).forEach(row => {
    if (!compoundMap.has(row.compound_slug)) return
    const key = `${row.goal_slug}::${row.stack_variant}`
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push(row)
  })

  return [...grouped.entries()].map(([key, rows]) => {
    const [goalSlug, variant] = key.split('::')
    const selected = rows
      .sort((a, b) => scoreStackRow(b) - scoreStackRow(a))
      .slice(0, maxCompoundsForVariant(variant))

    const compounds = selected.map((row, index) => {
      const compound = compoundMap.get(row.compound_slug)
      const displayName = clean(compound?.name) || titleCase(row.compound_slug)
      const role = assignRole(row, index)

      return {
        compound_slug: row.compound_slug,
        display_name: displayName,
        role,
        dosage: row.dosage || clean(compound?.dosage),
        timing: row.timing,
        evidence_tier: row.evidence_tier || clean(compound?.evidence),
        safety_flags: row.safety_flags,
        affiliate_priority: row.affiliate_priority,
        source_trace: {
          sheet: SHEETS.stackGenerator,
          fields: row.source_fields.length > 0 ? row.source_fields : ['goal_slug', 'compound_slug', 'dosage', 'timing', 'evidence_tier', 'safety_flags'],
        },
      }
    })

    return {
      slug: buildStackSlug(goalSlug, variant),
      goal_slug: goalSlug,
      goal: goalSlug,
      title: buildStackTitle(goalSlug, variant),
      summary: buildStackSummary(goalSlug, variant),
      short_description: buildStackSummary(goalSlug, variant),
      variant,
      compounds,
      stack: compounds.map(compound => ({
        compound: compound.compound_slug,
        dosage: compound.dosage,
        timing: compound.timing,
        role: compound.role,
      })),
      avoid_if: unique(selected.flatMap(row => row.avoid_if)),
      caution_notes: unique(selected.flatMap(row => row.caution_notes)),
      expected_time_to_effect: unique(selected.map(row => row.time_to_effect)).join(' / '),
      duration: unique(selected.map(row => row.duration)).join(' / '),
      source_trace: {
        sheet: SHEETS.stackGenerator,
        goal_slug: goalSlug,
        variant,
      },
    }
  }).filter(stack => stack.compounds.length > 0)
}

function main() {
  const outDir = path.resolve(repoRoot, 'public/data')
  const workbookPath = resolveWorkbookPath(repoRoot)

  const wb = XLSX.readFile(workbookPath)

  const herbs = dedupe(
    read(wb, SHEETS.herbs).map(r => ({
      slug: slug(r.slug || r.name),
      name: clean(r.name),
      summary: clean(r.summary),
      compounds: [],
    })),
  )

  const compounds = dedupe(
    read(wb, SHEETS.compounds).map(r => ({
      slug: slug(r.slug || r.name),
      name: clean(r.name),
      mechanism: clean(r.mechanism_summary),
      evidence: clean(r.evidence_grade),
      dosage: clean(r.dosage_range),
      safety: clean(r.safety_notes),
      herbs: [],
    })),
  )

  const map = read(wb, SHEETS.herbCompoundMap).map(r => ({
    herb: slug(r.herb_slug || r.herb),
    compound: slug(r.compound_slug || r.compound),
  }))

  const stackGeneratorRows = readOptional(wb, SHEETS.stackGenerator).map(normalizeStackRow)

  if (stackGeneratorRows.length > 0) {
    console.log(`[data] stack generator rows: ${stackGeneratorRows.length}`)
  } else {
    console.log('[data] Stack Generator V1 not found; skipping stack generator prep')
  }

  const herbMap = new Map(herbs.map(h => [h.slug, h]))
  const compMap = new Map(compounds.map(c => [c.slug, c]))

  map.forEach(m => {
    const h = herbMap.get(m.herb)
    const c = compMap.get(m.compound)
    if (!h || !c) return
    h.compounds.push(c.slug)
    c.herbs.push(h.slug)
  })

  const generatedStacks = buildGeneratedStacks(stackGeneratorRows, compMap)

  write(outDir, 'herbs.json', herbs)
  write(outDir, 'compounds.json', compounds)
  write(outDir, 'herb-compound-map.json', map)

  for (const payloadConfig of OPTIONAL_PAYLOADS) {
    const payloadRows = readOptionalPayload(wb, payloadConfig)
    write(outDir, payloadConfig.fileName, dedupe(payloadRows))
    console.log(`[data] ${payloadConfig.fileName}: ${payloadRows.length} rows`)
  }

  if (generatedStacks.length > 0) {
    write(outDir, 'stacks.json', generatedStacks)
    console.log(`[data] generated stacks: ${generatedStacks.length}`)
  } else {
    console.log('[data] no workbook-generated stacks; preserving existing stacks.json')
  }

  console.log('[data] build complete')
}

main()
