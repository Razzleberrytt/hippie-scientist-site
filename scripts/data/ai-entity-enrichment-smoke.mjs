#!/usr/bin/env node

import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { buildAiEntityArtifacts } from './ai-entity-enrichment-lib.mjs'

const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'ths-ai-entity-'))
const previousCwd = process.cwd()

try {
  process.chdir(tempRoot)
  const dataDir = path.join(tempRoot, 'public', 'data')
  const report = await buildAiEntityArtifacts({
    dataDir,
    herbs: [
      {
        slug: 'test-herb',
        name: 'Test Herb',
        scientific: 'Herba exemplaris',
        aliases: ['Example herb'],
        category: 'Adaptogen',
        safetyNotes: 'Use with caution.',
        contraindications: ['Pregnancy'],
        researchEnrichment: {
          evidenceSummary: 'One small randomized trial suggests a possible effect.',
          evidenceTier: 'tier-3-limited',
          evidenceClassesPresent: ['human-clinical'],
          supportedUses: [
            {
              claim: 'May modestly improve a test outcome.',
              evidenceClass: 'human-clinical',
              sourceRefIds: ['trial-1'],
              population: 'Adults',
              primaryPmids: ['12345678'],
            },
          ],
          mechanisms: [
            {
              claim: 'A proposed mechanism involves the example pathway.',
              evidenceClass: 'preclinical-mechanistic',
              sourceRefIds: ['trial-1'],
            },
          ],
          relatedEntities: [
            {
              entityType: 'compound',
              slug: 'test-compound',
              relationshipType: 'contains',
            },
          ],
          sourceRefs: [
            {
              sourceId: 'trial-1',
              sourceType: 'rct',
              title: 'A test randomized trial',
              evidenceClass: 'human-clinical',
              extractConfidence: 'high',
              reviewer: 'Editorial review',
              publicationYear: 2025,
              url: 'https://pubmed.ncbi.nlm.nih.gov/12345678/',
            },
          ],
          pageEvidenceJudgment: {
            evidenceLabel: 'limited_human_support',
            grading: {
              confidenceIndex: 42,
              conflictState: 'none',
            },
            uncertaintyNotes: ['Replication is needed.'],
          },
          reviewedBy: 'The Hippie Scientist',
          lastReviewedAt: '2026-07-13',
          editorialStatus: 'published',
          editorialReadiness: { publishable: true },
        },
      },
    ],
    compounds: [],
  })

  assert.equal(report.summary.entities, 1)
  assert.ok(report.summary.averageScore > 0)

  const artifactPath = path.join(dataDir, 'ai-entities', 'herb', 'test-herb.json')
  const manifestPath = path.join(dataDir, 'ai-entities', 'manifest.json')
  const artifact = JSON.parse(await fs.readFile(artifactPath, 'utf8'))
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))

  assert.equal(artifact['@context'], 'https://schema.org')
  assert.ok(artifact['@graph'].some((node) => node['@type'] === 'Claim'))
  assert.ok(artifact['@graph'].some((node) => node['@type'] === 'ScholarlyArticle'))
  assert.equal(manifest.entities[0].dataUrl, '/data/ai-entities/herb/test-herb.json')

  console.log('AI entity enrichment smoke test passed.')
} finally {
  process.chdir(previousCwd)
  await fs.rm(tempRoot, { recursive: true, force: true })
}
