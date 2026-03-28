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

const asText = value => (typeof value === 'string' ? value : '').trim()

function readJsonIfExists(fileName) {
  const fullPath = path.join(DATA_DIR, fileName)
  if (!fs.existsSync(fullPath)) return []
  const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
  return Array.isArray(parsed) ? parsed : []
}

function getName(record) {
  return asText(record?.name) || asText(record?.displayName) || asText(record?.compound) || asText(record?.id)
}

function getSlug(record, name) {
  const source = asText(record?.slug) || name || asText(record?.id)
  return slugify(source)
}

function toIndexableCompound(record) {
  const name = getName(record)
  const slug = getSlug(record, name)
  if (!slug) return null

  const summary =
    asText(record?.summary) || asText(record?.description) || asText(record?.mechanism) || asText(record?.category)

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

  const bySlug = new Map()
  for (const record of [...compounds, ...compoundsCombined]) {
    const entry = toIndexableCompound(record)
    if (!entry) continue
    if (!bySlug.has(entry.slug)) bySlug.set(entry.slug, entry)
  }

  return [...bySlug.values()]
}

function run() {
  const rows = buildIndexableCompounds()
  const outputPath = path.join(DATA_DIR, 'indexable-compounds.json')
  fs.writeFileSync(outputPath, `${JSON.stringify(rows, null, 2)}\n`, 'utf8')
  console.log(`[indexable-compounds] wrote ${rows.length} entries`)
}

run()
