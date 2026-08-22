import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('editorial evidence deep links', () => {
  it('keeps the ADHD stimulant comparison connected to auditable evidence after the August rewrite', () => {
    const article = readFileSync(
      join(process.cwd(), 'content/articles/lions-mane-vs-stimulants-adhd.md'),
      'utf8',
    )

    expect(article).toContain("updatedAt: '2026-08-22'")
    for (const pmid of ['40959699', '40276537', '42134365', '40203844', '30097390']) {
      expect(article).toContain(pmid)
    }
    expect(article).toContain('no randomized clinical trial testing Lion\'s Mane as a treatment for ADHD')
    expect(article).toContain('direct ADHD trials')
    expect(article).not.toContain('natural Adderall” framing fails scientifically\n\nCalling Lion\'s Mane a “natural Adderall” implies functional equivalence.\n\nCurrent evidence supports that')
  })
})
