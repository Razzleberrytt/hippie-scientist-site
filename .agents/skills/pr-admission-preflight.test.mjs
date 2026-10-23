import test from 'node:test'
import assert from 'node:assert/strict'
import { assessAdmission, requestFromOpenPr, completeOpenInventory } from './pr-admission-preflight.mjs'

const pr = (number, options = {}) => {
  const record = { number, body: '', files: [], isDraft: false, ...options }
  return { ...record, changedFiles: options.changedFiles ?? record.files.length }
}
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

test('legacy research drafts may be created without adding another implementation lane', () => {
  const outcome = assessAdmission([pr(15)], { issue: 7001, files: ['draft.md'], reviewOnly: true })
  assert.equal(outcome.decision, 'READY')
})
test('approved incident may interrupt active work but cannot duplicate an existing issue', () => {
  assert.equal(assessAdmission([pr(15)], {
    issue: 7001, files: ['secure.ts'], securityApproved: true,
  }).decision, 'READY')
  assert.equal(assessAdmission([pr(15, { body: 'Refs #7001' })], {
    issue: 7001, files: ['secure.ts'], securityApproved: true,
  }).decision, 'BLOCK')
})
test('PR-triggered checks must derive issue, files and approved interruption from the submitted PR', () => {
  const request = requestFromOpenPr([pr(18, {
    isDraft: false, body: 'Fixes #7022', files: [{ path: 'src/repair.ts' }],
    labels: [{ name: 'security-interrupt-approved' }],
  })], 18)
  assert.deepEqual(request, {
    issue: 7022, files: ['src/repair.ts'], reviewOnly: false, securityApproved: true,
  })
  assert.match(requestFromOpenPr([pr(18, { body: 'No ticket' })], 18).error, /scoped issue/)
})

test('explicitly held non-draft review work does not indefinitely occupy the integration slot', () => {
  const held = pr(6951, {
    labels: [{ name: 'hold-merge' }],
    body: 'Refs #6670',
    files: [{ path: 'app/guides/b12/page.tsx' }],
  })
  assert.equal(assessAdmission([held], {
    issue: 7022, files: ['src/independent.ts'],
  }).decision, 'READY')
  const sameFile = assessAdmission([held], {
    issue: 7022, files: ['app/guides/b12/page.tsx'],
  })
  assert.equal(sameFile.decision, 'BLOCK')
  assert.deepEqual(sameFile.prs, [6951])
  assert.equal(assessAdmission([held], {
    issue: 6670, files: ['src/other.ts'],
  }).decision, 'BLOCK')
  assert.equal(assessAdmission([pr(50), held], {
    issue: 7022, files: ['src/independent.ts'],
  }).decision, 'BLOCK')
})

test('all explicit review holds are excluded; an unknown/missing hold label is not', () => {
  for (const name of ['hold-merge', 'do-not-merge', 'manual-merge']) {
    assert.equal(assessAdmission([pr(50, { labels: [{ name }] })], {
      issue: 7022, files: ['src/independent.ts'],
    }).decision, 'READY')
  }
  assert.equal(assessAdmission([pr(50, { labels: [{ name: 'needs-review' }] })], {
    issue: 7022, files: ['src/independent.ts'],
  }).decision, 'BLOCK')
})

test('truncated first-100 file view cannot grant READY or silently skip a reserved path', () => {
  const files = Array.from({ length: 100 }, (_, i) => ({ path: `src/file-${i}.ts` }))
  const partial = pr(50, { isDraft: true, changedFiles: 101, files })
  assert.equal(assessAdmission([partial], { issue: 7000, files: ['src/hidden-101.ts'] }).decision, 'BLOCK')
  let invoked = 0
  const complete = completeOpenInventory([partial], 'Razzleberrytt/hippie-scientist-site', (cmd, args) => {
    invoked += 1
    assert.equal(cmd, 'gh')
    assert.ok(args.includes('--paginate'))
    assert.ok(args.includes('--slurp'))
    assert.match(args.join(' '), /pulls\/50\/files/)
    return { status: 0, stdout: JSON.stringify([...files.map(f => f.path), 'src/hidden-101.ts']) }
  })
  assert.equal(invoked, 1)
  assert.equal(complete[0].files.length, 101)
  const found = assessAdmission(complete, { issue: 7000, files: ['src/hidden-101.ts'] })
  assert.deepEqual(found, { decision: 'BLOCK', reason: 'Open PR already owns the issue or planned files; review and reuse it', prs: [50] })
})

test('complete inventory skips pagination when GraphQL file count matches', () => {
  const complete = pr(14, { files: [{ path: 'src/small.ts' }] })
  const result = completeOpenInventory([complete], 'Razzleberrytt/hippie-scientist-site', () => {
    throw Error('should not fetch a complete list')
  })
  assert.equal(result[0].files.length, 1)
})

test('fail closed if CLI count missing, paginated data incomplete, duplicated or API unavailable', () => {
  const files = Array.from({ length: 100 }, (_, i) => ({ path: `src/${i}.ts` }))
  const partial = () => pr(50, { isDraft: true, changedFiles: 101, files: [...files] })
  assert.equal(assessAdmission([{ ...partial(), changedFiles: undefined }], {
    issue: 7000, files: ['src/private.ts'],
  }).decision, 'BLOCK')
  assert.throws(() => completeOpenInventory([partial()], 'a/b', () => ({
    status: 0, stdout: JSON.stringify(files.map(f => f.path)),
  })), /count mismatch/)
  assert.throws(() => completeOpenInventory([partial()], 'a/b', () => ({
    status: 0, stdout: JSON.stringify([...files.slice(0,99).map(f => f.path), 'src/1.ts', 'src/private.ts']),
  })), /count mismatch/)
  assert.throws(() => completeOpenInventory([partial()], 'a/b', () => ({
    status: 1, stderr: 'API temporarily unavailable',
  })), /Unable to obtain complete/)
})
