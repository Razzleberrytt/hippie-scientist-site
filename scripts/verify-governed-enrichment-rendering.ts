import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import governedArtifact from '../public/data/enrichment-governed.json'
import {
  getEvidenceLabelMeta,
  getGovernedResearchEnrichment,
  isPublishableGovernedEnrichment,
} from '../src/lib/governedResearch'
import type { ResearchEnrichment } from '../src/types/researchEnrichment'

type Entry = {
  entityType: 'herb' | 'compound'
  entitySlug: string
}

const ROOT = process.cwd()
const SUBMISSIONS_PATH = path.join(ROOT, 'ops', 'enrichment-submissions.json')
const GOVERNED_INPUT_PATH = path.join(ROOT, 'public', 'data', 'enrichment-submissions-governed-input.jsonl')

const rows = governedArtifact as Array<{
  entityType: 'herb' | 'compound'
  entitySlug: string
  researchEnrichment: ResearchEnrichment
}>

function parseJsonl(filePath: string) {
  return fs
    .readFileSync(filePath, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => JSON.parse(line) as { entityType: 'herb' | 'compound'; entitySlug: string })
}

assert.ok(rows.length > 0, 'Canonical governed artifact is empty.')

for (const row of rows) {
  const expected = isPublishableGovernedEnrichment(row.researchEnrichment)
  const actual = getGovernedResearchEnrichment(row.entityType, row.entitySlug)
  if (expected) {
    assert.ok(actual, `Expected publishable governed enrichment for ${row.entityType}:${row.entitySlug}.`)
  } else {
    assert.equal(actual, null, `Expected blocked governed enrichment for ${row.entityType}:${row.entitySlug}.`)
  }
}

const promotedEntries = parseJsonl(GOVERNED_INPUT_PATH)
const promotedEntityKeys = new Set(promotedEntries.map(entry => `${entry.entityType}:${entry.entitySlug}`))

assert.ok(promotedEntityKeys.size > 0, 'Expected promoted governed input entities for runtime validation.')
const submissions = JSON.parse(fs.readFileSync(SUBMISSIONS_PATH, 'utf8')) as Array<
  Entry & { submissionId: string; reviewStatus: string; active: boolean }
>

const blockedStatuses = new Set(['revision_requested', 'rejected', 'draft_submission', 'ready_for_review'])
const blockedEntities = new Set(
  submissions
    .filter(row => blockedStatuses.has(row.reviewStatus) || row.active !== true)
    .map(row => `${row.entityType}:${row.entitySlug}`),
)

for (const key of blockedEntities) {
  const [entityType, entitySlug] = key.split(':') as ['herb' | 'compound', string]
  const runtime = getGovernedResearchEnrichment(entityType, entitySlug)
  const wasPromoted = promotedEntityKeys.has(key)
  if (!wasPromoted) {
    assert.equal(runtime, null, `Blocked/unapproved governed entity leaked at runtime: ${key}`)
  }
}

const evidenceLabels = [
  'stronger_human_support',
  'limited_human_support',
  'observational_only',
  'preclinical_only',
  'traditional_use_only',
  'mixed_or_uncertain',
  'conflicting_evidence',
  'insufficient_evidence',
] as const

for (const label of evidenceLabels) {
  const meta = getEvidenceLabelMeta(label)
  assert.ok(meta.title.length > 0, `Missing title for evidence label ${label}`)
  assert.ok(meta.tone.length > 0, `Missing tone for evidence label ${label}`)
}

console.log(`[verify-governed-enrichment-rendering] PASS rows=${rows.length} promotedEntities=${promotedEntityKeys.size}`)
