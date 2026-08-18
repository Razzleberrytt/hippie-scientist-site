import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync('components/ui/RelatedDiscoveryGroups.tsx', 'utf8')

describe('RelatedDiscoveryGroups accessibility contract', () => {
  it('keeps discovery links large, focusable, and directional', () => {
    expect(source).toContain('min-h-11')
    expect(source).toContain('focus-visible:ring-2')
    // The ring colour moved to a design token (--hs-gold). What the contract
    // needs is that the ring has a colour and stands off the element, not which
    // colour the system currently uses.
    expect(source).toMatch(/focus-visible:ring-(?:\[color:var\(--[a-z-]+\)\]|[a-z]+-\d{3})/)
    expect(source).toContain('focus-visible:ring-offset-2')
    // The arrow is decorative and must stay hidden from assistive tech; attribute
    // order on the span is not part of that contract.
    expect(source).toMatch(/<span[^>]*aria-hidden="true"[^>]*>→<\/span>/)
  })
})
