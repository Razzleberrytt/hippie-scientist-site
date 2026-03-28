#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')

const slugify = s =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const asText = value => String(value || '').trim()

function readJsonIfExists(fileName) {
  const fullPath = path.join(DATA_DIR, fileName)
  if (!fs.existsSync(fullPath)) return []
  const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
  return Array.isArray(parsed) ? parsed : []
}

function toIndexableCompound(record) {
  const name = asText(record?.name || record?.displayName || record?.compound || record?.id)
  const slugSource = record?.slug || record?.id || name
  const slug = slugify(slugSource)
  if (!slug) return null

  const summary = asText(record?.summary || record?.description || record?.mechanism || record?.category)

  return {
    slug,
    route: `/compounds/${slug}`,
    name,
    summary,
  }
}

function buildIndexableCompounds() {
  const compounds = readJsonIfExists('compounds.json')
  const compoundsCombined = readJsonIfExists('compounds_combined_updated.json')

  const deduped = new Map()

  for (const record of [...compounds, ...compoundsCombined]) {
    const entry = toIndexableCompound(record)
    if (!entry) continue
    if (!deduped.has(entry.slug)) {
      deduped.set(entry.slug, entry)
    }
  }

  return [...deduped.values()]
}

function writeIndexableCompounds(rows) {
  const outputPath = path.join(DATA_DIR, 'indexable-compounds.json')
  fs.writeFileSync(outputPath, `${JSON.stringify(rows, null, 2)}\n`, 'utf8')
}

function run() {
  const indexableCompounds = buildIndexableCompounds()
  writeIndexableCompounds(indexableCompounds)
  console.log(`[indexable-compounds] wrote ${indexableCompounds.length} entries`)
}

run()
