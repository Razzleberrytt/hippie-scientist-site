import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(path.join(process.cwd(), 'app', 'search', 'page.tsx'), 'utf8')

describe('search browse-directory editorial parity', () => {
  it('keeps the existing canonical search hero and uses a canonical directory surface', () => {
    expect(source).toContain('hero-shell')
    expect(source).toContain('section-frame')
    expect(source).toContain('search-browse-directory')
  })

  it('does not return to the old route-specific shadow and brand-border treatment', () => {
    expect(source).not.toContain('rounded-2xl border border-brand-900/10 bg-[var(--surface-card)] p-5 shadow-sm')
    expect(source).not.toContain('text-brand-800 hover:underline')
  })

  it('preserves the intentional noindex-follow search policy', () => {
    expect(source).toContain('index: false')
    expect(source).toContain('follow: true')
  })

  it('keeps curated directory links keyboard-visible', () => {
    expect(source).toContain('focus-visible:ring-2')
    expect(source).toContain('Popular searches')
    expect(source).toContain('Research tools')
  })
})
