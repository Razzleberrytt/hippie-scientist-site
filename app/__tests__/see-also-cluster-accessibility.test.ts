import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(join(process.cwd(), 'components/SeeAlsoCluster.tsx'), 'utf8')

describe('SeeAlsoCluster accessibility contract', () => {
  it('keeps relationship links comfortably tappable via the shared chip primitive', () => {
    // Tap sizing now lives in .hs-chip (styles/editorial-primitives.css) and is
    // pinned by components/ui/__tests__/editorial-primitives.test.ts.
    expect(source).toContain('hs-chip')
    expect(source).toContain('hs-chips')
    expect(source).not.toContain('text-[10px]')
  })

  it('wraps cluster links instead of pushing them offscreen', () => {
    expect(source).not.toContain('overflow-x-auto')
    expect(source).not.toContain('whitespace-nowrap')
  })

  it('provides visible keyboard focus treatment', () => {
    expect(source).toContain('focus-visible:ring-2')
    expect(source).toContain('focus-visible:ring-[color:var(--hs-gold)]')
  })
})
