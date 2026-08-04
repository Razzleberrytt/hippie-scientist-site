import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(
  path.join(process.cwd(), 'components/seo/HerbCompoundLinks.tsx'),
  'utf8',
)

describe('HerbCompoundLinks accessibility', () => {
  it('keeps compound profile links large enough to tap and visibly focusable', () => {
    expect(source).toContain('min-h-11')
    expect(source).toContain('focus-visible:ring-2')
    expect(source).toContain('focus-visible:ring-brand-700')
  })

  it('keeps a clear directional action cue', () => {
    expect(source).toContain('<span aria-hidden="true">→</span>')
  })
})
