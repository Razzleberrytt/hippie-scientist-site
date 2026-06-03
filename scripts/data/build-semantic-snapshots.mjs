#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const DATA_DIR_ARG = process.argv.find((arg) => arg.startsWith('--data-dir='))
const DATA_DIR = DATA_DIR_ARG
  ? DATA_DIR_ARG.split('=')[1]
  : 'public/data'

const SNAPSHOT_DIR = path.join(DATA_DIR, 'runtime-snapshots')
const MAX_SNAPSHOT_ENTRIES = 8
const MAX_LABELS = 5

function text(value) {
  return String(value ?? '').trim()
}

function stableClone(value) {
  if (Array.isArray(value)) {
    return value.map(stableClone)
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .reduce((acc, key) => {
        acc[key] = stableClone(value[key])
        return acc
      }, {})
  }

  return value
}

async function readJson(relativePath, fallback) {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, relativePath), 'utf8')
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function sanitizeEntry(entry) {
  const slug = text(entry?.slug)

  if (!slug) return null

  return {
    slug,
    score: Number.isFinite(Number(entry?.score)) ? Number(entry.score) : 0,
    relationshipKinds: Array.isArray(entry?.relationshipKinds)
      ? entry.relationshipKinds.map(text).filter(Boolean).slice(0, MAX_LABELS)
      : [],
    overlapLabels: Array.isArray(entry?.overlapLabels)
      ? entry.overlapLabels.map(text).filter(Boolean).slice(0, MAX_LABELS)
      : [],
  }
}

function sortedEntries(entries) {
  if (!Array.isArray(entries)) return []

  return entries
    .map(sanitizeEntry)
    .filter(Boolean)
    .sort((a, b) => {
      const scoreDelta = Number(b.score || 0) - Number(a.score || 0)

      if (scoreDelta !== 0) return scoreDelta

      return text(a.slug).localeCompare(text(b.slug))
    })
    .slice(0, MAX_SNAPSHOT_ENTRIES)
}

function buildSnapshots({ related, comparison, stack, ecosystem }) {
  const slugs = new Set([
    ...Object.keys(related || {}),
    ...Object.keys(comparison || {}),
    ...Object.keys(stack || {}),
    ...Object.keys(ecosystem || {}),
  ])

  const snapshots = {}

  for (const slug of [...slugs].sort((a, b) => a.localeCompare(b))) {
    snapshots[slug] = {
      related: sortedEntries(related?.[slug]),
      comparison: sortedEntries(comparison?.[slug]),
      stack: sortedEntries(stack?.[slug]),
      ecosystem: sortedEntries(ecosystem?.[slug]),
    }
  }

  return snapshots
}

async function writeJson(fileName, value) {
  await fs.mkdir(SNAPSHOT_DIR, { recursive: true })

  await fs.writeFile(
    path.join(SNAPSHOT_DIR, fileName),
    `${JSON.stringify(stableClone(value))}\n`,
    'utf8',
  )
}

async function main() {
  const [related, comparison, stack, ecosystem] = await Promise.all([
    readJson('runtime-maps/related-profiles.json', {}),
    readJson('runtime-maps/comparison-map.json', {}),
    readJson('runtime-maps/stack-map.json', {}),
    readJson('runtime-maps/ecosystem-map.json', {}),
  ])

  const snapshots = buildSnapshots({ related, comparison, stack, ecosystem })

  await writeJson('profile-semantic-snapshots.json', snapshots)

  console.log(
    `Built semantic profile snapshots for ${Object.keys(snapshots).length} profiles`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
