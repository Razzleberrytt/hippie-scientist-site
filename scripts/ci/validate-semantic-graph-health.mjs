#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const DATA_DIR = path.join(process.cwd(), 'public', 'data', 'runtime-maps')

const MAX_RELATIONSHIPS_PER_NODE = 24
const MAX_AVERAGE_RELATIONSHIPS = 10
const MAX_SELF_REFERENCES = 0

const TARGETS = [
  'related-profiles.json',
  'comparison-map.json',
  'stack-map.json',
  'ecosystem-map.json',
]

function text(value) {
  return String(value ?? '').trim().toLowerCase()
}

async function readMap(fileName) {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, fileName), 'utf8')
    const parsed = JSON.parse(raw)

    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : {}
  } catch {
    return {}
  }
}

function analyzeMap(name, map) {
  let totalRelationships = 0
  let nodeCount = 0
  let oversizedNodes = 0
  let selfReferences = 0

  for (const [slug, entries] of Object.entries(map)) {
    const normalizedSlug = text(slug)

    if (!Array.isArray(entries)) {
      continue
    }

    nodeCount += 1
    totalRelationships += entries.length

    if (entries.length > MAX_RELATIONSHIPS_PER_NODE) {
      oversizedNodes += 1
    }

    for (const entry of entries) {
      if (text(entry?.slug) === normalizedSlug) {
        selfReferences += 1
      }
    }
  }

  const averageRelationships = nodeCount > 0
    ? totalRelationships / nodeCount
    : 0

  return {
    name,
    nodeCount,
    totalRelationships,
    averageRelationships,
    oversizedNodes,
    selfReferences,
  }
}

async function main() {
  const failures = []

  for (const target of TARGETS) {
    const map = await readMap(target)
    const report = analyzeMap(target, map)

    console.log(
      `${report.name}: ${report.nodeCount} nodes, ${report.totalRelationships} relationships, avg ${report.averageRelationships.toFixed(2)}`,
    )

    if (report.averageRelationships > MAX_AVERAGE_RELATIONSHIPS) {
      failures.push(
        `${report.name} average relationships ${report.averageRelationships.toFixed(2)} exceeds ${MAX_AVERAGE_RELATIONSHIPS}`,
      )
    }

    if (report.oversizedNodes > 0) {
      failures.push(
        `${report.name} contains ${report.oversizedNodes} oversized nodes`,
      )
    }

    if (report.selfReferences > MAX_SELF_REFERENCES) {
      failures.push(
        `${report.name} contains ${report.selfReferences} self references`,
      )
    }
  }

  if (failures.length > 0) {
    console.error('\nSemantic graph health validation failed:')

    for (const failure of failures) {
      console.error(`- ${failure}`)
    }

    process.exit(1)
  }

  console.log('\nSemantic graph health OK')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
