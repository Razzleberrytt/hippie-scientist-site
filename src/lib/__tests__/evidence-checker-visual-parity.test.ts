import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const pageSource = fs.readFileSync(path.join(process.cwd(), 'app', 'evidence', 'evidence-checker', 'page.tsx'), 'utf8')
const clientSource = fs.readFileSync(path.join(process.cwd(), 'app', 'evidence', 'evidence-checker', 'EvidenceLookupClient.tsx'), 'utf8')

describe('evidence checker editorial parity', () => {
  it('uses canonical neutral surfaces for page hierarchy', () => {
    expect(pageSource).toContain('hero-shell')
    expect(pageSource).toContain('heading-premium')
    expect(pageSource).toContain('text-reading')
    expect(pageSource).toContain('section-frame')
  })

  it('keeps evidence-tier colors semantic and distinct', () => {
    expect(clientSource).toContain('bg-emerald-50 border-emerald-200 text-emerald-800')
    expect(clientSource).toContain('bg-blue-50 border-blue-200 text-blue-800')
    expect(clientSource).toContain('bg-amber-50 border-amber-200 text-amber-900')
    expect(clientSource).toContain('bg-slate-50 border-slate-200 text-slate-700')
  })

  it('does not reintroduce hard-coded white neutral lookup surfaces', () => {
    expect(clientSource).not.toContain('border-brand-900/15 bg-white px-4 py-3')
    expect(clientSource).not.toContain('border-brand-900/10 bg-white/70 px-4 py-2.5')
    expect(clientSource).not.toContain('border-brand-900/10 bg-white text-sm')
  })

  it('keeps the no-recommendation interpretation boundary visible', () => {
    expect(pageSource).toContain('They are not a recommendation or a guarantee')
  })

  it('keeps interactive lookup controls keyboard-visible', () => {
    expect(clientSource).toContain('focus-visible:ring-2')
    expect(clientSource).toContain('chip-readable')
  })
})
