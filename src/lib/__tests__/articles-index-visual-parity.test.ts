import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(path.join(process.cwd(), 'app', 'articles', 'page.tsx'), 'utf8')

describe('articles index visual parity', () => {
  it('uses the canonical hero and card surfaces', () => {
    expect(source).toContain('hero-shell')
    expect(source).toContain('heading-premium')
    expect(source).toContain('text-reading')
    expect(source).toContain('card-premium')
  })

  it('does not reintroduce the old hard-coded white-card treatment', () => {
    expect(source).not.toContain('bg-white/90')
    expect(source).not.toContain('bg-white/80')
    expect(source).not.toContain('shadow-sm')
    expect(source).not.toContain('border-brand-900/10')
  })

  it('keeps article cards keyboard-visible and action-oriented', () => {
    expect(source).toContain('focus-visible:ring-2')
    expect(source).toContain('Read article')
  })
})
