import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(path.join(process.cwd(), 'components', 'search', 'search-ui.tsx'), 'utf8')

describe('shared search control parity', () => {
  it('uses canonical brass tokens for generic active filter state', () => {
    expect(source).toContain('border-[color:var(--hs-gold)] bg-[color:var(--hs-gold-soft)] text-[color:var(--hs-gold-ink)]')
    expect(source).not.toContain('bg-[linear-gradient(140deg,#4b4558_0%,#332f3d_100%)]')
    expect(source).not.toContain('bg-[linear-gradient(140deg,#665c8c_0%,#40384f_100%)]')
  })

  it('keeps content-type, evidence, and safety badges semantically colored', () => {
    expect(source).toContain("Herb: 'border-emerald")
    expect(source).toContain("Compound: 'border-blue")
    expect(source).toContain("Strong: 'border-emerald")
    expect(source).toContain("Limited: 'border-amber")
    expect(source).toContain("'Notable considerations': 'border-rose")
  })

  it('keeps generic result selection on the canonical accent rather than a content tone', () => {
    expect(source).toContain('var(--hs-gold)_30%')
    expect(source).toContain('var(--hs-gold)_7%')
  })
})
