import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(path.join(process.cwd(), 'app', 'goals', 'page.tsx'), 'utf8')

describe('goals index editorial parity', () => {
  it('uses the canonical page-intro and card system', () => {
    expect(source).toContain('hero-shell')
    expect(source).toContain('heading-premium')
    expect(source).toContain('text-reading')
    expect(source).toContain('card-premium')
  })

  it('keeps the educational boundary visible in the first-screen introduction', () => {
    expect(source).toContain('Educational context only — not medical advice.')
  })

  it('does not reintroduce the old brand-colored card microcopy treatment', () => {
    expect(source).not.toContain('text-brand-700 dark:text-brand-200')
    expect(source).not.toContain('text-brand-800 dark:text-brand-100')
    expect(source).not.toContain('hover:shadow-sm')
  })

  it('keeps cards keyboard-visible and gives each path an explicit action affordance', () => {
    expect(source).toContain('focus-visible:ring-2')
    expect(source).toContain('options compared')
    expect(source).toContain('ArrowRight')
  })
})
