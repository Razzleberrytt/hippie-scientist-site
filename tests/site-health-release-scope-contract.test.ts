import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('release-impact workflow contract', () => {
  it('keeps Atomic and Site Health on one shared classifier', () => {
    const atomic = read('.github/workflows/atomic-upgrade-gate.yml')
    const siteHealth = read('.github/workflows/check.yml')

    expect(atomic).toContain('scripts/ci/release-impact-classifier.mjs')
    expect(siteHealth).toContain('scripts/ci/release-impact-classifier.mjs')
    expect(atomic).not.toContain("grep -Eq '^(scripts/")
  })

  it('always requires full release validation on integrated main', () => {
    const siteHealth = read('.github/workflows/check.yml')

    expect(siteHealth).toContain('if [ "$EVENT_NAME" != "pull_request" ]; then')
    expect(siteHealth).toContain("echo 'release_required=true' >> \"$GITHUB_OUTPUT\"")
  })

  it('skips only the expensive duplicate PR work when release impact is false', () => {
    const siteHealth = read('.github/workflows/check.yml')

    expect(siteHealth).toContain("if: steps.detect.outputs.release_required == 'true'")
    expect(siteHealth).toContain('run: npm ci')
    expect(siteHealth).toContain('run: npm run check:full')
    expect(siteHealth).toContain('Delegate non-structural PR validation to standard CI')
    expect(siteHealth).toContain('Generate Botanical Activity Atlas coverage report')
  })
})
