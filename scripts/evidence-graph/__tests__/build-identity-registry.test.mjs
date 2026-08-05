import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildIdentityRecord,
  buildIdentityValidationReport,
} from '../build-identity-registry.mjs'

const workbookPath = '/repo/data-sources/herb_monograph_master.xlsx'

function makeRecord({
  row,
  rowNumber = 2,
  sheetName = 'Herb Master V3',
  entityType = 'herb',
}) {
  return buildIdentityRecord({
    row,
    rowNumber,
    sheetName,
    entityType,
    workbookPath,
  })
}

test('builds a stable herb identity with workbook provenance', () => {
  const record = makeRecord({
    row: {
      slug: 'ashwagandha',
      name: 'Ashwagandha',
      latin_name: 'Withania somnifera',
      common_names: 'Indian ginseng; Winter cherry',
    },
  })

  assert.equal(record.id, 'herb:ashwagandha')
  assert.equal(record.status, 'active')
  assert.deepEqual(record.aliases, [
    'Indian ginseng',
    'Winter cherry',
    'Withania somnifera',
  ])
  assert.deepEqual(record.provenance, {
    workbook: 'herb_monograph_master.xlsx',
    sheet: 'Herb Master V3',
    sourceRow: 2,
    sourceSlug: 'ashwagandha',
    canonicalSlugField: 'slug',
    duplicateGroup: null,
    importerVersion: '0.1.0',
  })
})

test('prefers canonical_slug_v2 and flags form-sensitive identities', () => {
  const record = makeRecord({
    entityType: 'compound',
    sheetName: 'Compound Master V3',
    row: {
      slug: 'mag-glycinate-old',
      canonical_slug_v2: 'magnesium-glycinate',
      name: 'Magnesium glycinate',
    },
  })

  assert.equal(record.id, 'compound:magnesium-glycinate')
  assert.equal(record.provenance.canonicalSlugField, 'canonical_slug_v2')
  assert.equal(record.status, 'needs-review')
  assert.deepEqual(record.reviewFlags, ['form-sensitive-identity'])
})

test('reports cross-record canonical and alias collisions', () => {
  const records = [
    makeRecord({
      row: {
        slug: 'theanine',
        name: 'L-Theanine',
        aliases: 'Theanine',
      },
    }),
    makeRecord({
      entityType: 'compound',
      sheetName: 'Compound Master V3',
      rowNumber: 3,
      row: {
        slug: 'l-theanine',
        name: 'Theanine',
        aliases: 'L-Theanine',
      },
    }),
  ]

  const report = buildIdentityValidationReport(records)
  const collisionTypes = report.collisions.map((collision) => collision.type)

  assert.ok(collisionTypes.includes('alias-collision'))
  assert.equal(report.summary.totalCandidates, 2)
  assert.ok(report.summary.collisionCount >= 1)
})

test('keeps incomplete candidates in the report but marks them invalid', () => {
  const record = makeRecord({
    row: {
      name: 'Unnamed workbook candidate',
    },
  })
  const report = buildIdentityValidationReport([record])

  assert.equal(record.id, null)
  assert.equal(report.summary.invalidRecords, 1)
  assert.equal(report.summary.missingIdRecords, 1)
})
