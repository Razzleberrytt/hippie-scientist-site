import { describe, it, expect } from 'vitest'
import {
  entityId,
  claimId,
  edgeId,
  sourceId,
  contentHash,
  stableStringify,
  normalizeSeed,
} from '../ids.mjs'
import {
  entitySchema,
  claimSchema,
  edgeSchema,
  sourceSchema,
  normalizedPatchSchema,
  validateAll,
} from '../schema.mjs'
import { serializeJsonl } from '../jsonl.mjs'
import { resolveFieldName, normalizeKey } from '../field-aliases.mjs'

const NOW = '2026-01-01T00:00:00.000Z'

function baseEntity(overrides = {}) {
  const id = entityId('herb', 'ashwagandha')
  return {
    id,
    entity_type: 'herb',
    canonical_name: 'Ashwagandha',
    slug: 'ashwagandha',
    aliases: ['Withania somnifera'],
    description: 'An adaptogen.',
    review_status: 'approved',
    created_at: NOW,
    updated_at: NOW,
    provenance: [{ source: 'test' }],
    data: { latin_name: 'Withania somnifera' },
    legacy: {},
    ...overrides,
  }
}

describe('deterministic ids', () => {
  it('produces stable entity ids for the same seed', () => {
    expect(entityId('herb', 'Ashwagandha')).toBe(entityId('herb', ' ashwagandha '))
    expect(entityId('herb', 'x')).toMatch(/^ent_herb_[0-9a-f]{12}$/)
  })

  it('distinguishes types sharing a slug', () => {
    expect(entityId('herb', 'kava')).not.toBe(entityId('compound', 'kava'))
  })

  it('claim/edge/source ids are stable and prefixed', () => {
    const c = { subject_id: 'ent_herb_a', predicate: 'contains', object_id: 'ent_compound_b', qualifiers: {} }
    expect(claimId(c)).toBe(claimId({ ...c }))
    expect(claimId(c)).toMatch(/^clm_[0-9a-f]{12}$/)
    expect(edgeId({ from_id: 'a', rel_type: 'contains_compound', to_id: 'b' })).toMatch(/^edg_[0-9a-f]{12}$/)
    expect(sourceId({ pmid: '12345' })).toBe(sourceId({ pmid: '12345', doi: 'ignored-because-pmid-wins' }))
  })

  it('content hash is order-independent via stableStringify', () => {
    expect(contentHash({ a: 1, b: 2 })).toBe(contentHash({ b: 2, a: 1 }))
    expect(stableStringify({ b: 1, a: 2 })).toBe('{"a":2,"b":1}')
    expect(normalizeSeed('  Foo  Bar ')).toBe('foo bar')
  })
})

describe('entity schema', () => {
  it('accepts a valid entity', () => {
    expect(entitySchema.safeParse(baseEntity()).success).toBe(true)
  })

  it('rejects an unknown entity_type', () => {
    expect(entitySchema.safeParse(baseEntity({ entity_type: 'nonsense' })).success).toBe(false)
  })

  it('rejects a malformed id', () => {
    expect(entitySchema.safeParse(baseEntity({ id: 'bad-id' })).success).toBe(false)
  })

  it('rejects unknown top-level keys (strict envelope)', () => {
    expect(entitySchema.safeParse(baseEntity({ surprise: true })).success).toBe(false)
  })
})

describe('claim schema', () => {
  const base = {
    id: claimId({ subject_id: 'ent_herb_a', predicate: 'contains', object_id: 'ent_compound_b', qualifiers: {} }),
    subject_id: 'ent_herb_a',
    predicate: 'contains',
    object_id: 'ent_compound_b',
    qualifiers: {},
    source_ids: [],
    evidence_level: 'preclinical',
    confidence: 0.7,
    review_status: 'pending',
    notes: '',
    created_at: NOW,
    updated_at: NOW,
    provenance: [],
    legacy: {},
  }

  it('accepts a claim with object_id', () => {
    expect(claimSchema.safeParse(base).success).toBe(true)
  })

  it('requires object_id or object_literal', () => {
    const { object_id, ...withoutObject } = base
    expect(claimSchema.safeParse(withoutObject).success).toBe(false)
    expect(claimSchema.safeParse({ ...withoutObject, object_literal: '500mg' }).success).toBe(true)
  })

  it('rejects confidence out of range', () => {
    expect(claimSchema.safeParse({ ...base, confidence: 2 }).success).toBe(false)
  })
})

