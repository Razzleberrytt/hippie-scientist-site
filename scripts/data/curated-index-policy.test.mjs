import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  curatedPolicySlugs,
  loadCuratedIndexPolicy,
} from '../lib/curated-index-policy.mjs'

const policy = loadCuratedIndexPolicy(process.cwd())

describe('canonical curated index policy', () => {
  it('has unique validated entries and preserves the legacy bypass boundary explicitly', () => {
    const herbSlugs = curatedPolicySlugs(policy, 'herbs')
    const compoundSlugs = curatedPolicySlugs(policy, 'compounds')
    const herbBypasses = curatedPolicySlugs(policy, 'herbs', { governanceIndexBypassOnly: true })
    const compoundBypasses = curatedPolicySlugs(policy, 'compounds', { governanceIndexBypassOnly: true })

    expect(new Set(herbSlugs).size).toBe(herbSlugs.length)
    expect(new Set(compoundSlugs).size).toBe(compoundSlugs.length)
    expect(herbBypasses.length).toBeLessThanOrEqual(herbSlugs.length)
    expect(compoundBypasses.length).toBeLessThanOrEqual(compoundSlugs.length)
    expect(herbBypasses).toHaveLength(14)
    expect(compoundBypasses).toHaveLength(15)
  })

  it('does not preserve the stale citicoline compound ownership', () => {
    const compoundSlugs = curatedPolicySlugs(policy, 'compounds')
    expect(compoundSlugs).not.toContain('citicoline')
    expect(policy.resolvedConflicts).toEqual(expect.arrayContaining([
      expect.objectContaining({
        slug: 'citicoline',
        previousKind: 'compound',
        canonicalOwner: '/herbs/citicoline/',
      }),
    ]))
  })

  it('keeps restricted kratom-family slugs out of curated membership', () => {
    const all = new Set([
      ...curatedPolicySlugs(policy, 'herbs'),
      ...curatedPolicySlugs(policy, 'compounds'),
    ])
    expect(all.has('kratom')).toBe(false)
    expect(all.has('mitragynine')).toBe(false)
  })

  it('makes every curated-policy consumer read the canonical authority instead of a private slug list', () => {
    const consumers = [
      'scripts/data/apply-governance-overlay.mjs',
      'scripts/data/promote-profile.mjs',
      'scripts/audit/verify-curated-indexable.mjs',
      'scripts/audit-indexation.mjs',
      'scripts/ci/audit-profile-robots.mjs',
      'scripts/audit/botanical-atlas-coverage.mjs',
    ]

    for (const file of consumers) {
      const source = fs.readFileSync(file, 'utf8')
      expect(source, file).toContain('loadCuratedIndexPolicy')
    }

    const overlay = fs.readFileSync('scripts/data/apply-governance-overlay.mjs', 'utf8')
    expect(overlay).not.toMatch(/CURATED_(?:HERB|COMPOUND)_SLUGS\s*=\s*new Set\s*\(\s*\[/)

    const runtime = fs.readFileSync('lib/index-allowlist.ts', 'utf8')
    expect(runtime).toContain("curated-index-policy.json")
    expect(runtime).not.toMatch(/CURATED_INDEXABLE_(?:HERB|COMPOUND)_SLUGS\s*=\s*\[/)
  })
})
