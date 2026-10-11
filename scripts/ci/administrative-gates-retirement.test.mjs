import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const root = process.cwd()
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8')

test('PR text, issue numbers and metrics are never required for merge', () => {
  const atomic = read('.github/workflows/atomic-upgrade-gate.yml')
  const qualityWorkflow = read('.github/workflows/build-quality-regression.yml')
  const qualityScript = read('scripts/ci/compare-build-quality.mjs')

  assert.doesNotMatch(atomic, /Validate PR contract|Atomic issue and measurement contract|PR_BODY|Closes\/Fixes\/Resolves/)
  assert.doesNotMatch(qualityWorkflow, /Resolve PR body|Extract major automated change explanation|QUALITY_CHANGE_REASON|steps\.explanation/)
  assert.doesNotMatch(qualityScript, /Major automated changes require an explanation before merge|MISSING — merge gate should fail/)
  assert.match(atomic, /classify-release-impact\.mjs/)
  assert.match(qualityWorkflow, /compare-build-quality\.mjs/)
  assert.match(qualityWorkflow, /compare-internal-link-quality\.mjs/)
})

test('issue and PR templates have no mandatory user-completion fields', () => {
  const issue = read('.github/ISSUE_TEMPLATE/roi-upgrade.yml')
  const pr = read('.github/pull_request_template.md')
  assert.doesNotMatch(issue, /required:\s*true/)
  assert.doesNotMatch(pr, /Closes #|Before → after metrics|Generator\/source-of-truth decision/)
})
