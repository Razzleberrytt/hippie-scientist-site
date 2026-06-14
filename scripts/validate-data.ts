import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

type RawRecord = string | Record<string, unknown>

type ValidationRecord = {
  kind: 'herb' | 'compound'
  slug: string
  name: string
  commonName: string
  category: string
  sources: unknown
  sourceFile: string
}

type MissingSourcesReport = {
  generatedAt: string
  counts: {
    herbs: number
    compounds: number
    total: number
  }
  herbs: string[]
  compounds: string[]
}

const dataDir = path.join(process.cwd(), 'public', 'data')
const outputDir = path.join(process.cwd(), 'scripts', 'output')
const invalidSlugLiterals = new Set(['', 'nan', 'object-object'])

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(path.join(process.cwd(), relativePath), 'utf8')) as T
}

function safeStr(value: unknown): string {
  return String(value ?? '').trim()
}

function safeSlug(value: unknown): string {
  return safeStr(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => (part.length <= 3 ? part.toUpperCase() : `${part[0]?.toUpperCase() || ''}${part.slice(1)}`))
    .join(' ')
}

function isBadSlug(slug: string): boolean {
  return invalidSlugLiterals.has(slug.toLowerCase()) || /^\d+$/.test(slug)
}

function indexBySlug(records: Record<string, unknown>[]): Map<string, Record<string, unknown>> {
  return new Map(
    records
      .map((record) => [safeSlug(record.slug), record] as const)
      .filter(([slug]) => Boolean(slug)),
  )
}

function normalizeRecord(
  kind: 'herb' | 'compound',
  raw: RawRecord,
  detailsBySlug: Map<string, Record<string, unknown>>,
  sourceFile: string,
): ValidationRecord {
  const rawObject = typeof raw === 'string' ? { slug: raw } : raw
  const slug = safeSlug(rawObject.slug)
  const detail = detailsBySlug.get(slug) || {}
  const merged = { ...detail, ...rawObject }

  return {
    kind,
    slug,
    name: safeStr(merged.name) || titleFromSlug(slug),
    commonName: safeStr(merged.common_name || merged.commonName || merged.common),
    category: safeStr(merged.category || merged.category_label || merged.categories || merged.primary_effects || merged.effects) || kind,
    sources: merged.sources,
    sourceFile,
  }
}

function validateCollection(records: ValidationRecord[]): string[] {
  const errors: string[] = []
  const seen = new Map<string, ValidationRecord>()

  for (const record of records) {
    const label = `${record.kind}:${record.slug || '<empty>'}`

    if (isBadSlug(record.slug)) {
      const regenerated = safeSlug(record.name || record.commonName)
      errors.push(`${label} has invalid slug; suggested regenerated slug: ${regenerated || '<none>'}`)
    }

    if (seen.has(record.slug)) {
      errors.push(`${label} duplicates slug from ${seen.get(record.slug)?.sourceFile}`)
    } else {
      seen.set(record.slug, record)
    }

    if (!record.name && !record.commonName) {
      errors.push(`${label} is missing name/common_name`)
    }

    if (!record.slug) {
      errors.push(`${label} is missing slug`)
    }

    if (!record.category) {
      errors.push(`${label} is missing category`)
    }
  }

  return errors
}

const herbDetails = readJson<Record<string, unknown>[]>('public/data/herbs.json')
const compoundDetails = readJson<Record<string, unknown>[]>('public/data/compounds.json')
const herbs = readJson<RawRecord[]>('public/data/indexable-herbs.json').map((record) =>
  normalizeRecord('herb', record, indexBySlug(herbDetails), 'public/data/indexable-herbs.json'),
)
const compounds = readJson<RawRecord[]>('public/data/indexable-compounds.json').map((record) =>
  normalizeRecord('compound', record, indexBySlug(compoundDetails), 'public/data/indexable-compounds.json'),
)

const errors = [...validateCollection(herbs), ...validateCollection(compounds)]
const missingHerbSources = herbs.filter((record) => !Array.isArray(record.sources) || record.sources.length === 0).map((record) => record.slug)
const missingCompoundSources = compounds.filter((record) => !Array.isArray(record.sources) || record.sources.length === 0).map((record) => record.slug)

const report: MissingSourcesReport = {
  generatedAt: new Date().toISOString(),
  counts: {
    herbs: missingHerbSources.length,
    compounds: missingCompoundSources.length,
    total: missingHerbSources.length + missingCompoundSources.length,
  },
  herbs: missingHerbSources,
  compounds: missingCompoundSources,
}

mkdirSync(outputDir, { recursive: true })
writeFileSync(path.join(outputDir, 'missing-sources.json'), `${JSON.stringify(report, null, 2)}\n`)

if (errors.length > 0) {
  console.error(`Data validation failed with ${errors.length} issue(s):`)
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log(`Data validation passed for ${herbs.length} herbs and ${compounds.length} compounds.`)
console.log(`Missing sources report: ${path.relative(process.cwd(), path.join(outputDir, 'missing-sources.json'))}`)
