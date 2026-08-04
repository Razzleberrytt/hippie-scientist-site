import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync('components/ui/RelatedDiscoveryGroups.tsx', 'utf8')

describe('RelatedDiscoveryGroups accessibility contract', () => {
  it('keeps discovery links large, focusable, and directional', () => {
    expect(source).toContain('min-h-11')
    expect(source).toContain('focus-visible:ring-2')
    expect(source).toContain('focus-visible:ring-brand-600')
    expect(source).toContain('aria-hidden="true">→</span>')
  })
})
