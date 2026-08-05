import test from 'node:test'
import assert from 'node:assert/strict'
import { applyIdentityResolutions } from '../apply-identity-resolutions.mjs'

function record(overrides) {
  return {
    id: 'compound:coenzyme-q10',
    entityType: 'compound',
    canonicalSlug: 'coenzyme-q10',
    canonicalName: 'Coenzyme Q10',
    scientificName: null,
    parentEntityId: null,
    aliases: [],
    status: 'duplicate-candidate',
    reviewFlags: ['identity-collision', 'collision:same-type-name-duplicate'],
    provenance: {
      workbook: 'fixture.xlsx',
      sheet: 'Entity_Master',
      sourceRow: 2,
      sourceSlug: 'coenzyme-q10',
      canonicalSlugField: 'slug',
      duplicateGroup: null,
      importerVersion: 'test',
    },
    ...overrides,
  }
}

test('merges an approved alias identity without deleting provenance', () => {
  const registry = [
    record({}),
    record({
      id: 'compound:coq10',
      canonicalSlug: 'coq10',
      aliases: ['ubiquinone'],
      provenance: {
        workbook: 'fixture.xlsx',
        sheet: 'Entity_Master',
        sourceRow: 3,
        sourceSlug: 'coq10',
        canonicalSlugField: 'slug',
        duplicateGroup: null,
        importerVersion: 'test',
      },
    }),
  ]
  const resolutions = {
    schemaVersion: '0.1.0',
    resolutions: [{
      collisionKey: 'coenzyme-q10',
      action: 'merge-alias',
      canonicalRecordId: 'compound:coenzyme-q10',
      retiredRecordIds: ['compound:coq10'],
      status: 'approved',
    }],
  }

  const result = applyIdentityResolutions(registry, resolutions)
  const canonical = result.registry.find((item) => item.id === 'compound:coenzyme-q10')
  const retired = result.registry.find((item) => item.id === 'compound:coq10')

  assert.equal(result.report.summary.appliedResolutions, 1)
  assert.equal(canonical.status, 'active')
  assert.ok(canonical.aliases.includes('coq10'))
  assert.ok(canonical.aliases.includes('ubiquinone'))
  assert.equal(retired.status, 'deprecated')
  assert.equal(retired.parentEntityId, canonical.id)
  assert.equal(retired.provenance.sourceRow, 3)
  assert.ok(retired.reviewFlags.includes('merged-into-canonical-identity'))
})

test('rejects cross-type alias merges', () => {
  const registry = [
    record({ id: 'compound:example' }),
    record({ id: 'herb:example', entityType: 'herb' }),
  ]
  const resolutions = {
    resolutions: [{
      collisionKey: 'example',
      action: 'merge-alias',
      canonicalRecordId: 'compound:example',
      retiredRecordIds: ['herb:example'],
      status: 'approved',
    }],
  }

  assert.throws(
    () => applyIdentityResolutions(registry, resolutions),
    /cannot cross entity types/,
  )
})
