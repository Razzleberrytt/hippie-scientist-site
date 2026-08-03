import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('evidence-first agent guidance', () => {
  it('keeps the decision-page standard discoverable from AGENTS.md', () => {
    const agents = read('AGENTS.md')

    expect(agents).toContain('## Evidence-first decision pages')
    expect(agents).toContain('docs/content-quality/evidence-first-decision-page-standard.md')
    expect(agents).toContain('Include null, negative, contradictory')
    expect(agents).toContain('Treat trial doses and timelines as study context')
    expect(agents).toContain('broad comparisons should not monetize only one ranked option')
  })

  it('preserves the core evidence, commercial, and canonical rules in the standard', () => {
    const standard = read('docs/content-quality/evidence-first-decision-page-standard.md')

    expect(standard).toContain('## Directness ladder')
    expect(standard).toContain('## Negative-evidence requirement')
    expect(standard).toContain('## Commercial-neutrality rules')
    expect(standard).toContain('## Canonical and cannibalization rule')
    expect(standard).toContain('A combination product cannot prove the contribution of one component')
    expect(standard).toContain('Affiliate disclosure does not repair biased evidence architecture')
  })
})
