#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { resolveWorkbookPath } from './workbook-source.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'public', 'data')
const publishInputDir = path.join(root, 'ops', 'publish-input')

const UPDATED_DATASETS_DIR = process.env.UPDATED_DATASETS_DIR

const PORTABLE_CANDIDATE_DIRS = [
  UPDATED_DATASETS_DIR,
  path.join(root, 'data-sources'),
  path.join(root, 'public', 'data'),
]

const LEGACY_CANDIDATE_DIRS = ['/home/oai/share', '/mnt/data', '/tmp', root]

const CANDIDATE_DIRS = [...PORTABLE_CANDIDATE_DIRS, ...LEGACY_CANDIDATE_DIRS].filter(
  value => typeof value === 'string' && value.trim().length > 0
)

const FILES = [
  {
    source: 'herbs_combined_updated.json',
    targets: ['herbs.json'],
  },
  {
    source: 'compounds_combined_updated.json',
    targets: ['compounds.json'],
  },
]

const PUBLISH_INPUT_FILES = {
  herbs: 'API_PAYLOAD.json',
  compounds: 'COMPOUND_API_PAYLOAD.json',
  goals: 'Goal Page Copy.json',
}

const ROUTE_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function parseArgs(argv) {
  return {
    fromPublishInput: argv.includes('--from-publish-input'),
    skipWorkbookOverlay: argv.includes('--skip-workbook-overlay'),
  }
}

function firstExistingPath(fileName) {
  for (const dir of Array.from(new Set(CANDIDATE_DIRS))) {
    const candidate = path.join(dir, fileName)
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function asText(value) {
  return String(value ?? '').trim()
}

function readJsonArray(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`[data-sync] Missing ${label} input file: ${path.relative(root, filePath)}`)
  }
  const payload = readJson(filePath)
  if (!Array.isArray(payload)) {
    throw new Error(`[data-sync] Expected ${label} input to be an array: ${path.relative(root, filePath)}`)
  }
  return payload
}

function normalizeSlug(value) {
  return asText(value).toLowerCase()
}

const PLACEHOLDER_TOKENS = new Set(['', 'unknown', 'nan', 'null', 'undefined', '[object object]'])
const NUMERIC_ONLY_PATTERN = /^\d+$/

function isPlaceholderToken(value) {
  return PLACEHOLDER_TOKENS.has(asText(value).toLowerCase())
}

function isInvalidCanonicalEntityRecord(record, entityType) {
  const name = asText(record?.name ?? record?.common ?? record?.commonName)
  const slug = normalizeSlug(record?.slug)
  const tooShort = name.length === 1 || slug.length === 1
  const numericOnlyForCompounds =
    entityType === 'compounds' && (NUMERIC_ONLY_PATTERN.test(name) || NUMERIC_ONLY_PATTERN.test(slug))

  return {
    invalid:
      isPlaceholderToken(name) ||
      isPlaceholderToken(slug) ||
      tooShort ||
      numericOnlyForCompounds,
    name,
    slug,
  }
}

function assertUnique(values, label) {
  const seen = new Set()
  values.forEach(value => {
    if (!value) throw new Error(`[data-sync] ${label}: blank value`)
    if (seen.has(value)) throw new Error(`[data-sync] ${label}: duplicate "${value}"`)
    seen.add(value)
  })
}

function normalizePublishHerbRecord(row, index) {
  const slug = normalizeSlug(row?.slug)
  const name = asText(row?.name)
  if (!slug) throw new Error(`[data-sync] herbs row ${index + 1}: blank slug`)
  if (!name) throw new Error(`[data-sync] herbs row ${index + 1}: blank required name`)
  return { ...row, slug, name }
}

function normalizePublishCompoundRecord(row, index) {
  const slug = normalizeSlug(row?.slug)
  const name = asText(row?.name)
  if (!slug) throw new Error(`[data-sync] compounds row ${index + 1}: blank slug`)
  if (!name) throw new Error(`[data-sync] compounds row ${index + 1}: blank required name`)
  return { ...row, slug, name }
}

function normalizePublishGoalRecord(row, index) {
  const routeKey = normalizeSlug(row?.routeKey ?? row?.route_key ?? row?.slug)
  const title = asText(row?.title ?? row?.name)
  if (!routeKey) throw new Error(`[data-sync] goals row ${index + 1}: blank route key`)
  if (!title) throw new Error(`[data-sync] goals row ${index + 1}: blank required title`)
  if (!ROUTE_KEY_PATTERN.test(routeKey)) {
    throw new Error(`[data-sync] goals row ${index + 1}: invalid route key "${routeKey}"`)
  }
  return { ...row, routeKey, title }
}

