import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const readPage = (name: string) => fs.readFileSync(path.join(process.cwd(), 'app', 'info', name, 'page.tsx'), 'utf8')
const faq = readPage('faq')
const dosing = readPage('dosing')
const safetyChecklist = readPage('supplement-safety-checklist')
const pages = [
  ['FAQ', faq],
  ['dose math', dosing],
  ['safety checklist', safetyChecklist],
] as const

describe('reader guidance page parity', () => {
  it.each(pages)('%s uses the canonical reader-guidance hierarchy', (_name, source) => {
    expect(source).toContain('hero-shell')
    expect(source).toContain('heading-premium')
    expect(source).toContain('text-reading')
    expect(source).toContain("href: '/info/'")
  })

  it.each(pages)('%s does not return to generic white/brand/shadow cards', (_name, source) => {
    expect(source).not.toContain('border-brand-900/10 bg-white/90')
    expect(source).not.toContain('border-brand-900/10 bg-white/85')
    expect(source).not.toContain('bg-white/80')
    expect(source).not.toContain('shadow-sm')
  })

  it('keeps urgent-care and no-medical-advice boundaries visible in FAQ', () => {
    expect(faq).toContain('It is not diagnosis, treatment, or personal medical advice.')
    expect(faq).toContain('Contact a qualified medical professional or emergency service right away.')
  })

  it('keeps dose math explicitly non-personalized and warning-toned', () => {
    expect(dosing).toContain('This tool does not calculate a dose for you.')
    expect(dosing).toContain('without inventing a personalized regimen')
    expect(dosing).toContain('bg-rose-50/60')
    expect(dosing).toContain('⚠️ Safety boundary')
    expect(dosing).toContain('Do not use the arithmetic on this page as a prescription')
    expect(dosing).toContain('DosageCalculatorClient')
  })

  it('keeps the safety checklist educational and monetization-subordinate', () => {
    expect(safetyChecklist).toContain('it is not medical clearance for a product or stack')
    expect(safetyChecklist).toContain('safety context comes before affiliate links')
    expect(safetyChecklist).toContain('uncertainty should stay visible when evidence is limited')
    expect(safetyChecklist).toContain('NewsletterSignup')
    expect(safetyChecklist).toContain('NewsletterCtaBlock')
  })

  it('keeps interactive reader paths keyboard-visible where custom links render', () => {
    expect(faq).toContain('focus-visible:ring-2')
  })
})
