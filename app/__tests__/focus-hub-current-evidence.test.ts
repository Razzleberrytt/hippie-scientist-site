import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/guides/focus/page.tsx')

function source() {
  return fs.readFileSync(PAGE, 'utf8')
}

describe('focus hub evidence framing', () => {
  it('anchors acute attention claims to current systematic reviews', () => {
    const page = source()

    expect(page).toContain('40335666')
    expect(page).toContain('40314930')
    expect(page).toContain('42410082')
    expect(page).toContain('31 double-blind, placebo-controlled caffeine trials')
    expect(page).toContain('1,455 rested, healthy adults')
  })

  it('does not present caffeine plus L-theanine as a guaranteed smoother or best focus formula', () => {
    const page = source()

    expect(page).not.toMatch(/L-theanine smooths caffeine/i)
    expect(page).not.toMatch(/most reliable everyday focus pairing/i)
    expect(page).not.toMatch(/guaranteed [“"]?smooth focus/i)
    expect(page).toContain('task-specific')
    expect(page).toContain('uncertainty')
  })

  it('keeps ADHD routing explicitly separate from supplement substitution', () => {
    const page = source()

    expect(page).toContain('supplements are not substitutes for established ADHD treatment')
    expect(page).toContain('do not treat supplements as replacements for established ADHD care')
  })
})
