import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/guides/anxiety/page.tsx')

function source() {
  return fs.readFileSync(PAGE, 'utf8')
}

describe('anxiety hub evidence framing', () => {
  it('uses current systematic-review anchors for L-theanine and ashwagandha', () => {
    const page = source()

    expect(page).toContain('42410082')
    expect(page).toContain('39348746')
    expect(page).toContain('40746175')
    expect(page).toContain('31 randomized trials')
  })

  it('does not market L-theanine as a reliable fast anxiolytic', () => {
    const page = source()

    expect(page).not.toMatch(/fast, non-sedating calm/i)
    expect(page).not.toMatch(/fast anxiolytic like L-theanine/i)
    expect(page).toContain('anxiety effects were inconsistent')
    expect(page).toContain('acute stress reduction was modest')
  })

  it('keeps cortisol findings separate from perceived stress', () => {
    const page = source()

    expect(page).toContain('cortisol reduction without a clear perceived-stress benefit')
    expect(page).toContain('keeps biomarker changes separate from how people actually feel')
  })
})
