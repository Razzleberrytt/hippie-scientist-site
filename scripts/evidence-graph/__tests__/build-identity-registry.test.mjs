import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildIdentityRecord,
  buildIdentityValidationReport,
  classifyIdentityCollision,
  collectEntityMasterRecords,
  normalizeEntityMasterType,
  resolveIdentitySources,
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
    importerVersion: '0.3.0',
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

test('reports and marks cross-record canonical and alias collisions', () => {
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
  const aliasCollision = report.collisions.find((collision) => collision.type === 'alias-collision')

  assert.ok(aliasCollision)
  assert.equal(aliasCollision.classification, 'cross-type-alias-conflict')
  assert.equal(aliasCollision.severity, 'medium')
  assert.equal(report.summary.totalCandidates, 2)
  assert.equal(report.summary.duplicateCandidateRecords, 2)
  assert.ok(records.every((record) => record.status === 'duplicate-candidate'))
  assert.ok(records.every((record) => record.reviewFlags.includes('identity-collision')))
})

test('classifies same-type name collisions as likely duplicates', () => {
  const classification = classifyIdentityCollision({
    type: 'canonical-name-collision',
    entities: [
      { entityType: 'compound' },
      { entityType: 'compound' },
    ],
  })

  assert.equal(classification.classification, 'same-type-name-duplicate')
  assert.equal(classification.severity, 'high')
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

test('normalizes only supported Entity_Master identity types', () => {
  assert.equal(normalizeEntityMasterType(' Herb '), 'herb')
  assert.equal(normalizeEntityMasterType('COMPOUND'), 'compound')
  assert.equal(normalizeEntityMasterType('study'), null)
  assert.equal(normalizeEntityMasterType(''), null)
})

test('imports herb and compound identities from Entity_Master', () => {
  const records = collectEntityMasterRecords({
    rows: [
      {
        entity_type: 'herb',
        slug: 'ashwagandha',
        name: 'Ashwagandha',
        latin_name: 'Withania somnifera',
      },
      {
        entity_type: 'compound',
        slug: 'withaferin-a',
        name: 'Withaferin A',
      },
      {
        entity_type: 'study',
        slug: 'ignored-study',
        name: 'Ignored Study',
      },
    ],
    sheetName: 'Entity_Master',
    workbookPath,
  })

  assert.deepEqual(records.map((record) => record.id), [
    'herb:ashwagandha',
    'compound:withaferin-a',
  ])
  assert.ok(records.every((record) => record.provenance.sheet === 'Entity_Master'))
})

test('prefers legacy split sheets but supports canonical Entity_Master fallback', () => {
  const legacyWorkbook = {
    SheetNames: ['Herb Master V3', 'Compound Master V3', 'Entity_Master'],
    Sheets: {},
  }
  assert.deepEqual(resolveIdentitySources(legacyWorkbook), {
    herbSheetName: 'Herb Master V3',
    compoundSheetName: 'Compound Master V3',
    entityMasterSheetName: 'Entity_Master',
  })

  const canonicalWorkbook = {
    SheetNames: ['README', 'Entity_Master', 'Evidence_Register'],
    Sheets: {},
  }
  assert.deepEqual(resolveIdentitySources(canonicalWorkbook), {
    herbSheetName: null,
    compoundSheetName: null,
    entityMasterSheetName: 'Entity_Master',
  })
})