function ingestPublishInputIfAvailable({ required = false } = {}) {
  const herbPath = path.join(publishInputDir, PUBLISH_INPUT_FILES.herbs)
  const compoundPath = path.join(publishInputDir, PUBLISH_INPUT_FILES.compounds)
  const goalsPath = path.join(publishInputDir, PUBLISH_INPUT_FILES.goals)
  const hasAny =
    fs.existsSync(herbPath) || fs.existsSync(compoundPath) || fs.existsSync(goalsPath)

  if (!hasAny && !required) return false

  const herbs = readJsonArray(herbPath, 'herbs')
    .map(normalizePublishHerbRecord)
    .filter((record, index) => {
      const validation = isInvalidCanonicalEntityRecord(record, 'herbs')
      if (validation.invalid) {
        console.warn(
          `[data-sync] Skipping invalid canonical herbs row from ${PUBLISH_INPUT_FILES.herbs} index=${index} name="${validation.name}" slug="${validation.slug}"`
        )
        return false
      }
      return true
    })
  const compounds = readJsonArray(compoundPath, 'compounds')
    .map(normalizePublishCompoundRecord)
    .filter((record, index) => {
      const validation = isInvalidCanonicalEntityRecord(record, 'compounds')
      if (validation.invalid) {
        console.warn(
          `[data-sync] Skipping invalid canonical compounds row from ${PUBLISH_INPUT_FILES.compounds} index=${index} name="${validation.name}" slug="${validation.slug}"`
        )
        return false
      }
      return true
    })
  const goals = readJsonArray(goalsPath, 'goals').map(normalizePublishGoalRecord)
  assertUnique(
    herbs.map(record => record.slug),
    'herbs slug',
  )
  assertUnique(
    compounds.map(record => record.slug),
    'compounds slug',
  )
  assertUnique(
    goals.map(record => record.routeKey),
    'goals route key',
  )

  writeJson(path.join(outDir, 'herbs.json'), herbs)
  writeJson(path.join(outDir, 'compounds.json'), compounds)
  writeJson(path.join(outDir, 'goal-pages.json'), goals)

  console.log(`[data-sync] Ingested publish input from ${path.relative(root, publishInputDir)}`)
  console.log(`[data-sync] wrote herbs=${herbs.length} compounds=${compounds.length} goals=${goals.length}`)
  return true
}

function withSlugs(records, entity) {
  if (!Array.isArray(records)) return records

  return records
    .filter((record, index) => {
      if (!record || typeof record !== 'object') return false
      const validation = isInvalidCanonicalEntityRecord(record, entity)
      if (validation.invalid) {
        console.warn(
          `[data-sync] Skipping invalid canonical ${entity} row from ${entity}.json index=${index} name="${validation.name}" slug="${validation.slug}"`
        )
        return false
      }
      return true
    })
    .map(record => {
    if (!record || typeof record !== 'object') return record

    const slugSource =
      entity === 'herbs'
        ? record.common ?? record.commonName ?? record.name ?? record.scientific ?? ''
        : record.name ?? record.commonName ?? ''

    return {
      ...record,
      slug: slugify(slugSource),
    }
  })
}

function hydrateUpdatedDatasetSlugs(fileName, entity) {
  const filePath = path.join(outDir, fileName)
  if (!fs.existsSync(filePath)) {
    console.log(`[data-sync] Skipping slug hydration for ${fileName}; file not found.`)
    return
  }

  const records = readJson(filePath)
  const hydrated = withSlugs(records, entity)
  writeJson(filePath, hydrated)
  console.log(`[data-sync] Hydrated ${entity} slugs in ${filePath}`)
}

const options = parseArgs(process.argv.slice(2))

fs.mkdirSync(outDir, { recursive: true })

const usedPublishInput = ingestPublishInputIfAvailable({ required: options.fromPublishInput })

if (!usedPublishInput) {
  for (const file of FILES) {
    const sourcePath = firstExistingPath(file.source)

    if (!sourcePath) {
      console.log(`[data-sync] Skipping ${file.source}; source file not found. Keeping existing targets.`)
      continue
    }

    for (const target of file.targets) {
      const targetPath = path.join(outDir, target)
      fs.copyFileSync(sourcePath, targetPath)
      console.log(`[data-sync] Copied ${sourcePath} -> ${targetPath}`)
    }
  }
}

hydrateUpdatedDatasetSlugs('herbs.json', 'herbs')
hydrateUpdatedDatasetSlugs('compounds.json', 'compounds')

if (!options.skipWorkbookOverlay) {
  const workbookPath = resolveWorkbookPath(root)
  if (fs.existsSync(workbookPath)) {
    console.log(`[data-sync] Exporting workbook datasets from ${workbookPath}`)
    execFileSync('node', ['scripts/export-workbook-to-json.mjs'], {
      cwd: root,
      stdio: 'inherit',
      env: {
        ...process.env,
        HERB_XLSX_PATH: path.relative(root, workbookPath),
      },
    })
    console.log(`[data-sync] Applying workbook overlay from ${workbookPath}`)
    execFileSync('node', ['scripts/import-xlsx-monographs.mjs'], {
      cwd: root,
      stdio: 'inherit',
      env: {
        ...process.env,
        HERB_XLSX_PATH: path.relative(root, workbookPath),
      },
    })
  } else {
    console.log('[data-sync] Skipping workbook overlay; no workbook file found.')
  }
} else {
  console.log('[data-sync] Skipping workbook overlay via --skip-workbook-overlay.')
}
