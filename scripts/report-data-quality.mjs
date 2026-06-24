#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const DEFAULT_SUMMARY = 'Profile pending review'

function normalizeSlug(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function run() {
  const herbsPath = path.join(repoRoot, 'public', 'data-next', 'herbs.json')
  const outPath = path.join(repoRoot, 'public', 'data-next', '_meta', 'quality-report.json')
  const herbs = JSON.parse(fs.readFileSync(herbsPath, 'utf8'))

  const mechanismCounts = new Map()
  const nameCounts = new Map()
  const suspiciousSlugs = []

  let defaultSummaries = 0
  let missingScientificNames = 0
  let emptyDescriptions = 0
  let emptyActiveCompounds = 0

  herbs.forEach((record, index) => {
    const name = String(record?.name ?? '').trim()
    const slug = String(record?.slug ?? '').trim()

    if (String(record?.summary ?? '').trim() === DEFAULT_SUMMARY) defaultSummaries += 1
    if (!String(record?.scientificName ?? '').trim()) missingScientificNames += 1
    if (!String(record?.description ?? '').trim()) emptyDescriptions += 1
    if (!Array.isArray(record?.activeCompounds) || record.activeCompounds.length === 0) emptyActiveCompounds += 1

    if (Array.isArray(record?.mechanismTags)) {
      record.mechanismTags.forEach(tag => {
        const normalizedTag = String(tag ?? '').trim()
        if (!normalizedTag) return
        mechanismCounts.set(normalizedTag, (mechanismCounts.get(normalizedTag) || 0) + 1)
      })
    }

    if (name) {
      nameCounts.set(name, (nameCounts.get(name) || 0) + 1)
    }

    if (!slug || slug !== normalizeSlug(slug) || /--/.test(slug) || /^-|-$/.test(slug) || /\d{4,}/.test(slug)) {
      suspiciousSlugs.push({ index, name, slug })
    }
  })

  const duplicateNames = [...nameCounts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }))

  const topMechanismTags = [...mechanismCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 25)
    .map(([tag, count]) => ({ tag, count }))

  const report = {
    generatedAt: new Date().toISOString(),
    dataset: 'public/data-next/herbs.json',
    herbCount: herbs.length,
    defaultSummaries,
    missingScientificNames,
    emptyDescriptions,
    emptyActiveCompounds,
    topMechanismTags,
    duplicateNames,
    suspiciousSlugs,
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  console.log(`[data-next-quality] wrote ${path.relative(repoRoot, outPath)}`)
}

run()
