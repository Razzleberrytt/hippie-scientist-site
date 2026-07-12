import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { applyBatch, resolveTarget, buildIndex } from '../apply.mjs'
import { createSnapshot, restoreSnapshot, listSnapshots } from '../snapshot.mjs'
import { entityId } from '../ids.mjs'

const TS = '2026-01-01T00:00:00.000Z'

function entity(type, slug, name, extra = {}) {
  return {
    id: entityId(type, slug),
    entity_type: type,
    canonical_name: name,
    slug,
    aliases: [],
    description: '',
    review_status: 'approved',
    created_at: TS,
    updated_at: TS,
    provenance: [],
    data: {},
    legacy: {},
    ...extra,
  }
}

function dataset() {
  return {
    entities: [
      entity('herb', 'ashwagandha', 'Ashwagandha', { description: 'Existing sourced description.' }),
      entity('herb', 'kava', 'Kava'),
      entity('compound', 'withanolide', 'Withanolide'),
      entity('herb', 'twin-a', 'Twin'),
      entity('herb', 'twin-b', 'Twin'),
    ],
    claims: [],
    edges: [],
    sources: [],
  }
}

function patch(over = {}) {
  return {
    patch_id: over.patch_id || 'p1',
    patch_version: '1',
    created_at: TS,
    target: over.target || { slug: 'kava', entity_type: 'herb' },
    operations: over.operations || [],
    sources: over.sources || [],
    notes: '',
    confidence: 0.5,
    requires_review: false,
    original_filename: 'x.json',
    original_hash: 'abc',
    ...over,
  }
}

describe('resolveTarget', () => {
  const index = buildIndex(dataset())
  it('resolves by id, slug, and refuses ambiguous name', () => {
    expect(resolveTarget({ id: entityId('herb', 'kava') }, index).entity.slug).toBe('kava')
    expect(resolveTarget({ slug: 'ashwagandha' }, index).entity.slug).toBe('ashwagandha')
    expect(resolveTarget({ canonical_name: 'Twin' }, index).ambiguous).toHaveLength(2)
  })
  it('disambiguates same-name by entity_type', () => {
    const res = resolveTarget({ canonical_name: 'Twin', entity_type: 'herb' }, index)
    expect(res.ambiguous).toHaveLength(2) // both are herbs → still ambiguous
  })
  it('errors on unknown target', () => {
    expect(resolveTarget({ slug: 'does-not-exist' }, index).error).toBeTruthy()
  })
})

describe('applyBatch — successful update', () => {
  it('applies a sourced field update and records old→new', () => {
    const { dataset: next, results } = applyBatch(dataset(), [patch({
      operations: [{ op: 'update_field', field: 'data.dosage', value: '300mg', payload: {} }],
    })])
    expect(results[0].status).toBe('applied')
    const kava = next.entities.find((e) => e.slug === 'kava')
    expect(kava.data.dosage).toBe('300mg')
    expect(results[0].changes[0]).toMatchObject({ type: 'update_field', field: 'data.dosage', new: '300mg' })
  })
})

describe('applyBatch — strength rule (never overwrite stronger with weaker)', () => {
  it('refuses to overwrite an existing evidence-bearing field with unsourced data', () => {
    const { dataset: next, results } = applyBatch(dataset(), [patch({
      target: { slug: 'ashwagandha', entity_type: 'herb' },
      operations: [{ op: 'update_field', field: 'description', value: 'Weaker unsourced claim', payload: {} }],
    })])
    const ash = next.entities.find((e) => e.slug === 'ashwagandha')
    expect(ash.description).toBe('Existing sourced description.') // unchanged
    expect(results[0].conflicts.some((c) => c.type === 'weaker_overwrite')).toBe(true)
    expect(results[0].status).toBe('noop')
    expect(results[0].requires_review).toBe(true)
  })
  it('allows the overwrite when the patch carries a source', () => {
    const { dataset: next, results } = applyBatch(dataset(), [patch({
      target: { slug: 'ashwagandha', entity_type: 'herb' },
      operations: [{ op: 'update_field', field: 'description', value: 'Better sourced description', payload: {} }],
      sources: [{ pmid: '12345' }],
    })])
    const ash = next.entities.find((e) => e.slug === 'ashwagandha')
    expect(ash.description).toBe('Better sourced description')
    expect(results[0].status).toBe('applied')
  })
})

describe('applyBatch — ambiguous + unresolved targets rejected', () => {
  it('rejects ambiguous target without mutating data', () => {
    const before = dataset()
    const { dataset: next, results } = applyBatch(before, [patch({
      target: { canonical_name: 'Twin' },
      operations: [{ op: 'add_alias', field: 'aliases', value: 'Gemini', payload: {} }],
    })])
    expect(results[0].status).toBe('rejected')
    expect(results[0].reason).toMatch(/ambiguous/)
    expect(next.entities.every((e) => !(e.aliases || []).includes('Gemini'))).toBe(true)
  })
})

