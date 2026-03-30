import assert from 'node:assert/strict'
import { cleanText, splitClean } from '@/lib/sanitize'
import { hasInvalidEntityName, sanitizeCompoundRecord, sanitizeHerbRecord } from '@/utils/sanitizeData'
import { isRenderableHerbRow } from '@/lib/herb-data'
import { isRenderableCompound } from '@/lib/compound-data'

async function run() {
  assert.equal(cleanText('[object Object]'), '')
  assert.equal(cleanText('12345'), '')
  assert.equal(cleanText('No direct mechanism data. Contextual inference: nan.'), '')
  assert.equal(cleanText('mechanism unknown'), '')
  assert.equal(cleanText('insufficient data'), '')

  assert.deepEqual(splitClean(['nan', '[object Object]', 'Calming', '123']), ['Calming'])
  assert.deepEqual(splitClean('nan; [object Object]; Focus'), ['Focus'])

  const badHerbNames = ['[object Object]', '123456', '', 'nan']
  badHerbNames.forEach(name => {
    const { data, issue } = sanitizeHerbRecord({ id: 'h-1', name })
    assert.equal(hasInvalidEntityName(data), true)
    assert.ok(issue?.issues.includes('Invalid display name'))
  })

  const badCompound = sanitizeCompoundRecord({
    id: 'c-1',
    name: '9999',
    herbs: ['Mint'],
    mechanism: 'mechanism unknown',
  })
  assert.equal(hasInvalidEntityName(badCompound.data), true)
  assert.equal(cleanText(badCompound.data.mechanism), '')

  const goodCompound = sanitizeCompoundRecord({
    id: 'c-2',
    name: 'Quercetin',
    herbs: ['Mint'],
    mechanism: 'Modulates inflammatory signaling pathways',
  })
  assert.equal(hasInvalidEntityName(goodCompound.data), false)
  assert.ok(!(goodCompound.issue?.issues ?? []).includes('Invalid display name'))

  assert.equal(isRenderableHerbRow({ id: 'h-good', name: 'Lavender' }), true)
  assert.equal(isRenderableHerbRow({ id: 'h-bad', name: '[object Object]' }), false)
  assert.equal(isRenderableHerbRow({ id: 'h-bad-2', name: '12345' }), false)
  assert.equal(isRenderableHerbRow({ id: 'h-bad-3', name: '' }), false)

  assert.equal(isRenderableCompound({ id: 'c-good', name: 'Linalool', herbs: ['Lavender'] }), true)
  assert.equal(isRenderableCompound({ id: 'c-bad', name: '[object Object]', herbs: ['Lavender'] }), false)
  assert.equal(isRenderableCompound({ id: 'c-bad-2', name: '9999', herbs: ['Lavender'] }), false)
  assert.equal(isRenderableCompound({ id: 'c-bad-3', name: '', herbs: ['Lavender'] }), false)
}

run()
