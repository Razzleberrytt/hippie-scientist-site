import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createCanonicalOwnerResolver } from '../lib/canonical-owner.mjs'
import {
  canonicalTargetKey,
  reconcilePersistedSubmissionOwner,
} from '../lib/fragment-owner-reconciliation.mjs'

const roots = []
afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true })
})

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

function makeRoot({ redirects = '', aliases = { herbs: {}, compounds: {} } } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fragment-owner-'))
  roots.push(root)
  fs.mkdirSync(path.join(root, 'public', 'data', 'herbs-detail'), { recursive: true })
  fs.mkdirSync(path.join(root, 'public', 'data', 'compounds-detail'), { recursive: true })
  fs.writeFileSync(path.join(root, 'public', '_redirects'), redirects)
  writeJson(path.join(root, 'data', 'canonical', 'enrichment-owner-aliases.json'), aliases)
  return root
}

function addOwner(root, entityType, slug) {
  const directory = entityType === 'herb' ? 'herbs-detail' : 'compounds-detail'
  writeJson(path.join(root, 'public', 'data', directory, `${slug}.json`), { slug, name: slug })
}

describe('persisted fragment owner reconciliation', () => {
  it('reconciles a stale alias workpack without rewriting submitted provenance', () => {
    const root = makeRoot({ aliases: { herbs: {}, compounds: { nac: 'n-acetylcysteine' } } })
    addOwner(root, 'compound', 'n-acetylcysteine')
    const resolver = createCanonicalOwnerResolver({ root })
    const submission = {
      workpackId: 'wp_compound_nac',
      entityType: 'compound',
      entitySlug: 'n-acetylcysteine',
    }

    const result = reconcilePersistedSubmissionOwner(submission, resolver.resolveWorkpack)

    expect(result.submitted).toEqual({
      workpackId: 'wp_compound_nac', entityType: 'compound', slug: 'n-acetylcysteine',
    })
    expect(result.canonical).toEqual({
      workpackId: 'wp_compound_n_acetylcysteine', entityType: 'compound', slug: 'n-acetylcysteine',
    })
    expect(result.changed).toBe(true)
    expect(canonicalTargetKey(submission, result)).toBe('compound:n-acetylcysteine')
  })

  it('reconciles stale cross-taxonomy ownership through route authority', () => {
    const root = makeRoot({ redirects: '/herbs/resveratrol /compounds/resveratrol/ 301\n' })
    addOwner(root, 'compound', 'resveratrol')
    const resolver = createCanonicalOwnerResolver({ root })

    const result = reconcilePersistedSubmissionOwner({
      workpackId: 'wp_herb_resveratrol',
      entityType: 'herb',
      entitySlug: 'resveratrol',
    }, resolver.resolveWorkpack)

    expect(result.canonical).toEqual({
      workpackId: 'wp_compound_resveratrol', entityType: 'compound', slug: 'resveratrol',
    })
    expect(result.via.some(step => step.authority === 'public/_redirects')).toBe(true)
  })

  it('fails closed when persisted workpack and entity paths resolve to different owners', () => {
    const root = makeRoot()
    addOwner(root, 'compound', 'caffeine')
    addOwner(root, 'compound', 'theanine')
    const resolver = createCanonicalOwnerResolver({ root })

    expect(() => reconcilePersistedSubmissionOwner({
      workpackId: 'wp_compound_caffeine',
      entityType: 'compound',
      entitySlug: 'theanine',
    }, resolver.resolveWorkpack)).toThrow(/persisted_owner_disagreement/u)
  })

  it('leaves surface submissions on the existing non-profile identity path', () => {
    const result = reconcilePersistedSubmissionOwner({
      workpackId: 'wp_surface_sleep-guide',
      entityType: 'surface',
      surfaceId: 'sleep-guide',
    })

    expect(result.changed).toBe(false)
    expect(result.canonical.workpackId).toBe('wp_surface_sleep-guide')
    expect(canonicalTargetKey({ entityType: 'surface', surfaceId: 'sleep-guide' }, result)).toBe('surface:sleep-guide')
  })
})