describe('applyBatch — idempotency', () => {
  it('re-applying the same patch produces no changes', () => {
    const p = patch({ operations: [{ op: 'add_alias', field: 'aliases', value: 'Kava Kava', payload: {} }] })
    const first = applyBatch(dataset(), [p])
    expect(first.results[0].status).toBe('applied')
    const second = applyBatch(first.dataset, [p])
    expect(second.results[0].status).toBe('noop')
    expect(second.results[0].changes).toHaveLength(0)
    const kava = second.dataset.entities.find((e) => e.slug === 'kava')
    expect(kava.aliases.filter((a) => a === 'Kava Kava')).toHaveLength(1)
  })
})

describe('applyBatch — invalid / destructive operations', () => {
  it('rejects merge_candidates (never auto-applied)', () => {
    const { results } = applyBatch(dataset(), [patch({
      operations: [{ op: 'merge_candidates', payload: {} }],
    })])
    expect(results[0].status).toBe('rejected')
    expect(results[0].conflicts.some((c) => c.type === 'merge_requires_approval')).toBe(true)
  })
  it('blocks deprecate unless allowDestructive is set', () => {
    const blocked = applyBatch(dataset(), [patch({ operations: [{ op: 'deprecate', field: 'description', payload: {} }] })])
    expect(blocked.results[0].status).toBe('rejected')
    const allowed = applyBatch(dataset(), [patch({ operations: [{ op: 'deprecate', field: 'description', payload: {} }] })], { allowDestructive: true })
    expect(allowed.results[0].status).toBe('applied')
    expect(allowed.dataset.entities.find((e) => e.slug === 'kava').review_status).toBe('deprecated')
  })
})

describe('applyBatch — partial-failure prevention', () => {
  it('a rejected patch leaves NO trace, even its otherwise-valid operations', () => {
    const { dataset: next, results } = applyBatch(dataset(), [patch({
      operations: [
        { op: 'add_alias', field: 'aliases', value: 'ShouldNotStick', payload: {} },
        { op: 'merge_candidates', payload: {} }, // blocks the whole patch
      ],
    })])
    expect(results[0].status).toBe('rejected')
    const kava = next.entities.find((e) => e.slug === 'kava')
    expect(kava.aliases).not.toContain('ShouldNotStick')
  })
  it('valid patches still apply alongside a rejected one', () => {
    const { dataset: next, results } = applyBatch(dataset(), [
      patch({ patch_id: 'ok', target: { slug: 'kava', entity_type: 'herb' }, operations: [{ op: 'add_alias', field: 'aliases', value: 'Awa', payload: {} }] }),
      patch({ patch_id: 'bad', target: { canonical_name: 'Twin' }, operations: [{ op: 'add_alias', field: 'aliases', value: 'X', payload: {} }] }),
    ])
    const byId = Object.fromEntries(results.map((r) => [r.patch_id, r]))
    expect(byId.ok.status).toBe('applied')
    expect(byId.bad.status).toBe('rejected')
    expect(next.entities.find((e) => e.slug === 'kava').aliases).toContain('Awa')
  })
})

describe('applyBatch — create_entity', () => {
  it('creates a new entity when the target does not resolve', () => {
    const { dataset: next, results } = applyBatch(dataset(), [patch({
      target: { slug: 'new-herb', canonical_name: 'New Herb', entity_type: 'herb' },
      operations: [{ op: 'create_entity', payload: {} }, { op: 'update_field', field: 'data.effects', value: 'calming', payload: {} }],
    })])
    expect(results[0].status).toBe('applied')
    const created = next.entities.find((e) => e.slug === 'new-herb')
    expect(created).toBeTruthy()
    expect(created.data.effects).toBe('calming')
  })
})

describe('add_claim / add_safety_warning sourcing', () => {
  it('flags unsourced safety warnings as needs_review', () => {
    const { dataset: next, results } = applyBatch(dataset(), [patch({
      operations: [{ op: 'add_safety_warning', field: 'safety', value: 'hepatotoxicity', payload: {} }],
    })])
    expect(results[0].warnings.some((w) => /without a traceable source/.test(w))).toBe(true)
    const claim = next.claims.find((c) => c.predicate === 'has_safety_warning')
    expect(claim.review_status).toBe('needs_review')
  })
})

describe('snapshot + rollback (filesystem)', () => {
  it('snapshots and restores canonical files against a temp dir', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'canon-snap-'))
    const canonicalDir = path.join(tmp, 'canonical')
    const snapshotsDir = path.join(tmp, 'snapshots')
    fs.mkdirSync(path.join(canonicalDir, 'entities'), { recursive: true })
    const file = path.join(canonicalDir, 'entities', 'herb.jsonl')
    fs.writeFileSync(file, '{"id":"ent_herb_original"}\n')

    const snap = createSnapshot('t', { canonicalDir, snapshotsDir })
    expect(listSnapshots({ snapshotsDir })).toContain(snap.name)

    // Mutate then roll back.
    fs.writeFileSync(file, '{"id":"ent_herb_MUTATED"}\n')
    restoreSnapshot('latest', { canonicalDir, snapshotsDir })
    expect(fs.readFileSync(file, 'utf8')).toContain('ent_herb_original')

    fs.rmSync(tmp, { recursive: true, force: true })
  })
})
