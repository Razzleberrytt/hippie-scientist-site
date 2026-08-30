import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createCanonicalOwnerResolver, workpackIdForOwner } from '../lib/canonical-owner.mjs'
import { scheduleShard } from '../lib/control-plane.mjs'
import { shardOf } from '../lib/ids.mjs'

const roots = []
afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true })
})

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

function makeRoot({ redirects = '', aliases = { herbs: {}, compounds: {} } } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'canonical-owner-'))
  roots.push(root)
  fs.mkdirSync(path.join(root, 'public', 'data', 'herbs-detail'), { recursive: true })
  fs.mkdirSync(path.join(root, 'public', 'data', 'compounds-detail'), { recursive: true })
  fs.mkdirSync(path.join(root, 'public'), { recursive: true })
  fs.writeFileSync(path.join(root, 'public', '_redirects'), redirects)
  writeJson(path.join(root, 'data', 'canonical', 'enrichment-owner-aliases.json'), aliases)
  return root
}

function addOwner(root, entityType, slug) {
  const directory = entityType === 'herb' ? 'herbs-detail' : 'compounds-detail'
  writeJson(path.join(root, 'public', 'data', directory, `${slug}.json`), { slug, name: slug })
}

describe('canonical enrichment owner resolution', () => {
  it('resolves explicit compound aliases before workpack construction', () => {
    const root = makeRoot({ aliases: { herbs: {}, compounds: { cbd: 'cannabidiol', nac: 'n-acetylcysteine' } } })
    addOwner(root, 'compound', 'cannabidiol')
    addOwner(root, 'compound', 'n-acetylcysteine')
    const resolver = createCanonicalOwnerResolver({ root })

    const cbd = resolver.resolveWorkpack({ workpackId: 'wp_compound_cbd' })
    expect(cbd.workpackId).toBe('wp_compound_cannabidiol')
    expect(cbd.entityType).toBe('compound')
    expect(cbd.ownerResolution.submitted.workpackId).toBe('wp_compound_cbd')
    expect(cbd.ownerResolution.changed).toBe(true)

    const nac = resolver.resolveWorkpack({ entityType: 'compound', entitySlug: 'nac' })
    expect(nac.workpackId).toBe('wp_compound_n_acetylcysteine')
    expect(nac.ownerResolution.canonical.slug).toBe('n-acetylcysteine')
  })

  it('follows cross-taxonomy canonical redirects and preserves the submitted owner as provenance', () => {
    const root = makeRoot({ redirects: '/herbs/resveratrol /compounds/resveratrol/ 301\n' })
    const resolver = createCanonicalOwnerResolver({ root })

    const resolved = resolver.resolveWorkpack({
      workpackId: 'wp_herb_resveratrol',
      entityType: 'herb',
      entitySlug: 'resveratrol',
    })

    expect(resolved.workpackId).toBe('wp_compound_resveratrol')
    expect(resolved.entityType).toBe('compound')
    expect(resolved.ownerResolution.submitted).toEqual({
      entityType: 'herb', slug: 'resveratrol', workpackId: 'wp_herb_resveratrol',
    })
    expect(resolved.ownerResolution.via[0].authority).toBe('public/_redirects')
  })

  it('normalizes hyphen/underscore spelling without changing canonical identity', () => {
    const root = makeRoot()
    addOwner(root, 'compound', 'beta-alanine')
    const resolver = createCanonicalOwnerResolver({ root })

    const resolved = resolver.resolveWorkpack({ workpackId: 'wp_compound_beta_alanine' })
    expect(resolved.workpackId).toBe('wp_compound_beta_alanine')
    expect(resolved.ownerResolution.canonical.slug).toBe('beta-alanine')
    expect(resolved.ownerResolution.changed).toBe(false)
  })

  it('fails closed when the declared workpack disagrees with explicit entity identity', () => {
    const root = makeRoot()
    addOwner(root, 'compound', 'cannabidiol')
    const resolver = createCanonicalOwnerResolver({ root })

    expect(() => resolver.resolveWorkpack({
      workpackId: 'wp_compound_cbd', entityType: 'compound', entitySlug: 'cannabidiol',
    })).toThrow(/workpack_identity_mismatch/u)
  })

  it('fails closed for unknown and conflicting canonical-owner authority', () => {
    const unknownRoot = makeRoot()
    const unknown = createCanonicalOwnerResolver({ root: unknownRoot })
    expect(() => unknown.resolveWorkpack({ workpackId: 'wp_compound_not_a_real_owner' }))
      .toThrow(/unknown_canonical_owner/u)

    const ambiguousRoot = makeRoot({
      redirects: '/compounds/example /herbs/example/ 301\n',
      aliases: { herbs: {}, compounds: { example: 'different-target' } },
    })
    addOwner(ambiguousRoot, 'herb', 'example')
    addOwner(ambiguousRoot, 'compound', 'different-target')
    const ambiguous = createCanonicalOwnerResolver({ root: ambiguousRoot })
    expect(() => ambiguous.resolveWorkpack({ workpackId: 'wp_compound_example' }))
      .toThrow(/ambiguous_canonical_owner/u)
  })

  it('makes scheduleShard hash only the resolved canonical workpack', () => {
    const root = makeRoot({ aliases: { herbs: {}, compounds: { cbd: 'cannabidiol' } } })
    addOwner(root, 'compound', 'cannabidiol')
    const resolver = createCanonicalOwnerResolver({ root })
    const canonicalId = workpackIdForOwner('compound', 'cannabidiol')
    const canonicalShard = shardOf(canonicalId, 8)
    const rawShard = shardOf('wp_compound_cbd', 8)

    const scheduled = scheduleShard(
      [{ workpackId: 'wp_compound_cbd', evidenceGap: 5 }],
      canonicalShard,
      8,
      shardOf,
      resolver.resolveWorkpack,
    )

    expect(scheduled).toHaveLength(1)
    expect(scheduled[0].workpackId).toBe(canonicalId)
    expect(scheduled[0].ownerResolution.submitted.workpackId).toBe('wp_compound_cbd')
    if (rawShard !== canonicalShard) {
      expect(scheduleShard(
        [{ workpackId: 'wp_compound_cbd' }], rawShard, 8, shardOf, resolver.resolveWorkpack,
      )).toHaveLength(0)
    }
  })

  it('does not allow callers to bypass canonicalization at the scheduler boundary', () => {
    expect(() => scheduleShard([{ workpackId: 'wp_compound_cbd' }], 0, 8, shardOf))
      .toThrow(/canonical_owner_resolution_required/u)
  })
})
