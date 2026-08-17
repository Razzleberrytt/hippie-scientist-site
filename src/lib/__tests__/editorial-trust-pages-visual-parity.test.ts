import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const readPage = (name: string) => fs.readFileSync(path.join(process.cwd(), 'app', 'info', name, 'page.tsx'), 'utf8')
const author = readPage('author')
const editorial = readPage('editorial-policy')
const corrections = readPage('corrections')
const pages = [
  ['author', author],
  ['editorial policy', editorial],
  ['corrections', corrections],
] as const

describe('editorial trust-page parity', () => {
  it.each(pages)('%s uses canonical trust hierarchy and the /info parent breadcrumb', (_name, source) => {
    expect(source).toContain('hero-shell')
    expect(source).toContain('heading-premium')
    expect(source).toContain('text-reading')
    expect(source).toContain('card-premium')
    expect(source).toContain("href: '/info/'")
  })

  it.each(pages)('%s does not return to generic white/pale-brand trust panels', (_name, source) => {
    expect(source).not.toContain('border-brand-900/10 bg-white')
    expect(source).not.toContain('bg-brand-50/60')
    expect(source).not.toContain('bg-brand-50/50')
    expect(source).not.toContain('shadow-sm sm:p-8')
  })

  it('keeps the no-credential and evidence-independence boundaries explicit on the author page', () => {
    expect(author).toContain('No implied clinical or academic credential')
    expect(author).toContain('Evidence rankings are not for sale.')
    expect(author).toContain('Supplement companies cannot pay to raise an evidence grade')
  })

  it('preserves distinct semantic evidence-grade colors on the editorial policy', () => {
    expect(editorial).toContain('border-emerald-700/20')
    expect(editorial).toContain('border-blue-700/20')
    expect(editorial).toContain('border-amber-700/20')
    expect(editorial).toContain('border-stone-600/20')
    expect(editorial).toContain('border-slate-500/20')
    expect(editorial).toContain('Safety certainty and efficacy certainty remain separate fields.')
  })

  it('keeps correction before/after meaning semantically distinct', () => {
    expect(corrections).toContain('bg-rose-50')
    expect(corrections).toContain('bg-emerald-50')
    expect(corrections).toContain('History model')
    expect(corrections).toContain('Append-only')
  })

  it('keeps interactive trust links keyboard-visible', () => {
    expect(author).toContain('focus-visible:ring-2')
    expect(editorial).toContain('focus-visible:ring-2')
    expect(corrections).toContain('focus-visible:ring-2')
  })
})
