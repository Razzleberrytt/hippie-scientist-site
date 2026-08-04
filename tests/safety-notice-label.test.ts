import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync('components/evidence/SafetyNotice.tsx', 'utf8')

describe('SafetyNotice', () => {
  it('uses a practical default eyebrow while allowing page-specific wording', () => {
    expect(source).toContain("eyebrow?: string")
    expect(source).toContain("eyebrow = 'Check before using'")
    expect(source).toContain('{eyebrow}')
    expect(source).not.toContain('Educational Safety Notice')
  })
})
