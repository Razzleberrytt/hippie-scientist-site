#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function asText(value) {
  return String(value || '').trim()
}

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, fileName), 'utf8'))
}

function writeJson(fileName, data) {
  fs.writeFileSync(path.join(DATA_DIR, fileName), `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function resolveSlug(record) {
  return slugify(
    record?.slug ||
      record?.commonName ||
      record?.common ||
      record?.name ||
      record?.latinName ||
      record?.latin ||
      record?.id ||
      record?.scientific
  )
}

function toIndexableEntry(record, type) {
  const name = asText(record?.common || record?.commonName || record?.name || record?.scientific)
  const slug = resolveSlug(record)
  const description = asText(record?.description || record?.summary)
  const mechanism = asText(record?.mechanism || record?.mechanismOfAction || record?.mechanismofaction)

  const flags = {
    hasValidSlug: Boolean(slug),
    hasDescription: Boolean(description),
    hasMechanism: Boolean(mechanism),
  }

  const presentCount = [flags.hasValidSlug, flags.hasDescription, flags.hasMechanism].filter(Boolean)
    .length
  const completenessScore = Math.round((presentCount / 3) * 100)
  const passesIndexThreshold = flags.hasValidSlug && (flags.hasDescription || flags.hasMechanism)

  return {
    slug,
    route: `/${type}/${slug}`,
    name,
    flags,
    completenessScore,
    passesIndexThreshold,
  }
}

function buildIndexable(fileName, type, allowedSlugs = null) {
  const rows = readJson(fileName)
  const dedupedBySlug = new Map()

  rows
    .map(record => toIndexableEntry(record, type))
    .filter(entry => !allowedSlugs || allowedSlugs.has(entry.slug))
    .filter(entry => entry.passesIndexThreshold)
    .forEach(entry => {
      const existing = dedupedBySlug.get(entry.slug)
      if (!existing || entry.completenessScore > existing.completenessScore) {
        dedupedBySlug.set(entry.slug, entry)
      }
    })

  return [...dedupedBySlug.values()]
}

function run() {
  const herbRuntimeRows = readJson('herbs.json')
  const runtimeHerbSlugs = new Set(herbRuntimeRows.map(resolveSlug).filter(Boolean))
  const herbSourceFile = fs.existsSync(path.join(DATA_DIR, 'herbs_combined_updated.json'))
    ? 'herbs_combined_updated.json'
    : 'herbs.json'
  const herbs = buildIndexable(herbSourceFile, 'herbs', runtimeHerbSlugs)
  const compounds = buildIndexable('compounds_combined_updated.json', 'compounds')

  writeJson('indexable-herbs.json', herbs)
  writeJson('indexable-compounds.json', compounds)

  console.log(`[indexable] herbs source=${herbSourceFile}`)
  console.log(`[indexable] herbs runtime=${runtimeHerbSlugs.size}`)
  console.log(`[indexable] herbs indexable=${herbs.length}`)
  console.log(`[indexable] compounds indexable=${compounds.length}`)
}

run()
