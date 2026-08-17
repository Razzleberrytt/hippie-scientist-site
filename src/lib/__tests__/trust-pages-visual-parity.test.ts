import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const readPage = (name: string) => fs.readFileSync(path.join(process.cwd(), 'app', 'info', name, 'page.tsx'), 'utf8')
const affiliate = readPage('affiliate-disclosure')
const disclaimer = readPage('disclaimer')

describe('trust page editorial parity', () => {
  it.each([
    ['affiliate disclosure', affiliate],
    ['disclaimer', disclaimer],
  ])('%s uses the canonical trust hierarchy', (_name, source) => {
    expect(source).toContain('hero-shell')
    expect(source).toContain('heading-premium')
    expect(source).toContain('text-reading')
    expect(source).toContain('card-premium')
    expect(source).toContain('section-frame')
    expect(source).toContain('chip-readable')
  })

  it.each([
    ['affiliate disclosure', affiliate],
    ['disclaimer', disclaimer],
  ])('%s does not return to hard-coded white/pale trust panels', (_name, source) => {
    expect(source).not.toContain('bg-white/90')
    expect(source).not.toContain('bg-white/80')
    expect(source).not.toContain('bg-brand-50/60')
    expect(source).not.toContain('shadow-sm')
    expect(source).not.toContain('hover:bg-white')
  })

  it('keeps the editorial-independence boundary explicit on the affiliate page', () => {
    expect(affiliate).toContain('product links do not control the evidence')
    expect(affiliate).toContain('Affiliate revenue does not change safety language, uncertainty language, or evidence grades.')
  })

  it('keeps the educational and professional-guidance boundaries explicit on the disclaimer', () => {
    expect(disclaimer).toContain('Educational context only')
    expect(disclaimer).toContain('No personal diagnosis or treatment')
    expect(disclaimer).toContain('Professional context still matters')
  })
})
