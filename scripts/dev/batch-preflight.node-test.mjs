import { test } from 'node:test'
import assert from 'node:assert/strict'
import { planBatch, runBatch } from './batch-preflight.mjs'

test('keeps mixed shared UI, dynamic profile and component tests scoped during development only', () => {
  const plan = planBatch([
    'components/ui/EvidenceScopeGuide.tsx',
    'app/herbs/[slug]/page.tsx',
    'components/ui/__tests__/EvidenceScopeGuide.test.tsx',
    'app/__tests__/evidence-scope-integration.test.ts',
  ], { mode: 'checkpoint', head: 'a'.repeat(40) })
  assert.equal(plan.classifier.uiOnly, false) // Production remains full validation.
  assert.equal(plan.releaseAuthorized, false)
  assert.ok(plan.commands.some(x => x.name === 'Affected Vitest'))
  assert.ok(plan.commands.some(x => x.name === 'Explicit changed tests'))
  assert.ok(plan.commands.some(x => x.name === 'Explicit accessibility gate'))
  assert.ok(plan.commands.some(x => x.name === 'validate:evidence-grades'))
  assert.ok(plan.commands.some(x => x.name === 'validate:claim-discipline'))
  assert.ok(plan.commands.some(x => x.name === 'Typecheck'))
  assert.ok(!plan.commands.some(x => x.argv.join(' ').includes('npm run test ')))
})
test('fast editing avoids exhaustive validation while covering directly changed test', () => {
  const plan = planBatch(['components/ui/Badge.tsx','components/ui/__tests__/Badge.test.tsx'], { mode: 'edit' })
  assert.ok(plan.commands.some(x => x.name === 'Affected Vitest'))
  assert.ok(plan.commands.some(x => x.name === 'Explicit changed tests'))
  assert.ok(!plan.commands.some(x => x.name === 'Typecheck'))
  assert.ok(!plan.commands.some(x => x.name === 'Explicit accessibility gate'))
})
test('security-sensitive checkpoint cannot drop security audit', () => {
  const plan = planBatch(['scripts/ci/autonomous-merge-controller.mjs'], { mode: 'checkpoint' })
  assert.ok(plan.risk.includes('security'))
  assert.ok(plan.commands.some(x => x.name === 'Dependency/security audit'))
  assert.ok(plan.commands.some(x => x.name === 'Control/impact regression'))
  assert.equal(plan.releaseAuthorized, false)
})
test('docs-only edits have a focused contract and never claim release', () => {
  const plan = planBatch(['docs/README.md','docs/CURRENT_STATE.md'], { mode: 'checkpoint' })
  assert.equal(plan.classifier.docsOnly, true)
  assert.equal(plan.releaseAuthorized, false)
  assert.ok(plan.commands.some(x => x.name === 'Documentation link contract'))
  assert.equal(plan.commands.length, 1)
})
test('batch plan deduplicates 25 compatible source edits into single test launch', () => {
  const files = Array.from({ length: 25 }, (_, i) => 'components/ui/Part' + i + '.tsx')
  files.push(files[0])
  const plan = planBatch(files, { mode: 'edit' })
  assert.equal(plan.files.length, 25)
  assert.equal(plan.commands.filter(x => x.name === 'Affected Vitest').length, 1)
  assert.equal(plan.releaseAuthorized, false)
})
test('release mode runs no substitute for protected full CI and deployment', () => {
  const plan = planBatch(['app/herbs/[slug]/page.tsx'], { mode: 'release' })
  assert.equal(plan.commands.length, 0)
  assert.match(plan.summary, /open one scoped PR/)
  assert.equal(plan.releaseAuthorized, false)
})
test('a failed focused command stops iteration immediately and reports failure', () => {
  const plan = planBatch(['components/ui/Card.tsx'], { mode: 'checkpoint' })
  let count = 0
  const result = runBatch(plan, { runner: () => { count++; return { status: count === 2 ? 1 : 0 } } })
  assert.equal(count, 2)
  assert.equal(result.success, false)
  assert.equal(result.releaseAuthorized, false)
})
test('no changed files produces no tests and no release authorization', () => {
  const plan = planBatch([], { mode: 'checkpoint' })
  assert.equal(plan.commands.length, 0)
  assert.equal(plan.releaseAuthorized, false)
})
