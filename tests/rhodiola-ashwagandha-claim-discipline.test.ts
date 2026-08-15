import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('rhodiola vs ashwagandha combination claims', () => {
  it('does not present the pair as a common well-tolerated stack without combination evidence', () => {
    const page = read('app/guides/compare/rhodiola-vs-ashwagandha/page.tsx')

    expect(page).not.toMatch(
      /\bcommon(?:ly)?\b[^.\n]{0,60}\bwell[- ]tolerated\b[^.\n]{0,30}\b(?:pair(?:ing)?|stack|combination)\b/i,
    )
    expect(page).toContain(
      'the cited references do not establish the safety or benefit of the pair as a stack',
    )
  })

  it('keeps the guide risk scanner aware of unsupported combination reassurance', () => {
    const validator = read('scripts/ci/validate-claim-discipline.mjs')

    expect(validator).toContain("name: 'unsupported combination reassurance'")
    expect(validator).toContain('well[- ]tolerated')
  })
})
