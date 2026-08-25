import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(path.join(process.cwd(), 'app', 'safety-checker', 'page.tsx'), 'utf8')

describe('safety checker editorial parity', () => {
  it('uses canonical neutral surfaces for the main information hierarchy', () => {
    expect(source).toContain('hero-shell')
    expect(source).toContain('card-premium')
    expect(source).toContain('section-frame')
    expect(source).toContain('heading-premium')
    expect(source).toContain('text-reading')
  })

  it('does not return to the old hard-coded white-card shell', () => {
    expect(source).not.toContain('bg-white/90')
    expect(source).not.toContain('bg-white/85')
    expect(source).not.toContain('shadow-sm')
  })

  it('preserves semantic distinction for useful, caution, and limitation content', () => {
    expect(source).toContain('text-emerald-800 dark:text-emerald-300')
    expect(source).toContain('text-rose-800 dark:text-rose-300')
    expect(source).toContain('bg-rose-50/50')
    expect(source).toContain('Educational screening limitation')
  })

  it('keeps the key no-clearance safety language visible', () => {
    expect(source).toContain('cannot determine whether a combination is safe for you')
    expect(source).toContain('No flag does not mean a stack is proven safe')
    expect(source).toContain('cannot verify that an interaction will occur')
  })
})
