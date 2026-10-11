import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const read = file => fs.readFileSync(path.join(root, file), 'utf8')

describe('PR paperwork is advisory, measured safety gates remain authoritative', () => {
  it('keeps the stable Atomic workflow check without mandatory body sections or issue links', () => {
    const workflow = read('.github/workflows/atomic-upgrade-gate.yml')
    const template = read('.github/pull_request_template.md')
    expect(workflow).toContain('name: Atomic upgrade gate')
    expect(workflow).toContain('name: Atomic issue and measurement contract')
    expect(workflow).toContain('PR description and linked issue are optional')
    expect(workflow).not.toContain('link one atomic GitHub issue')
    expect(workflow).not.toContain('Validate PR contract')
    expect(template).not.toMatch(/^Closes #/m)
  })

  it('does not fetch or parse PR body as a precondition for quality checks', () => {
    expect(read('.github/workflows/build-quality-regression.yml')).not.toContain('Resolve PR body')
    expect(read('.github/workflows/production-content-lint.yml')).not.toContain('Resolve recovery PR body')
    expect(read('.github/workflows/build-quality-regression.yml')).toContain('Compare build-quality signals')
    expect(read('.github/workflows/production-content-lint.yml')).toContain('Compare against latest main production snapshot')
  })

  it('preserves objective regression failures without requiring an explanatory paragraph', () => {
    const build = read('scripts/ci/compare-build-quality.mjs')
    const production = read('scripts/ci/compare-production-quality-snapshot.mjs')
    expect(build).toContain('criticalRegressions')
    expect(build).not.toContain('Major automated changes require an explanation before merge.')
    expect(production).toContain('blockingRegressions')
    expect(production).not.toContain('REQUIRE_QUALITY_CHANGE_EXPLANATION')
    expect(production).not.toContain('Missing `Quality change explanation:`')
  })
})
