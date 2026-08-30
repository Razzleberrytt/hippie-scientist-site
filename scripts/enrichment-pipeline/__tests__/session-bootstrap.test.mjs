import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { buildSessionBootstrap, scoreBootstrapCandidate, workpackIdFor } from '../lib/session-bootstrap.mjs'
import { shardOf } from '../lib/ids.mjs'

const roots = []
afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true })
})

function makeRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'session-bootstrap-'))
  roots.push(root)
  fs.mkdirSync(path.join(root, 'public', 'data', 'herbs-detail'), { recursive: true })
  fs.mkdirSync(path.join(root, 'public', 'data', 'compounds-detail'), { recursive: true })
  fs.mkdirSync(path.join(root, 'ops', 'enrichment-submissions', 'sessions', 'session-a'), { recursive: true })
  return root
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

const manifest = {
  shardCount: 8,
  sessions: [
    { sessionId: 'A', workerId: 'research-session-a', shard: 0, enabled: true },
    { sessionId: 'B', workerId: 'research-session-b', shard: 1, enabled: false },
  ],
}

function findSlugForShard(entityType, shard) {
  for (let index = 0; index < 10000; index += 1) {
    const slug = `fixture-${index}`
    if (shardOf(workpackIdFor(entityType, slug), 8) === shard) return slug
  }
  throw new Error('Unable to find deterministic fixture slug')
}

describe('research-session bootstrap', () => {
  it('derives stable workpack ids from public slugs', () => {
    expect(workpackIdFor('herb', 'crocus-sativus')).toBe('wp_herb_crocus_sativus')
    expect(workpackIdFor('compound', 'beta-alanine')).toBe('wp_compound_beta_alanine')
  })

  it('prioritizes published strong-framing zero-source profiles', () => {
    const high = scoreBootstrapCandidate({
      summary: 'Example carries a Grade A rating — strong evidence.',
      indexability_status: 'PUBLISH',
      sources: [],
      claimMap: [],
      evidence: { sourceCount: 0, claimCount: 0 },
      governance: { reviewStatus: 'needs_review', requiresHumanReview: true },
      indexability_reasons: ['missing_record_level_sources', 'summary-quality-missing'],
    })
    const low = scoreBootstrapCandidate({
      summary: 'Conservative profile.',
      indexability_status: 'NOINDEX',
      sources: [{ studyClass: 'systematic-review' }, { studyClass: 'rct' }, { studyClass: 'rct' }],
      claimMap: [{}, {}],
      evidence: { sourceCount: 3, claimCount: 2 },
      governance: { reviewStatus: 'approved', requiresHumanReview: false },
    })
    expect(high.score).toBeGreaterThan(low.score)
    expect(high.reasons).toContain('strong-framing-with-zero-sources')
    expect(high.reasons).toContain('missing-record-level-sources-gate')
  })

  it('detects source/claim count drift and human-evidence summary contradictions', () => {
    const scored = scoreBootstrapCandidate({
      summary: 'Strongest recorded design is a narrative review, drawn from 1 recorded study, none of which measured an outcome in people.',
      indexability_status: 'PUBLISH',
      sources: [
        { studyClass: 'rct', studyType: 'Randomized controlled trial' },
        { studyClass: 'systematic-review', studyType: 'Systematic review' },
      ],
      claimMap: [{ id: 'claim-1' }, { id: 'claim-2' }],
      evidence: { sourceCount: 1, claimCount: 0 },
    })

    expect(scored.reasons).toContain('source-count-drift')
    expect(scored.reasons).toContain('claim-count-drift')
    expect(scored.reasons).toContain('summary-human-evidence-contradiction')
    expect(scored.sourceCount).toBe(1)
    expect(scored.sourceArrayCount).toBe(2)
    expect(scored.claimCount).toBe(0)
    expect(scored.claimArrayCount).toBe(2)
  })

  it('flags published sourced profiles with no governed claim layer', () => {
    const scored = scoreBootstrapCandidate({
      summary: 'Sourced profile.',
      indexability_status: 'PUBLISH',
      sources: [{ studyClass: 'rct' }],
      claimMap: [],
      evidence: { sourceCount: 1, claimCount: 0 },
    })
    expect(scored.reasons).toContain('published-sources-without-claims')
    expect(scored.reasons).toContain('empty-claim-map')
  })

  it('inventories only the requested shard and marks staged workpacks without hiding them', () => {
    const root = makeRoot()
    const ownedSlug = findSlugForShard('herb', 0)
    const secondOwnedSlug = findSlugForShard('compound', 0)
    const foreignSlug = findSlugForShard('herb', 1)

    writeJson(path.join(root, 'public', 'data', 'herbs-detail', `${ownedSlug}.json`), {
      slug: ownedSlug, name: 'Owned Herb', indexability_status: 'PUBLISH',
      sources: [], evidence: { sourceCount: 0 }, claimMap: [], governance: { reviewStatus: 'needs_review', requiresHumanReview: true },
      indexability_reasons: ['missing_record_level_sources'],
    })
    writeJson(path.join(root, 'public', 'data', 'compounds-detail', `${secondOwnedSlug}.json`), {
      slug: secondOwnedSlug, name: 'Owned Compound', indexability_status: 'NOINDEX', sources: [{}, {}], evidence: { sourceCount: 2, claimCount: 1 }, claimMap: [{}],
    })
    writeJson(path.join(root, 'public', 'data', 'herbs-detail', `${foreignSlug}.json`), {
      slug: foreignSlug, name: 'Foreign Herb', indexability_status: 'PUBLISH', sources: [], evidence: { sourceCount: 0 }, claimMap: [],
    })

    const stagedId = workpackIdFor('compound', secondOwnedSlug)
    writeJson(path.join(root, 'ops', 'enrichment-submissions', 'sessions', 'session-a', 'fixture.json'), {
      fragmentVersion: 1, sessionId: 'A', shard: 0, batchId: 'fixture', createdAt: '2026-08-29T00:00:00.000Z',
      submissions: [{ workpackId: stagedId }],
    })

    const first = buildSessionBootstrap({ root, sessionId: 'A', manifest })
    const second = buildSessionBootstrap({ root, sessionId: 'A', manifest })

    expect(first).toEqual(second)
    expect(first.ownedWorkpacks).toBe(2)
    expect(first.stagedWorkpacks).toBe(1)
    expect(first.remainingWorkpacks).toBe(1)
    expect(first.candidates).toHaveLength(2)
    expect(first.candidates.every(item => item.shard === 0)).toBe(true)
    expect(first.candidates.find(item => item.workpackId === stagedId)?.staged).toBe(true)
    expect(first.next).toHaveLength(1)
    expect(first.next[0].staged).toBe(false)
  })

  it('rejects unknown and disabled sessions', () => {
    const root = makeRoot()
    expect(() => buildSessionBootstrap({ root, sessionId: 'Z', manifest })).toThrow('Unknown research session Z')
    expect(() => buildSessionBootstrap({ root, sessionId: 'B', manifest })).toThrow('Research session B is disabled')
  })
})
