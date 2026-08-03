import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  isLeakedPresentationText,
  resolveRuntimeRecordLayers,
} from '../runtime-record-resolver.mjs'

const root = process.cwd()
const dataDir = path.join(root, 'public', 'data')
const PRESENTATION_FIELDS = [
  'name',
  'displayName',
  'summary',
  'description',
  'hero',
  'coreInsight',
  'short_earthy_summary',
  'shortEarthySummary',
  'dosage',
  'typical_dosage',
]

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, relativePath), 'utf8'))
}

function buildSlugMap(records) {
  return new Map(
    records
      .filter((record) => record && typeof record.slug === 'string' && record.slug)
      .map((record) => [record.slug, record]),
  )
}

function detailFiles(directory) {
  const absoluteDir = path.join(dataDir, directory)
  if (!fs.existsSync(absoluteDir)) return []

  return fs
    .readdirSync(absoluteDir)
    .filter((fileName) => fileName.endsWith('.json'))
    .sort()
    .map((fileName) => ({
      fileName,
      detail: JSON.parse(fs.readFileSync(path.join(absoluteDir, fileName), 'utf8')),
    }))
}

function auditResolvedDetails(kind, baseRecords, directory) {
  const baseBySlug = buildSlugMap(baseRecords)
  const leaks = []
  const resolverErrors = []
  let checked = 0

  for (const { fileName, detail } of detailFiles(directory)) {
    const slug = String(detail?.slug || detail?.id || fileName.replace(/\.json$/, ''))
    const base = baseBySlug.get(slug)
    if (!base) continue

    let resolved
    try {
      resolved = resolveRuntimeRecordLayers(base, [detail])
    } catch (error) {
      resolverErrors.push(`${kind}/${fileName}: ${error instanceof Error ? error.message : String(error)}`)
      continue
    }

    checked += 1
    for (const field of PRESENTATION_FIELDS) {
      const value = resolved?.[field]
      if (typeof value !== 'string' || !isLeakedPresentationText(value, field)) continue
      leaks.push(`${kind}/${fileName} ${field}: ${value}`)
    }
  }

  return { checked, leaks, resolverErrors }
}

describe('runtime detail presentation leak guard', () => {
  it('prevents committed detail artifacts from leaking pipeline prose after runtime resolution', () => {
    const herbs = readJson('herbs.json')
    const compounds = readJson('compounds.json')
    const herbResult = auditResolvedDetails('herbs-detail', herbs, 'herbs-detail')
    const compoundResult = auditResolvedDetails('compounds-detail', compounds, 'compounds-detail')

    expect(herbResult.checked + compoundResult.checked).toBeGreaterThan(0)
    expect([...herbResult.resolverErrors, ...compoundResult.resolverErrors]).toEqual([])
    expect([...herbResult.leaks, ...compoundResult.leaks]).toEqual([])
  })
})
