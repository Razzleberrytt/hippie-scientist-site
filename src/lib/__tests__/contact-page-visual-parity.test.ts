import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(path.join(process.cwd(), 'app', 'info', 'contact', 'page.tsx'), 'utf8')

describe('contact page editorial parity', () => {
  it('uses the canonical trust-page hierarchy', () => {
    expect(source).toContain('hero-shell')
    expect(source).toContain('heading-premium')
    expect(source).toContain('text-reading')
    expect(source).toContain('card-premium')
    expect(source).toContain('section-frame')
    expect(source).toContain('chip-readable')
  })

  it('does not return to hard-coded white/pale/shadow trust panels', () => {
    expect(source).not.toContain('bg-white/90')
    expect(source).not.toContain('bg-brand-50/40')
    expect(source).not.toContain('border-brand-900/10')
    expect(source).not.toContain('shadow-sm')
    expect(source).not.toContain('hover:bg-white')
  })

  it('preserves direct correction and feedback paths', () => {
    expect(source).toContain('Research corrections')
    expect(source).toContain('Technical issues')
    expect(source).toContain('Feature ideas')
    expect(source).toContain('mailto:randolphwillie77@gmail.com')
  })

  it('keeps the personal-guidance boundary explicit', () => {
    expect(source).toContain('it cannot replace individualized professional guidance')
  })

  it('keeps trust links keyboard-visible', () => {
    expect(source).toContain('focus-visible:ring-2')
  })
})
