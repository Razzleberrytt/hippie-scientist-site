import test from 'node:test'
import assert from 'node:assert/strict'
import { assessAdmission } from './pr-admission-preflight.mjs'

const pr = (number, options = {}) => ({
  number, body: '', files: [], isDraft: false, ...options,
})
test('new scoped change is ready only with a complete empty inventory', () => {
  assert.equal(assessAdmission([], { issue: 7000, files: ['src/a.ts'] }).decision, 'READY')
})
test('new PR is blocked while unrelated non-draft work is active', () => {
  const outcome = assessAdmission([pr(10)], { issue: 7000, files: ['src/a.ts'] })
  assert.equal(outcome.decision, 'BLOCK')
  assert.deepEqual(outcome.prs, [10])
})
test('draft work with same path is reserved, not discarded', () => {
  const outcome = assessAdmission([pr(11, { isDraft: true, files: [{ path: 'src/a.ts' }] })],
    { issue: 7000, files: ['src/a.ts'] })
  assert.equal(outcome.decision, 'BLOCK')
  assert.deepEqual(outcome.prs, [11])
})
test('same scoped issue may not spawn another PR', () => {
  const outcome = assessAdmission([pr(12, { isDraft: true, body: 'Closes #7000' })],
    { issue: 7000, files: ['src/new.ts'] })
  assert.equal(outcome.decision, 'BLOCK')
  assert.deepEqual(outcome.prs, [12])
})
test('explicit continuation reuses an existing PR even when backlog is nonempty', () => {
  const outcome = assessAdmission([pr(12), pr(13)], { existing: 12 })
  assert.equal(outcome.decision, 'REUSE')
  assert.deepEqual(outcome.prs, [12])
})
test('missing existing PR refuses to create a substitute', () => {
  assert.equal(assessAdmission([pr(12)], { existing: 99 }).decision, 'BLOCK')
})
test('GitHub inventory with unknown files/draft state fails closed', () => {
  assert.equal(assessAdmission([{ number: 9, body: '' }], { issue: 7000, files: ['a'] }).decision, 'BLOCK')
})
test('missing issue or file scope cannot grant new admission', () => {
  assert.equal(assessAdmission([], { files: ['a'] }).decision, 'BLOCK')
  assert.equal(assessAdmission([], { issue: 7000 }).decision, 'BLOCK')
})
