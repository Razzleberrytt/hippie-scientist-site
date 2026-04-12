#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { resolveWorkbookPath } from './workbook-source.mjs'

const root = process.cwd()
const outDir = path.join(root, 'public', 'data')

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
    targets: ['herbs.json', 'herbs_combined_updated.json'],
  },
  {
    source: 'compounds_combined_updated.json',
    targets: ['compounds.json', 'compounds_combined_updated.json'],
  },
]

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

function withSlugs(records, entity) {
  if (!Array.isArray(records)) return records

  return records.map(record => {
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

fs.mkdirSync(outDir, { recursive: true })

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

hydrateUpdatedDatasetSlugs('herbs_combined_updated.json', 'herbs')
hydrateUpdatedDatasetSlugs('compounds_combined_updated.json', 'compounds')

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