describe('edge schema', () => {
  const base = {
    id: edgeId({ from_id: 'ent_herb_a', rel_type: 'contains_compound', to_id: 'ent_compound_b' }),
    from_id: 'ent_herb_a',
    rel_type: 'contains_compound',
    to_id: 'ent_compound_b',
    direction: 'directed',
    source_ids: [],
    evidence_level: 'none',
    origin: 'explicit',
    review_status: 'approved',
    provenance: [],
    created_at: NOW,
    updated_at: NOW,
  }

  it('accepts an explicit edge', () => {
    expect(edgeSchema.safeParse(base).success).toBe(true)
  })

  it('requires an explanation for suggested edges', () => {
    expect(edgeSchema.safeParse({ ...base, origin: 'suggested' }).success).toBe(false)
    expect(edgeSchema.safeParse({ ...base, origin: 'suggested', explanation: 'shares 3 compounds' }).success).toBe(true)
  })
})

describe('source + patch schema', () => {
  it('accepts a valid source', () => {
    const s = {
      id: sourceId({ pmid: '999' }),
      pmid: '999',
      title: 'A study',
      author_or_label: 'Smith',
      journal: 'J',
      used_for: '',
      citation: '',
      review_status: 'approved',
      created_at: NOW,
      updated_at: NOW,
      provenance: [],
      legacy: {},
    }
    expect(sourceSchema.safeParse(s).success).toBe(true)
  })

  it('accepts a normalized patch and rejects one with no operations', () => {
    const patch = {
      patch_id: 'p1',
      patch_version: '1',
      created_at: NOW,
      target: { slug: 'ashwagandha', entity_type: 'herb' },
      operations: [{ op: 'update_field', field: 'description', value: 'x', payload: {} }],
      sources: [],
      notes: '',
      confidence: 0.5,
      requires_review: true,
      original_filename: 'x.md',
      original_hash: 'abc',
    }
    expect(normalizedPatchSchema.safeParse(patch).success).toBe(true)
    expect(normalizedPatchSchema.safeParse({ ...patch, operations: [] }).success).toBe(false)
  })
})

describe('validateAll + serializeJsonl', () => {
  it('aggregates errors instead of throwing', () => {
    const { valid, errors } = validateAll(entitySchema, [baseEntity(), baseEntity({ id: 'bad' })], 'entity')
    expect(valid.length).toBe(1)
    expect(errors.length).toBe(1)
  })

  it('serializes deterministically sorted by id with sorted keys', () => {
    const a = { id: 'b', z: 1, a: 2 }
    const b = { id: 'a', a: 1 }
    const text = serializeJsonl([a, b])
    expect(text).toBe('{"a":1,"id":"a"}\n{"a":2,"id":"b","z":1}\n')
    expect(serializeJsonl([])).toBe('')
  })
})

describe('field aliases', () => {
  it('resolves known variants case/space/underscore-insensitively', () => {
    expect(resolveFieldName('Common Name')).toBe('canonical_name')
    expect(resolveFieldName('herb_name')).toBe('canonical_name')
    expect(resolveFieldName('BENEFITS')).toBe('effects')
    expect(resolveFieldName('mechanism-of-action')).toBe('mechanisms')
    expect(resolveFieldName('references')).toBe('sources')
  })

  it('returns null for unknown fields', () => {
    expect(resolveFieldName('totally_unknown_field_xyz')).toBeNull()
    expect(normalizeKey('Side-Effects ')).toBe('side_effects')
  })
})
